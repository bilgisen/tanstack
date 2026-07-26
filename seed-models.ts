/**
 * Seed script for model_configs table
 * Run: npx tsx seed-models.ts
 */

import 'dotenv/config';
import { db } from './src/lib/db';
import { modelConfigs } from './src/lib/schema';
import { eq } from 'drizzle-orm';

const models = [
  {
    provider: 'google',
    modelId: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    inputCostPer1k: 0.0003,
    outputCostPer1k: 0.00015,
    htPer1kInput: 0.3,
    htPer1kOutput: 0.5,
    markupFactor: 10.0,
    allowedTiers: ['free'],
    isActive: true,
  },
  {
    provider: 'google',
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    inputCostPer1k: 0.00075,
    outputCostPer1k: 0.0003,
    htPer1kInput: 0.5,
    htPer1kOutput: 1.0,
    markupFactor: 10.0,
    allowedTiers: ['jetabone', 'proabone'],
    isActive: true,
  },
];

async function seedModels() {
  console.log('🌱 Seeding model_configs...');

  for (const model of models) {
    try {
      // Check if model already exists
      const existing = await db
        .select()
        .from(modelConfigs)
        .where(eq(modelConfigs.modelId, model.modelId))
        .limit(1);

      if (existing.length > 0) {
        console.log(`✓ Model ${model.modelId} already exists, updating...`);
        await db
          .update(modelConfigs)
          .set({
            inputCostPer1k: model.inputCostPer1k,
            outputCostPer1k: model.outputCostPer1k,
            htPer1kInput: model.htPer1kInput,
            htPer1kOutput: model.htPer1kOutput,
            markupFactor: model.markupFactor,
            allowedTiers: JSON.stringify(model.allowedTiers),
            isActive: model.isActive,
            updatedAt: new Date(),
            updatedBy: 'seed-script',
          })
          .where(eq(modelConfigs.modelId, model.modelId));
      } else {
        console.log(`+ Inserting model ${model.modelId}...`);
        await db.insert(modelConfigs).values({
          provider: model.provider,
          modelId: model.modelId,
          displayName: model.displayName,
          inputCostPer1k: model.inputCostPer1k,
          outputCostPer1k: model.outputCostPer1k,
          htPer1kInput: model.htPer1kInput,
          htPer1kOutput: model.htPer1kOutput,
          markupFactor: model.markupFactor,
          allowedTiers: JSON.stringify(model.allowedTiers),
          isActive: model.isActive,
        });
      }
    } catch (error) {
      console.error(`✗ Error seeding model ${model.modelId}:`, error);
    }
  }

  console.log('✅ Model seeding complete!');
  process.exit(0);
}

seedModels().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

