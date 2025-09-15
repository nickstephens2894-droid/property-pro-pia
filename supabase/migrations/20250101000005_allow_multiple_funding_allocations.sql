-- Migration: Allow multiple funding allocations from the same fund to the same instance
-- This removes the unique constraint that prevented multiple allocations

-- Remove the unique constraint that prevents multiple allocations
ALTER TABLE public.instance_fundings DROP CONSTRAINT IF EXISTS instance_fundings_instance_id_fund_id_key;

-- Update the index to remove the unique constraint
DROP INDEX IF EXISTS idx_instance_fundings_instance_fund;
CREATE INDEX IF NOT EXISTS idx_instance_fundings_instance_fund ON instance_fundings(instance_id, fund_id);

-- Add a new index for better performance on allocation_date queries
CREATE INDEX IF NOT EXISTS idx_instance_fundings_allocation_date ON instance_fundings(allocation_date DESC);

-- Update the RLS policy to ensure users can still only manage their own instance fundings
-- (No changes needed to RLS as it's based on instance ownership)

-- Add comment explaining the change
COMMENT ON TABLE public.instance_fundings IS 'Links property investment instances with funding sources - allows multiple allocations from same fund to same instance';
