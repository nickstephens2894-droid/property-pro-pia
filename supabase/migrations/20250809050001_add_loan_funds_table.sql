-- Migration: Add loan_funds table for storing loan fund data
-- This table stores all the loan fund information from the Funds page loan form

-- Create loan_funds table
CREATE TABLE IF NOT EXISTS public.loan_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Construction Details
  construction_period INTEGER NOT NULL DEFAULT 9,
  construction_interest_rate NUMERIC NOT NULL DEFAULT 7.5,
  progress_payment_weeks INTEGER NOT NULL DEFAULT 4,
  progress_payment_percentage NUMERIC NOT NULL DEFAULT 5,
  progress_payment_description TEXT NOT NULL DEFAULT '4 Weeks - 5% of construction price',
  
  -- Financing
  loan_balance NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  loan_term INTEGER NOT NULL DEFAULT 30,
  loan_type TEXT NOT NULL DEFAULT 'IO,P&I',
  io_term INTEGER NOT NULL DEFAULT 5,
  loan_purpose TEXT NOT NULL DEFAULT 'Investment Mortgage',
  funds_type TEXT NOT NULL DEFAULT 'Savings',
  fund_amount NUMERIC NOT NULL DEFAULT 0,
  fund_return NUMERIC NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_funds ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own loan funds
CREATE POLICY "Users can CRUD their own loan funds" ON public.loan_funds
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Create updated_at trigger
CREATE TRIGGER trg_loan_funds_updated
  BEFORE UPDATE ON public.loan_funds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.loan_funds IS 'Loan fund information for property investments';
COMMENT ON COLUMN public.loan_funds.progress_payment_description IS 'Customizable description for progress payment schedule';
COMMENT ON COLUMN public.loan_funds.loan_type IS 'IO,P&I, IO, or P&I';
COMMENT ON COLUMN public.loan_funds.funds_type IS 'Savings, Term Deposits, Redraw, or Offset';
