import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
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
