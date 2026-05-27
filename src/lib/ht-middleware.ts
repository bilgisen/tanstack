import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { modelConfigs, userCredits, usageLogs } from "./schema";

interface HTCheckResult {
  ok: boolean;
  error?: 'INSUFFICIENT_HT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND';
  availableHT?: number;
  estimatedCost?: number;
}

// BEFORE LLM CALL: Check if user has enough HT and has permission for this model
export async function checkAndReserveHT(
  userId: string,
  modelId: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
): Promise<HTCheckResult> {
  // 1. Get model config
  const model = await db
    .select()
    .from(modelConfigs)
    .where(and(eq(modelConfigs.modelId, modelId), eq(modelConfigs.isActive, true)))
    .then((res: any[]) => res[0]);

  if (!model) return { ok: false, error: 'MODEL_NOT_ALLOWED' };

  // 2. Get user credits (with auto-provision fallback)
  let credits = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((res: any[]) => res[0]);

  if (!credits) {
    try {
      credits = await db
        .insert(userCredits)
        .values({
          userId,
          tier: 'free',
          monthlyHt: 5000,
          usedHt: 0,
          extraHt: 0,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning()
        .then((res: any[]) => res[0]);
    } catch (err) {
      console.error("Failed to auto-provision user credits:", err);
      return { ok: false, error: 'USER_NOT_FOUND' };
    }
  }

  // 3. Check if user's tier has access to this model
  const allowedTiers = model.allowedTiers || [];
  if (!allowedTiers.includes(credits.tier)) {
    return { ok: false, error: 'MODEL_NOT_ALLOWED' };
  }

  // 4. Calculate estimated HT cost
  const inputRate = parseFloat(model.htPer1kInput);
  const outputRate = parseFloat(model.htPer1kOutput);
  
  const estimatedHT = Math.ceil(
    (estimatedInputTokens / 1000) * inputRate +
    (estimatedOutputTokens / 1000) * outputRate
  );

  // 5. Calculate total available HT
  const availableHT = (credits.monthlyHt - credits.usedHt) + credits.extraHt;

  if (availableHT < estimatedHT) {
    return { ok: false, error: 'INSUFFICIENT_HT', availableHT, estimatedCost: estimatedHT };
  }

  return { ok: true, availableHT, estimatedCost: estimatedHT };
}

// AFTER LLM CALL: Deduct HT based on actual token usage and log the transaction
export async function chargeHT(params: {
  userId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  sessionId?: string;
  featureType?: string;
}) {
  const { userId, modelId, inputTokens, outputTokens, sessionId, featureType } = params;

  // 1. Get model config
  const model = await db
    .select()
    .from(modelConfigs)
    .where(eq(modelConfigs.modelId, modelId))
    .then((res: any[]) => res[0]);

  if (!model) throw new Error(`Model not found: ${modelId}`);

  const inputRate = parseFloat(model.htPer1kInput);
  const outputRate = parseFloat(model.htPer1kOutput);
  const inputCost = parseFloat(model.inputCostPer1k);
  const outputCost = parseFloat(model.outputCostPer1k);

  // 2. Calculate actual HT charge
  const htCharged = Math.ceil(
    (inputTokens / 1000) * inputRate +
    (outputTokens / 1000) * outputRate
  );

  // 3. Calculate actual USD cost for internal tracking
  const actualCostUsd = String(
    (inputTokens / 1000) * inputCost +
    (outputTokens / 1000) * outputCost
  );

  // 4. Retrieve current user credits
  const credits = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((res: any[]) => res[0]);

  if (!credits) throw new Error(`Credits not found for user: ${userId}`);

  let newExtraHT = credits.extraHt;
  let htToCharge = htCharged;

  // Extra HT gets depleted first, then monthly balance
  if (newExtraHT >= htToCharge) {
    newExtraHT -= htToCharge;
    htToCharge = 0;
  } else {
    htToCharge -= newExtraHT;
    newExtraHT = 0;
  }

  const newUsedHt = credits.usedHt + htToCharge;

  // Update credits and write usage logs
  await db.transaction(async (tx: any) => {
    await tx
      .update(userCredits)
      .set({
        usedHt: newUsedHt,
        extraHt: newExtraHT,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    await tx.insert(usageLogs).values({
      userId,
      modelId,
      inputTokens,
      outputTokens,
      htCharged,
      actualCostUsd,
      sessionId,
      featureType: featureType || 'chat',
    });
  });

  return { htCharged, actualCostUsd, remainingAvailable: (credits.monthlyHt - newUsedHt) + newExtraHT };
}
export class LLMAccessError extends Error {
  constructor(
    public code: 'INSUFFICIENT_HT' | 'MODEL_NOT_ALLOWED' | 'DAILY_LIMIT' | 'USER_NOT_FOUND',
    public availableHT?: number,
  ) {
    super(code);
  }
}
