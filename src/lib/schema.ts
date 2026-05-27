import { pgTable, text, timestamp, boolean, integer, uuid, decimal, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const modelConfigs = pgTable("model_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(), // 'google' | 'anthropic' | 'deepseek'
  modelId: text("model_id").notNull().unique(), // e.g. 'gemini-2.5-flash'
  displayName: text("display_name").notNull(),
  inputCostPer1k: decimal("input_cost_per_1k", { precision: 10, scale: 6 }).notNull(),
  outputCostPer1k: decimal("output_cost_per_1k", { precision: 10, scale: 6 }).notNull(),
  htPer1kInput: decimal("ht_per_1k_input", { precision: 10, scale: 4 }).notNull(),
  htPer1kOutput: decimal("ht_per_1k_output", { precision: 10, scale: 4 }).notNull(),
  markupFactor: decimal("markup_factor", { precision: 5, scale: 2 }).default("10.0").notNull(),
  allowedTiers: text("allowed_tiers").array().notNull(), // ['free', 'standard', 'pro', 'ultimate']
  isActive: boolean("is_active").default(true).notNull(),
  effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tariffHistory = pgTable("tariff_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: text("model_id").notNull().references(() => modelConfigs.modelId),
  oldHtInput: decimal("old_ht_input", { precision: 10, scale: 4 }),
  oldHtOutput: decimal("old_ht_output", { precision: 10, scale: 4 }),
  newHtInput: decimal("new_ht_input", { precision: 10, scale: 4 }).notNull(),
  newHtOutput: decimal("new_ht_output", { precision: 10, scale: 4 }).notNull(),
  oldMarkup: decimal("old_markup", { precision: 5, scale: 2 }),
  newMarkup: decimal("new_markup", { precision: 5, scale: 2 }),
  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  note: text("note"),
});

export const userCredits = pgTable("user_credits", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  tier: text("tier").default("free").notNull(), // 'free' | 'standard' | 'pro' | 'ultimate'
  monthlyHt: integer("monthly_ht").default(5000).notNull(),
  usedHt: integer("used_ht").default(0).notNull(),
  extraHt: integer("extra_ht").default(0).notNull(),
  polarCustomerId: text("polar_customer_id"),
  polarSubId: text("polar_sub_id"),
  resetAt: timestamp("reset_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  htCharged: integer("ht_charged").notNull(),
  actualCostUsd: decimal("actual_cost_usd", { precision: 10, scale: 6 }).notNull(),
  sessionId: text("session_id"),
  featureType: text("feature_type"), // 'chat' | 'report' | 'screener' | 'macro'
  polarEventId: text("polar_event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_usage_logs_user_id").on(table.userId),
  index("idx_usage_logs_created_at").on(table.createdAt)
]);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});
