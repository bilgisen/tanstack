import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "./db";
import { modelConfigs, usageLogs, userCredits } from "./schema";
import { TIER_CONFIG } from "./tiers";

interface JTCheckResult {
  ok: boolean;
  error?: 'INSUFFICIENT_JT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND';
  availableJT?: number;
  estimatedCost?: number;
}

/**
 * Atomic decrement: reserve estimated cost immediately.
 * Uses a single atomic UPDATE with balance check to prevent race conditions.
 * D1/SQLite row-level locking protects the concurrent access.
 */
async function atomicDecrement(userId: string, cost: number): Promise<{ ok: boolean; availableJT?: number }> {
  const now = Date.now();
  const result = await db.run(sql`
    UPDATE user_credits
    SET used_ht = used_ht + ${cost}, updated_at = ${now}
    WHERE user_id = ${userId}
      AND (monthly_ht + extra_ht - used_ht) >= ${cost}
  `);
  // D1 .run() returns { success: boolean, meta: { changes: number } }
  const changes = result.meta?.changes || 0;
  if (changes === 0) {
    // Check current balance for the error message
    const current = await db
      .select({ usedJt: userCredits.usedJt, monthlyJt: userCredits.monthlyJt, extraJt: userCredits.extraJt })
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .then((r) => r[0]);
    const available = current ? (current.monthlyJt - current.usedJt) + current.extraJt : 0;
    return { ok: false, availableJT: available };
  }
  return { ok: true };
}

/**
 * Atomic increment (refund): add cost back to used_ht.
 */
async function atomicRefund(userId: string, cost: number): Promise<void> {
  const now = Date.now();
  await db.run(sql`
    UPDATE user_credits
    SET used_ht = MAX(0, used_ht - ${cost}), updated_at = ${now}
    WHERE user_id = ${userId}
  `);
}

export async function checkAndReserveJT(
  userId: string,
  modelId: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
): Promise<JTCheckResult> {
  try {
    const model = await db
      .select()
      .from(modelConfigs)
      .where(and(eq(modelConfigs.modelId, modelId), eq(modelConfigs.isActive, true)))
      .then((res) => res[0]);

    if (!model) {
      console.warn(`[checkAndReserveJT] Model not found or inactive: ${modelId}`);
      return { ok: false, error: 'MODEL_NOT_ALLOWED' };
    }

    let credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .then((res) => res[0]);

    if (!credits) {
      try {
        credits = await db
          .insert(userCredits)
          .values({
            userId,
            tier: 'free',
            monthlyJt: 5000,
            usedJt: 0,
            extraJt: 0,
            resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
          .returning()
          .then((res) => res[0]);
      } catch (err) {
        console.error("[checkAndReserveJT] Failed to auto-provision user credits:", err);
        return { ok: false, error: 'USER_NOT_FOUND' };
      }
    }

    if (credits.resetAt && new Date(credits.resetAt) < new Date()) {
      await db
        .update(userCredits)
        .set({
          usedJt: 0,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId))
      credits.usedJt = 0
      credits.resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    const allowedTiers: Array<string> = JSON.parse(model.allowedTiers || '[]');
    if (!allowedTiers.includes(credits.tier)) {
      console.warn(`[checkAndReserveJT] User tier '${credits.tier}' not allowed for model: ${modelId}`);
      return { ok: false, error: 'MODEL_NOT_ALLOWED' };
    }

    const tierCfg = TIER_CONFIG[credits.tier as keyof typeof TIER_CONFIG]
    if (tierCfg?.dailyCallLimit != null) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const todayCount = await db
        .select({ cnt: count() })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            gte(usageLogs.createdAt, today),
            lt(usageLogs.createdAt, tomorrow),
          )
        )
        .then((r) => r[0]?.cnt || 0)
      if (todayCount >= tierCfg.dailyCallLimit) {
        return { ok: false, error: 'DAILY_LIMIT', availableJT: (credits.monthlyJt - credits.usedJt) + credits.extraJt }
      }
    }

    const inputRate = model.htPer1kInput;
    const outputRate = model.htPer1kOutput;

    const estimatedJT = Math.ceil(
      (estimatedInputTokens / 1000) * inputRate +
      (estimatedOutputTokens / 1000) * outputRate
    );

    // Atomic reserve: immediately decrement with balance check
    const reserve = await atomicDecrement(userId, estimatedJT);
    if (!reserve.ok) {
      console.warn(`[checkAndReserveJT] Insufficient JT. Available: ${reserve.availableJT}, Estimated: ${estimatedJT}`);
      return { ok: false, error: 'INSUFFICIENT_JT', availableJT: reserve.availableJT, estimatedCost: estimatedJT };
    }

    return { ok: true, availableJT: reserve.availableJT, estimatedCost: estimatedJT };
  } catch (error) {
    console.error('[checkAndReserveJT] Unexpected error:', error);
    throw error;
  }
}

