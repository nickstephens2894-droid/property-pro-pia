-- Migration: Add Property Workflow Type to Property Models
-- This migration adds the propertyWorkflowType field to the property_models table
-- to distinguish between new properties to be purchased and current properties already owned

-- 1. Add property workflow type field to property_models table
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS property_workflow_type TEXT CHECK (property_workflow_type IN ('new', 'current')) DEFAULT 'new';

-- 2. Add historical purchase data fields for current properties
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS original_purchase_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_purchase_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS original_stamp_duty NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_legal_fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_inspection_fees NUMERIC DEFAULT 0;

-- 3. Add current property value field (for current properties)
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS current_property_value NUMERIC DEFAULT 0;

-- 4. Add current loan balance fields (for current properties)
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS current_loan_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_equity_loan_balance NUMERIC DEFAULT 0;

-- 5. Add funding strategy selection field
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS selected_funding_strategy TEXT DEFAULT NULL;

-- 6. Add deposit amount field (for new properties)
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;

-- 7. Add comments to document the new fields
COMMENT ON COLUMN property_models.property_workflow_type IS 'Distinguishes between new properties to be purchased and current properties already owned';
COMMENT ON COLUMN property_models.original_purchase_price IS 'Original purchase price for current properties (used for tax calculations)';
COMMENT ON COLUMN property_models.original_purchase_date IS 'Date of original purchase for current properties';
COMMENT ON COLUMN property_models.original_stamp_duty IS 'Original stamp duty paid for current properties';
COMMENT ON COLUMN property_models.original_legal_fees IS 'Original legal fees paid for current properties';
COMMENT ON COLUMN property_models.original_inspection_fees IS 'Original inspection fees paid for current properties';
COMMENT ON COLUMN property_models.current_property_value IS 'Current market value of the property';
COMMENT ON COLUMN property_models.current_loan_balance IS 'Current outstanding loan balance';
COMMENT ON COLUMN property_models.current_equity_loan_balance IS 'Current outstanding equity loan balance';
COMMENT ON COLUMN property_models.selected_funding_strategy IS 'Selected funding strategy for new properties';
COMMENT ON COLUMN property_models.deposit_amount IS 'Cash deposit amount for new properties';

-- 8. Create index for property workflow type queries
CREATE INDEX IF NOT EXISTS idx_property_models_property_workflow_type ON property_models(property_workflow_type);

-- 9. Update existing records to have default values
UPDATE property_models 
SET property_workflow_type = 'new' 
WHERE property_workflow_type IS NULL;

-- 10. For existing property models, set current_property_value to purchase_price if not set
UPDATE property_models 
SET current_property_value = purchase_price 
WHERE current_property_value = 0 AND purchase_price > 0;
