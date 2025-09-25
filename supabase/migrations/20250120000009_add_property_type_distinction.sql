-- Migration: Add Property Type Distinction (New vs Current Properties)
-- This migration adds fields to distinguish between new properties to be purchased
-- and current properties already owned, without breaking existing functionality

-- 1. Add property type distinction to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('new', 'current')) DEFAULT 'new';

-- 2. Add historical purchase data fields for current properties
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS original_purchase_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_purchase_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS original_stamp_duty NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_legal_fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_inspection_fees NUMERIC DEFAULT 0;

-- 3. Add current property value field (for current properties)
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS current_property_value NUMERIC DEFAULT 0;

-- 4. Add current loan balance fields (for current properties)
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS current_loan_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_equity_loan_balance NUMERIC DEFAULT 0;

-- 5. Add funding strategy selection field
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS selected_funding_strategy TEXT DEFAULT NULL;

-- 6. Add comments to document the new fields
COMMENT ON COLUMN instances.property_type IS 'Distinguishes between new properties to be purchased and current properties already owned';
COMMENT ON COLUMN instances.original_purchase_price IS 'Original purchase price for current properties (used for tax calculations)';
COMMENT ON COLUMN instances.original_purchase_date IS 'Date of original purchase for current properties';
COMMENT ON COLUMN instances.original_stamp_duty IS 'Original stamp duty paid for current properties';
COMMENT ON COLUMN instances.original_legal_fees IS 'Original legal fees paid for current properties';
COMMENT ON COLUMN instances.original_inspection_fees IS 'Original inspection fees paid for current properties';
COMMENT ON COLUMN instances.current_property_value IS 'Current market value of the property';
COMMENT ON COLUMN instances.current_loan_balance IS 'Current outstanding loan balance';
COMMENT ON COLUMN instances.current_equity_loan_balance IS 'Current outstanding equity loan balance';
COMMENT ON COLUMN instances.selected_funding_strategy IS 'Selected funding strategy for new properties';

-- 7. Create index for property type queries
CREATE INDEX IF NOT EXISTS idx_instances_property_type ON instances(property_type);

-- 8. Update existing records to have default values
UPDATE instances 
SET property_type = 'new' 
WHERE property_type IS NULL;

-- 9. For existing instances, set current_property_value to purchase_price if not set
UPDATE instances 
SET current_property_value = purchase_price 
WHERE current_property_value = 0 AND purchase_price > 0;
