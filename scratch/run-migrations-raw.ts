import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  console.log("Starting raw manual migrations in tan/scratch...");

  // 1. Create model_configs
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "model_configs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "provider" text NOT NULL,
        "model_id" text NOT NULL,
        "display_name" text NOT NULL,
        "input_cost_per_1k" numeric(10, 6) NOT NULL,
        "output_cost_per_1k" numeric(10, 6) NOT NULL,
        "ht_per_1k_input" numeric(10, 4) NOT NULL,
        "ht_per_1k_output" numeric(10, 4) NOT NULL,
        "markup_factor" numeric(5, 2) DEFAULT '10.0' NOT NULL,
        "allowed_tiers" text[] NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "effective_from" timestamp DEFAULT now() NOT NULL,
        "updated_by" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "model_configs_model_id_unique" UNIQUE("model_id")
      );
    `;
    console.log("✓ Table model_configs created or already exists.");
  } catch (err) {
    console.error("✗ Failed to create model_configs:", err);
  }

  // 2. Create tariff_history
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "tariff_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "model_id" text NOT NULL,
        "old_ht_input" numeric(10, 4),
        "old_ht_output" numeric(10, 4),
        "new_ht_input" numeric(10, 4) NOT NULL,
        "new_ht_output" numeric(10, 4) NOT NULL,
        "old_markup" numeric(5, 2),
        "new_markup" numeric(5, 2),
        "changed_by" text NOT NULL,
        "changed_at" timestamp DEFAULT now() NOT NULL,
        "note" text,
        CONSTRAINT "tariff_history_model_id_model_configs_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "model_configs"("model_id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `;
    console.log("✓ Table tariff_history created or already exists.");
  } catch (err) {
    console.error("✗ Failed to create tariff_history:", err);
  }

  // 3. Create usage_logs
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "usage_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "model_id" text NOT NULL,
        "input_tokens" integer NOT NULL,
        "output_tokens" integer NOT NULL,
        "ht_charged" integer NOT NULL,
        "actual_cost_usd" numeric(10, 6) NOT NULL,
        "session_id" text,
        "feature_type" text,
        "polar_event_id" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "usage_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `;
    console.log("✓ Table usage_logs created or already exists.");
  } catch (err) {
    console.error("✗ Failed to create usage_logs:", err);
  }

  // 4. Create user_credits
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "user_credits" (
        "user_id" text PRIMARY KEY NOT NULL,
        "tier" text DEFAULT 'free' NOT NULL,
        "monthly_ht" integer DEFAULT 5000 NOT NULL,
        "used_ht" integer DEFAULT 0 NOT NULL,
        "extra_ht" integer DEFAULT 0 NOT NULL,
        "polar_customer_id" text,
        "polar_sub_id" text,
        "reset_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "user_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `;
    console.log("✓ Table user_credits created or already exists.");
  } catch (err) {
    console.error("✗ Failed to create user_credits:", err);
  }

  // 5. Create webhook_events
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "webhook_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "event_id" text NOT NULL,
        "event_type" text NOT NULL,
        "processed_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
      );
    `;
    console.log("✓ Table webhook_events created or already exists.");
  } catch (err) {
    console.error("✗ Failed to create webhook_events:", err);
  }

  // 6. Alter user table to add role
  try {
    await sql`
      ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
    `;
    console.log("✓ Column role added to table user.");
  } catch (err) {
    console.log("• Column role might already exist or table user altered.");
  }

  // 7. Create indexes on usage_logs
  try {
    await sql`CREATE INDEX IF NOT EXISTS "idx_usage_logs_user_id" ON "usage_logs" USING btree ("user_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_usage_logs_created_at" ON "usage_logs" USING btree ("created_at");`;
    console.log("✓ Indexes on usage_logs created.");
  } catch (err) {
    console.error("✗ Failed to create indexes:", err);
  }

  // 8. Create user register trigger for auto user_credits creation
  try {
    await sql`
      CREATE OR REPLACE FUNCTION create_user_credits()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO user_credits (user_id, tier, monthly_ht, reset_at)
        VALUES (NEW.id, 'free', 5000, now() + INTERVAL '1 month')
        ON CONFLICT (user_id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await sql`
      DROP TRIGGER IF EXISTS on_user_created ON "user";
    `;
    await sql`
      CREATE TRIGGER on_user_created
        AFTER INSERT ON "user"
        FOR EACH ROW EXECUTE FUNCTION create_user_credits();
    `;
    console.log("✓ User register trigger established successfully on \"user\" table!");
  } catch (err) {
    console.error("✗ Failed to create trigger:", err);
  }

  // 9. Seed model configs
  try {
    await sql`
      INSERT INTO model_configs 
        (provider, model_id, display_name, input_cost_per_1k, output_cost_per_1k, 
         ht_per_1k_input, ht_per_1k_output, markup_factor, allowed_tiers)
      VALUES
        ('google',    'gemini-2.5-flash',   'Gemini 2.5 Flash',   0.000300, 0.002500,  3.0,  25.0, 10.0, ARRAY['free','standard','pro','ultimate']),
        ('google',    'gemini-2.5-pro',     'Gemini 2.5 Pro',     0.001250, 0.010000, 12.5, 100.0, 10.0, ARRAY['standard','pro','ultimate']),
        ('anthropic', 'claude-haiku-4-5',   'Claude Haiku 4.5',   0.001000, 0.005000, 10.0,  50.0, 10.0, ARRAY['pro','ultimate']),
        ('anthropic', 'claude-sonnet-4-6',  'Claude Sonnet 4.6',  0.003000, 0.015000, 30.0, 150.0, 10.0, ARRAY['pro','ultimate']),
        ('deepseek',  'deepseek-v3',        'DeepSeek V3',        0.000140, 0.000280,  1.4,   2.8, 10.0, ARRAY['standard','pro','ultimate'])
      ON CONFLICT (model_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        display_name = EXCLUDED.display_name,
        input_cost_per_1k = EXCLUDED.input_cost_per_1k,
        output_cost_per_1k = EXCLUDED.output_cost_per_1k,
        ht_per_1k_input = EXCLUDED.ht_per_1k_input,
        ht_per_1k_output = EXCLUDED.ht_per_1k_output,
        markup_factor = EXCLUDED.markup_factor,
        allowed_tiers = EXCLUDED.allowed_tiers;
    `;
    console.log("✓ Model configurations seeded successfully!");
  } catch (err) {
    console.error("✗ Failed to seed model configurations:", err);
  }

  // 10. Set an initial admin role for any existing user (e.g. for testing)
  try {
    const existingUsers = await sql`SELECT id, email FROM "user" LIMIT 5;`;
    console.log("Existing users:", existingUsers);
  } catch (e) {}

  await sql.end();
  console.log("Manual migrations completed successfully!");
}

main().catch((err) => {
  console.error("Manual migration script crashed:", err);
  process.exit(1);
});
