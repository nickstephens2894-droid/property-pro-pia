-- Migration: Add scenario funding tables for isolated funding management
-- This allows scenario instances to have their own funding allocations separate from real instances

-- Create scenario_instance_fundings table (isolated funding for scenarios)
CREATE TABLE IF NOT EXISTS scenario_instance_fundings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_instance_id UUID NOT NULL REFERENCES scenario_instances(id) ON DELETE CASCADE,
  fund_id UUID NOT NULL, -- References loan_funds or cash_funds
  fund_type TEXT NOT NULL CHECK (fund_type IN ('loan', 'cash')),
  amount_allocated DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_used DECIMAL(12,2) NOT NULL DEFAULT 0,
  allocation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- Note: No unique constraint to allow multiple allocations from same fund
);

-- Create scenario_funding_applications table (track apply operations)
CREATE TABLE IF NOT EXISTS scenario_funding_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_instance_id UUID NOT NULL REFERENCES scenario_instances(id) ON DELETE CASCADE,
  scenario_funding_id UUID NOT NULL REFERENCES scenario_instance_fundings(id) ON DELETE CASCADE,
  target_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  target_funding_id UUID REFERENCES instance_fundings(id) ON DELETE SET NULL,
  operation_type TEXT CHECK (operation_type IN ('create', 'update', 'delete')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'applying', 'success', 'failed', 'conflict')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_scenario_instance_fundings_scenario_instance_id ON scenario_instance_fundings(scenario_instance_id);
CREATE INDEX idx_scenario_instance_fundings_fund_id ON scenario_instance_fundings(fund_id);
CREATE INDEX idx_scenario_instance_fundings_fund_type ON scenario_instance_fundings(fund_type);
CREATE INDEX idx_scenario_instance_fundings_allocation_date ON scenario_instance_fundings(allocation_date DESC);

CREATE INDEX idx_scenario_funding_applications_scenario_instance_id ON scenario_funding_applications(scenario_instance_id);
CREATE INDEX idx_scenario_funding_applications_status ON scenario_funding_applications(status);
CREATE INDEX idx_scenario_funding_applications_created_at ON scenario_funding_applications(created_at);

-- Enable RLS
ALTER TABLE scenario_instance_fundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_funding_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scenario_instance_fundings
CREATE POLICY "Users can view scenario fundings for their scenarios" ON scenario_instance_fundings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_instance_fundings.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenario fundings for their scenarios" ON scenario_instance_fundings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_instance_fundings.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenario fundings for their scenarios" ON scenario_instance_fundings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_instance_fundings.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenario fundings for their scenarios" ON scenario_instance_fundings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_instance_fundings.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

-- RLS Policies for scenario_funding_applications
CREATE POLICY "Users can view scenario funding applications for their scenarios" ON scenario_funding_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_funding_applications.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenario funding applications for their scenarios" ON scenario_funding_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenario_instances si
      JOIN scenarios s ON s.id = si.scenario_id
      WHERE si.id = scenario_funding_applications.scenario_instance_id 
      AND s.user_id = auth.uid()
    )
  );

-- Add fund_id validation function for scenario fundings
CREATE OR REPLACE FUNCTION check_scenario_fund_id_exists()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fund_type = 'loan' THEN
    IF NOT EXISTS (SELECT 1 FROM loan_funds WHERE id = NEW.fund_id) THEN
      RAISE EXCEPTION 'Fund ID % does not exist in loan_funds table', NEW.fund_id;
    END IF;
  ELSIF NEW.fund_type = 'cash' THEN
    IF NOT EXISTS (SELECT 1 FROM cash_funds WHERE id = NEW.fund_id) THEN
      RAISE EXCEPTION 'Fund ID % does not exist in cash_funds table', NEW.fund_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce fund_id existence for scenario fundings
CREATE TRIGGER trg_check_scenario_fund_id_exists
  BEFORE INSERT OR UPDATE ON scenario_instance_fundings
  FOR EACH ROW EXECUTE FUNCTION check_scenario_fund_id_exists();

-- Create function to apply scenario funding to real instances
CREATE OR REPLACE FUNCTION apply_scenario_funding(
  p_scenario_instance_id UUID,
  p_target_instance_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  applied_count INTEGER
) AS $$
DECLARE
  v_scenario_funding RECORD;
  v_target_funding_id UUID;
  v_applied_count INTEGER := 0;
  v_error_message TEXT;
