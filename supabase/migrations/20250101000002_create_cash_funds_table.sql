-- Migration: Create cash_funds table for managing cash-based investment funds
-- This table stores cash fund information similar to loan_funds but for cash savings

-- Create cash_funds table
CREATE TABLE IF NOT EXISTS public.cash_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fund_type TEXT NOT NULL DEFAULT 'Savings',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  return_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cash_funds_owner_user_id ON cash_funds(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_cash_funds_fund_type ON cash_funds(fund_type);

-- Enable RLS
ALTER TABLE public.cash_funds ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own cash funds
CREATE POLICY "Users can CRUD their own cash funds" ON public.cash_funds
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Create updated_at trigger
CREATE TRIGGER trg_cash_funds_updated
  BEFORE UPDATE ON public.cash_funds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.cash_funds IS 'Cash-based investment funds for property investments';
COMMENT ON COLUMN public.cash_funds.fund_type IS 'Type of cash fund: Savings, Term Deposits, etc.';
COMMENT ON COLUMN public.cash_funds.total_amount IS 'Total amount in the fund';
COMMENT ON COLUMN public.cash_funds.available_amount IS 'Amount available for allocation (calculated)';
COMMENT ON COLUMN public.cash_funds.return_rate IS 'Expected return rate for the fund';