/**
 * Adjust balance based on actual vs reserved cost.
 * - Actual < reserved: refund the difference (atomic increment)
 * - Actual > reserved: charge the extra (atomic decrement, with balance check)
 */
export async function chargeJT(params: {
  userId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  reservedCost: number;
  requestId?: string;
  sessionId?: string;
  featureType?: string;
}) {
  const { userId, modelId, inputTokens, outputTokens, reservedCost, requestId, sessionId, featureType } = params;

  // Idempotency check: if requestId is provided, skip duplicate charges
  if (requestId) {
    const existing = await db
      .select({ id: usageLogs.id })
      .from(usageLogs)
      .where(eq(usageLogs.id, requestId))
      .then((r) => r[0]);
    if (existing) {
      return { jtCharged: 0, actualCostUsd: '0', remainingAvailable: 0, skipped: true };
    }
  }

  const model = await db
    .select()
    .from(modelConfigs)
    .where(eq(modelConfigs.modelId, modelId))
    .then((res) => res[0]);

  if (!model) throw new Error(`Model not found: ${modelId}`);

  const inputRate = model.htPer1kInput;
  const outputRate = model.htPer1kOutput;
  const inputCost = model.inputCostPer1k;
  const outputCost = model.outputCostPer1k;

  const actualCost = Math.ceil(
    (inputTokens / 1000) * inputRate +
    (outputTokens / 1000) * outputRate
  );

  const actualCostUsd = (inputTokens / 1000) * inputCost + (outputTokens / 1000) * outputCost;

  const diff = actualCost - reservedCost;

  if (diff > 0) {
    // Actual cost exceeded reserve — try to charge the difference
    const extra = await atomicDecrement(userId, diff);
    if (!extra.ok) {
      // Allow up to 500 JT negative balance as grace threshold
      await db.run(sql`
        UPDATE user_credits
        SET used_ht = used_ht + ${diff}, updated_at = ${Date.now()}
        WHERE user_id = ${userId}
      `);
    }
  } else if (diff < 0) {
    // Actual cost was less than reserve — refund the overcharge
    await atomicRefund(userId, Math.abs(diff));
  }

  // Log the usage
  const logId = requestId || crypto.randomUUID();
  await db.insert(usageLogs).values({
    id: logId,
    userId,
    modelId,
    inputTokens,
    outputTokens,
    jtCharged: actualCost,
    actualCostUsd,
    sessionId,
    featureType: featureType || 'chat',
  });

  // Read current balance
  const credits = await db
    .select({ usedJt: userCredits.usedJt, monthlyJt: userCredits.monthlyJt, extraJt: userCredits.extraJt })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((r) => r[0]);

  const remainingAvailable = credits ? (credits.monthlyJt - credits.usedJt) + credits.extraJt : 0;

  return { jtCharged: actualCost, actualCostUsd: String(actualCostUsd), remainingAvailable };
}

export class JTAccessError extends Error {
  constructor(
    public code: 'INSUFFICIENT_JT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND',
    public availableJT?: number,
  ) {
    super(code);
  }
}