BEGIN
  -- Validate that the scenario instance exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM scenario_instances si
    JOIN scenarios s ON s.id = si.scenario_id
    WHERE si.id = p_scenario_instance_id 
    AND s.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Scenario instance not found or access denied', 0;
    RETURN;
  END IF;

  -- Validate that the target instance exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM instances i
    WHERE i.id = p_target_instance_id 
    AND i.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Target instance not found or access denied', 0;
    RETURN;
  END IF;

  -- Process each scenario funding
  FOR v_scenario_funding IN 
    SELECT * FROM scenario_instance_fundings 
    WHERE scenario_instance_id = p_scenario_instance_id
  LOOP
    BEGIN
      -- Create or update the real instance funding
      INSERT INTO instance_fundings (
        instance_id,
        fund_id,
        fund_type,
        amount_allocated,
        amount_used,
        allocation_date,
        notes
      ) VALUES (
        p_target_instance_id,
        v_scenario_funding.fund_id,
        v_scenario_funding.fund_type,
        v_scenario_funding.amount_allocated,
        v_scenario_funding.amount_used,
        v_scenario_funding.allocation_date,
        v_scenario_funding.notes
      )
      ON CONFLICT (instance_id, fund_id, allocation_date) 
      DO UPDATE SET
        amount_allocated = EXCLUDED.amount_allocated,
        amount_used = EXCLUDED.amount_used,
        notes = EXCLUDED.notes,
        updated_at = NOW();

      -- Get the ID of the created/updated funding
      SELECT id INTO v_target_funding_id
      FROM instance_fundings
      WHERE instance_id = p_target_instance_id
      AND fund_id = v_scenario_funding.fund_id
      AND allocation_date = v_scenario_funding.allocation_date;

      -- Record the application
      INSERT INTO scenario_funding_applications (
        scenario_instance_id,
        scenario_funding_id,
        target_instance_id,
        target_funding_id,
        operation_type,
        status,
        applied_at
      ) VALUES (
        p_scenario_instance_id,
        v_scenario_funding.id,
        p_target_instance_id,
        v_target_funding_id,
        'create',
        'success',
        NOW()
      );

      v_applied_count := v_applied_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Record failed application
      INSERT INTO scenario_funding_applications (
        scenario_instance_id,
        scenario_funding_id,
        target_instance_id,
        operation_type,
        status,
        error_message
      ) VALUES (
        p_scenario_instance_id,
        v_scenario_funding.id,
        p_target_instance_id,
        'create',
        'failed',
        SQLERRM
      );
    END;
  END LOOP;

  RETURN QUERY SELECT true, 'Scenario funding applied successfully', v_applied_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to rollback scenario funding applications
CREATE OR REPLACE FUNCTION rollback_scenario_funding(
  p_scenario_instance_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  rolled_back_count INTEGER
) AS $$
DECLARE
  v_application RECORD;
  v_rolled_back_count INTEGER := 0;
BEGIN
  -- Validate that the scenario instance exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM scenario_instances si
    JOIN scenarios s ON s.id = si.scenario_id
    WHERE si.id = p_scenario_instance_id 
    AND s.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Scenario instance not found or access denied', 0;
    RETURN;
  END IF;

  -- Process each successful application
  FOR v_application IN 
    SELECT * FROM scenario_funding_applications 
    WHERE scenario_instance_id = p_scenario_instance_id
    AND status = 'success'
  LOOP
    BEGIN
      -- Delete the real instance funding if it exists
      IF v_application.target_funding_id IS NOT NULL THEN
        DELETE FROM instance_fundings WHERE id = v_application.target_funding_id;
      END IF;

      -- Update the application status
      UPDATE scenario_funding_applications
      SET status = 'rolled_back', applied_at = NULL
      WHERE id = v_application.id;

      v_rolled_back_count := v_rolled_back_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Update application status to failed
      UPDATE scenario_funding_applications
      SET status = 'failed', error_message = SQLERRM
      WHERE id = v_application.id;
    END;
  END LOOP;

  RETURN QUERY SELECT true, 'Scenario funding rolled back successfully', v_rolled_back_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE scenario_instance_fundings IS 'Isolated funding allocations for scenario instances - allows multiple allocations from same fund';
COMMENT ON TABLE scenario_funding_applications IS 'Tracks application of scenario funding to real instances';
COMMENT ON FUNCTION apply_scenario_funding IS 'Applies scenario funding allocations to real instances';
COMMENT ON FUNCTION rollback_scenario_funding IS 'Rolls back scenario funding applications from real instances';
