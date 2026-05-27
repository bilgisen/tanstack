CREATE TABLE "model_configs" (
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
--> statement-breakpoint
CREATE TABLE "tariff_history" (
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
	"note" text
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
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
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"user_id" text PRIMARY KEY NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"monthly_ht" integer DEFAULT 5000 NOT NULL,
	"used_ht" integer DEFAULT 0 NOT NULL,
	"extra_ht" integer DEFAULT 0 NOT NULL,
	"polar_customer_id" text,
	"polar_sub_id" text,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff_history" ADD CONSTRAINT "tariff_history_model_id_model_configs_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model_configs"("model_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usage_logs_user_id" ON "usage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_usage_logs_created_at" ON "usage_logs" USING btree ("created_at");