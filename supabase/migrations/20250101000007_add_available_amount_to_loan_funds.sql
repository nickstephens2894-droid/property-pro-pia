-- Migration: Add available_amount column to loan_funds table
-- This ensures loan_funds has the same available_amount tracking as cash_funds

-- Add available_amount column to loan_funds table
ALTER TABLE public.loan_funds 
ADD COLUMN IF NOT EXISTS available_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Update existing loan_funds to set available_amount = fund_amount initially
UPDATE public.loan_funds 
SET available_amount = fund_amount 
WHERE available_amount = 0;

-- Add comment
COMMENT ON COLUMN public.loan_funds.available_amount IS 'Amount available for allocation (calculated from fund_amount - allocated amounts)';
