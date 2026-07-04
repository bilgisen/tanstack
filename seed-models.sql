-- Seed model_configs table
-- Run this SQL directly in your PostgreSQL database

-- Insert Gemini 2.5 Flash (Primary model for free tier)
INSERT INTO model_configs (
  provider, model_id, display_name, 
  input_cost_per_1k, output_cost_per_1k,
  ht_per_1k_input, ht_per_1k_output,
  markup_factor, allowed_tiers, is_active
) VALUES (
  'google', 'gemini-2.5-flash', 'Gemini 2.5 Flash',
  0.00075, 0.0003,
  0.5, 1.0,
  10.0, ARRAY['free', 'standard', 'pro', 'ultimate'], true
)
ON CONFLICT (model_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  ht_per_1k_input = EXCLUDED.ht_per_1k_input,
  ht_per_1k_output = EXCLUDED.ht_per_1k_output,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert Gemini 2.0 Flash Experimental
INSERT INTO model_configs (
  provider, model_id, display_name,
  input_cost_per_1k, output_cost_per_1k,
  ht_per_1k_input, ht_per_1k_output,
  markup_factor, allowed_tiers, is_active
) VALUES (
  'google', 'gemini-2.0-flash-exp', 'Gemini 2.0 Flash (Experimental)',
  0.0, 0.0,
  0.3, 0.6,
  10.0, ARRAY['free', 'standard', 'pro', 'ultimate'], true
)
ON CONFLICT (model_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  ht_per_1k_input = EXCLUDED.ht_per_1k_input,
  ht_per_1k_output = EXCLUDED.ht_per_1k_output,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert Gemini 1.5 Pro (Premium model)
INSERT INTO model_configs (
  provider, model_id, display_name,
  input_cost_per_1k, output_cost_per_1k,
  ht_per_1k_input, ht_per_1k_output,
  markup_factor, allowed_tiers, is_active
) VALUES (
  'google', 'gemini-1.5-pro', 'Gemini 1.5 Pro',
  0.00125, 0.005,
  2.0, 5.0,
  10.0, ARRAY['standard', 'pro', 'ultimate'], true
)
ON CONFLICT (model_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  ht_per_1k_input = EXCLUDED.ht_per_1k_input,
  ht_per_1k_output = EXCLUDED.ht_per_1k_output,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert Claude 3.5 Sonnet (Premium model)
INSERT INTO model_configs (
  provider, model_id, display_name,
  input_cost_per_1k, output_cost_per_1k,
  ht_per_1k_input, ht_per_1k_output,
  markup_factor, allowed_tiers, is_active
) VALUES (
  'anthropic', 'claude-3-5-sonnet', 'Claude 3.5 Sonnet',
  0.003, 0.015,
  3.0, 10.0,
  10.0, ARRAY['pro', 'ultimate'], true
)
ON CONFLICT (model_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  ht_per_1k_input = EXCLUDED.ht_per_1k_input,
  ht_per_1k_output = EXCLUDED.ht_per_1k_output,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify inserted models
SELECT model_id, display_name, is_active, allowed_tiers FROM model_configs ORDER BY model_id;

