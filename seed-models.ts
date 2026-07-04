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
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    inputCostPer1k: '0.00075',  // $0.075 per 1M tokens = $0.00075 per 1k
    outputCostPer1k: '0.0003',  // $0.30 per 1M tokens = $0.0003 per 1k
    htPer1kInput: '0.5',        // 0.5 HT per 1k input tokens
    htPer1kOutput: '1.0',       // 1.0 HT per 1k output tokens
    markupFactor: '10.0',       // 10x markup
    allowedTiers: ['free', 'standard', 'pro', 'ultimate'],
    isActive: true,
  },
  {
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    displayName: 'Gemini 2.0 Flash (Experimental)',
    inputCostPer1k: '0.0',      // Free during preview
    outputCostPer1k: '0.0',     // Free during preview
    htPer1kInput: '0.3',        // Lower HT cost for experimental
    htPer1kOutput: '0.6',
    markupFactor: '10.0',
    allowedTiers: ['free', 'standard', 'pro', 'ultimate'],
    isActive: true,
  },
  {
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    inputCostPer1k: '0.00125',  // $1.25 per 1M tokens
    outputCostPer1k: '0.005',   // $5.00 per 1M tokens
    htPer1kInput: '2.0',
    htPer1kOutput: '5.0',
    markupFactor: '10.0',
    allowedTiers: ['standard', 'pro', 'ultimate'],
    isActive: true,
  },
  {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    inputCostPer1k: '0.003',    // $3.00 per 1M tokens
    outputCostPer1k: '0.015',   // $15.00 per 1M tokens
    htPer1kInput: '3.0',
    htPer1kOutput: '10.0',
    markupFactor: '10.0',
    allowedTiers: ['pro', 'ultimate'],
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
            ...model,
            updatedAt: new Date(),
            updatedBy: 'seed-script',
          })
          .where(eq(modelConfigs.modelId, model.modelId));
      } else {
        console.log(`+ Inserting model ${model.modelId}...`);
        await db.insert(modelConfigs).values(model);
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

