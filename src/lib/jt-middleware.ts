import { db } from "./db";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { modelConfigs, userCredits, usageLogs } from "./schema";
import { TIER_CONFIG } from "./tiers";

interface JTCheckResult {
  ok: boolean;
  error?: 'INSUFFICIENT_JT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND';
  availableJT?: number;
  estimatedCost?: number;
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

    const allowedTiers: string[] = JSON.parse(model.allowedTiers || '[]');
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
            sql`${usageLogs.createdAt} < ${tomorrow}`,
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

    const availableJT = (credits.monthlyJt - credits.usedJt) + credits.extraJt;

    if (availableJT < estimatedJT) {
      console.warn(`[checkAndReserveJT] Insufficient JT. Available: ${availableJT}, Estimated: ${estimatedJT}`);
      return { ok: false, error: 'INSUFFICIENT_JT', availableJT, estimatedCost: estimatedJT };
    }

    return { ok: true, availableJT, estimatedCost: estimatedJT };
  } catch (error) {
    console.error('[checkAndReserveJT] Unexpected error:', error);
    throw error;
  }
}

export async function chargeJT(params: {
  userId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  sessionId?: string;
  featureType?: string;
}) {
  const { userId, modelId, inputTokens, outputTokens, sessionId, featureType } = params;

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

  const jtCharged = Math.ceil(
    (inputTokens / 1000) * inputRate +
    (outputTokens / 1000) * outputRate
  );

  const actualCostUsd = (inputTokens / 1000) * inputCost + (outputTokens / 1000) * outputCost;

  let credits = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((res) => res[0]);

  if (!credits) throw new Error(`Credits not found for user: ${userId}`);

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

  let newExtraJT = credits.extraJt;
  let jtToCharge = jtCharged;

  if (newExtraJT >= jtToCharge) {
    newExtraJT -= jtToCharge;
    jtToCharge = 0;
  } else {
    jtToCharge -= newExtraJT;
    newExtraJT = 0;
  }

  const newUsedJt = credits.usedJt + jtToCharge;

  await db.transaction(async (tx) => {
    await tx
      .update(userCredits)
      .set({
        usedJt: newUsedJt,
        extraJt: newExtraJT,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    await tx.insert(usageLogs).values({
      userId,
      modelId,
      inputTokens,
      outputTokens,
      jtCharged,
      actualCostUsd,
      sessionId,
      featureType: featureType || 'chat',
    });
  });

  return { jtCharged, actualCostUsd: String(actualCostUsd), remainingAvailable: (credits.monthlyJt - newUsedJt) + newExtraJT };
}

export class JTAccessError extends Error {
  constructor(
    public code: 'INSUFFICIENT_JT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND',
    public availableJT?: number,
  ) {
    super(code);
  }
}
