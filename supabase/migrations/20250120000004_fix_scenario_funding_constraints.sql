-- Migration: Fix scenario funding constraints to allow multiple allocations
-- This ensures users can add the same fund multiple times to a scenario instance

-- First, let's check if the table exists and drop any problematic constraints
DO $$
BEGIN
  -- Drop the unique constraint if it exists (with different possible names)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'scenario_instance_fundings_scenario_instance_id_fund_id_key'
    AND table_name = 'scenario_instance_fundings'
  ) THEN
    ALTER TABLE scenario_instance_fundings 
    DROP CONSTRAINT scenario_instance_fundings_scenario_instance_id_fund_id_key;
  END IF;

  -- Drop any other unique constraints that might prevent multiple allocations
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%scenario_instance_fundings%unique%'
    AND table_name = 'scenario_instance_fundings'
  ) THEN
    ALTER TABLE scenario_instance_fundings 
    DROP CONSTRAINT IF EXISTS scenario_instance_fundings_scenario_instance_id_fund_id_unique;
  END IF;

  -- Drop any unique indexes
  DROP INDEX IF EXISTS scenario_instance_fundings_scenario_instance_id_fund_id_key;
  DROP INDEX IF EXISTS scenario_instance_fundings_scenario_instance_id_fund_id_unique;
  DROP INDEX IF EXISTS idx_scenario_instance_fundings_scenario_fund_unique;

EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if constraints don't exist
  NULL;
END $$;

-- Ensure we have the proper non-unique indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenario_instance_fundings_scenario_fund 
ON scenario_instance_fundings(scenario_instance_id, fund_id);

CREATE INDEX IF NOT EXISTS idx_scenario_instance_fundings_fund_type 
ON scenario_instance_fundings(fund_type);

CREATE INDEX IF NOT EXISTS idx_scenario_instance_fundings_allocation_date 
ON scenario_instance_fundings(allocation_date DESC);

-- Add a comment to clarify the table's purpose
COMMENT ON TABLE scenario_instance_fundings IS 'Isolated funding allocations for scenario instances - allows multiple allocations from same fund to same scenario instance, just like real instances';
