-- Add fund_category column to cash_funds table
-- This migration adds the fund_category field to support Cash/Debt categorization

-- Add fund_category column to cash_funds table
ALTER TABLE cash_funds 
ADD COLUMN IF NOT EXISTS fund_category TEXT CHECK (fund_category IN ('Cash', 'Debt')) DEFAULT 'Cash';

-- Add comment for the new field
COMMENT ON COLUMN cash_funds.fund_category IS 'Fund category: Cash or Debt';

-- Update existing records to have 'Cash' as default category
UPDATE cash_funds SET fund_category = 'Cash' WHERE fund_category IS NULL;
