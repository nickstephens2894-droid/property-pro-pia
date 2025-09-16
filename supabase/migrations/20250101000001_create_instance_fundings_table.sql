-- Migration: Create instance_fundings table for linking instances with funds
-- This table stores the relationship between property investment instances and funding sources

-- Create instance_fundings table
CREATE TABLE IF NOT EXISTS public.instance_fundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  fund_id UUID NOT NULL, -- Will reference either loan_funds or cash_funds
  fund_type TEXT NOT NULL CHECK (fund_type IN ('loan', 'cash')),
  amount_allocated DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_used DECIMAL(12,2) NOT NULL DEFAULT 0,
  allocation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instance_id, fund_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_instance_fundings_instance_id ON instance_fundings(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_fundings_fund_id ON instance_fundings(fund_id);
CREATE INDEX IF NOT EXISTS idx_instance_fundings_instance_fund ON instance_fundings(instance_id, fund_id);

-- Enable RLS
ALTER TABLE public.instance_fundings ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage instance_fundings via instance ownership
CREATE POLICY "Users can manage instance_fundings via instance ownership" ON public.instance_fundings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = instance_fundings.instance_id AND i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = instance_fundings.instance_id AND i.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER trg_instance_fundings_updated
  BEFORE UPDATE ON public.instance_fundings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.instance_fundings IS 'Links property investment instances with funding sources';
COMMENT ON COLUMN public.instance_fundings.fund_id IS 'References either loan_funds.id or cash_funds.id based on fund_type';
COMMENT ON COLUMN public.instance_fundings.amount_allocated IS 'Amount allocated from the fund to this instance';
COMMENT ON COLUMN public.instance_fundings.amount_used IS 'Amount actually used from the allocated amount';
