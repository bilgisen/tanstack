import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle-sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: ".wrangler/state/d1/DB.sqlite",
  },
  tablesFilter: [
    "user",
    "session",
    "account",
    "verification",
    "model_configs",
    "tariff_history",
    "user_credits",
    "usage_logs",
    "webhook_events"
  ],
});
