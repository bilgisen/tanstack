import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const modelConfigs = sqliteTable("model_configs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  provider: text("provider").notNull(),
  modelId: text("model_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  inputCostPer1k: real("input_cost_per_1k").notNull(),
  outputCostPer1k: real("output_cost_per_1k").notNull(),
  htPer1kInput: real("ht_per_1k_input").notNull(),
  htPer1kOutput: real("ht_per_1k_output").notNull(),
  markupFactor: real("markup_factor").default(10.0).notNull(),
  allowedTiers: text("allowed_tiers").notNull().default('["free"]'),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  effectiveFrom: integer("effective_from", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedBy: text("updated_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const tariffHistory = sqliteTable("tariff_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  modelId: text("model_id").notNull().references(() => modelConfigs.modelId),
  oldHtInput: real("old_ht_input"),
  oldHtOutput: real("old_ht_output"),
  newHtInput: real("new_ht_input").notNull(),
  newHtOutput: real("new_ht_output").notNull(),
  oldMarkup: real("old_markup"),
  newMarkup: real("new_markup"),
  changedBy: text("changed_by").notNull(),
  changedAt: integer("changed_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  note: text("note"),
});

export const userCredits = sqliteTable("user_credits", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  tier: text("tier").default("free").notNull(),
  monthlyJt: integer("monthly_ht").default(5000).notNull(),
  usedJt: integer("used_ht").default(0).notNull(),
  extraJt: integer("extra_ht").default(0).notNull(),
  polarCustomerId: text("polar_customer_id"),
  polarSubId: text("polar_sub_id"),
  polarSubStatus: text("polar_sub_status"),
  polarSubCurrentPeriodEnd: integer("polar_sub_current_period_end", { mode: "timestamp" }),
  resetAt: integer("reset_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const usageLogs = sqliteTable("usage_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  jtCharged: integer("ht_charged").notNull(),
  actualCostUsd: real("actual_cost_usd").notNull(),
  sessionId: text("session_id"),
  featureType: text("feature_type"),
  polarEventId: text("polar_event_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index("idx_usage_logs_user_id").on(table.userId),
  index("idx_usage_logs_created_at").on(table.createdAt)
]);

export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  ticker: text("ticker"),
  context: text("context"),
  title: text("title"),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("idx_chat_sessions_user_id").on(table.userId),
  index("idx_chat_sessions_updated_at").on(table.updatedAt)
]);

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  text: text("text").notNull(),
  context: text("context"),
  suggestions: text("suggestions"),
  widget: text("widget"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index("idx_chat_messages_session_id").on(table.sessionId),
  index("idx_chat_messages_created_at").on(table.createdAt)
]);

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});
