-- Add fund_category column to loan_funds table
-- This migration adds the fund_category field to support Cash/Debt categorization

-- Add fund_category column to loan_funds table
ALTER TABLE loan_funds 
ADD COLUMN IF NOT EXISTS fund_category TEXT CHECK (fund_category IN ('Cash', 'Debt')) DEFAULT 'Debt';

-- Add comment for the new field
COMMENT ON COLUMN loan_funds.fund_category IS 'Fund category: Cash or Debt';

-- Update existing records to have 'Debt' as default category
UPDATE loan_funds SET fund_category = 'Debt' WHERE fund_category IS NULL;
