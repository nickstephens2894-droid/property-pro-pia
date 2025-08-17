-- Migration: Add non_taxable_income field to investors table
-- This field will store income that is not subject to tax

-- Add the new column to the investors table
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS non_taxable_income NUMERIC NOT NULL DEFAULT 0;

-- Add a comment to document the field
COMMENT ON COLUMN public.investors.non_taxable_income IS 'Income that is not subject to tax (e.g., certain government benefits, tax-free investments)';

-- Update existing records to have 0 as default value
UPDATE public.investors 
SET non_taxable_income = 0 
WHERE non_taxable_income IS NULL;
