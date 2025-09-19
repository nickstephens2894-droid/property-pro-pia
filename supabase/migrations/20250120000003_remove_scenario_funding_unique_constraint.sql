-- Migration: Remove unique constraint from scenario_instance_fundings table
-- This allows multiple funding allocations from the same fund to the same scenario instance

-- Drop the unique constraint if it exists
ALTER TABLE scenario_instance_fundings 
DROP CONSTRAINT IF EXISTS scenario_instance_fundings_scenario_instance_id_fund_id_key;

-- Drop any unique index that might be enforcing the constraint
DROP INDEX IF EXISTS scenario_instance_fundings_scenario_instance_id_fund_id_key;

-- Ensure we have a regular (non-unique) index for performance
CREATE INDEX IF NOT EXISTS idx_scenario_instance_fundings_scenario_fund 
ON scenario_instance_fundings(scenario_instance_id, fund_id);

-- Add comment explaining the change
COMMENT ON TABLE scenario_instance_fundings IS 'Isolated funding allocations for scenario instances - allows multiple allocations from same fund to same scenario instance';
