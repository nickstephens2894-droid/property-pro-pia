-- Migration: Add missing columns to instances table
-- This migration adds missing fields that are being sent from AddInstance.tsx

-- Add equity_at_year_to field to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS equity_at_year_to NUMERIC DEFAULT 0;

-- Add weekly_after_tax_cash_flow_summary field to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS weekly_after_tax_cash_flow_summary NUMERIC DEFAULT 0;

-- Add tax_benefit_from_projections field to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS tax_benefit_from_projections NUMERIC DEFAULT 0;

-- Add property_workflow_type field to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS property_workflow_type TEXT CHECK (property_workflow_type IN ('new', 'current')) DEFAULT 'new';

-- Add current property data fields to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS current_property_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_loan_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_equity_loan_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_purchase_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_purchase_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS original_stamp_duty NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_legal_fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_inspection_fees NUMERIC DEFAULT 0;

-- Add essential funding fields to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_funding_strategy TEXT DEFAULT NULL;

-- Add property_model_id field to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS property_model_id UUID DEFAULT NULL;

-- Add comments to document the new fields
COMMENT ON COLUMN instances.equity_at_year_to IS 'Equity at year to for instances';
COMMENT ON COLUMN instances.weekly_after_tax_cash_flow_summary IS 'Weekly after tax cash flow summary for instances';
COMMENT ON COLUMN instances.tax_benefit_from_projections IS 'Tax benefit from projections for instances';
COMMENT ON COLUMN instances.property_workflow_type IS 'Property workflow type (new or current) for instances';
COMMENT ON COLUMN instances.current_property_value IS 'Current property value for instances';
COMMENT ON COLUMN instances.current_loan_balance IS 'Current loan balance for instances';
COMMENT ON COLUMN instances.current_equity_loan_balance IS 'Current equity loan balance for instances';
COMMENT ON COLUMN instances.original_purchase_price IS 'Original purchase price for instances';
COMMENT ON COLUMN instances.original_purchase_date IS 'Original purchase date for instances';
COMMENT ON COLUMN instances.original_stamp_duty IS 'Original stamp duty for instances';
COMMENT ON COLUMN instances.original_legal_fees IS 'Original legal fees for instances';
COMMENT ON COLUMN instances.original_inspection_fees IS 'Original inspection fees for instances';
COMMENT ON COLUMN instances.deposit_amount IS 'Deposit amount for instances';
COMMENT ON COLUMN instances.selected_funding_strategy IS 'Selected funding strategy for instances';
COMMENT ON COLUMN instances.property_model_id IS 'Property model ID for instances';
