-- Migration: Copy instance funding to scenario funding when importing instances
-- This ensures all funding details are copied when creating scenario instances from existing instances

-- Create function to copy instance funding to scenario funding
CREATE OR REPLACE FUNCTION copy_instance_funding_to_scenario(
  p_scenario_instance_id UUID,
  p_original_instance_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  copied_count INTEGER
) AS $$
DECLARE
  v_funding RECORD;
  v_copied_count INTEGER := 0;
  v_error_message TEXT;
BEGIN
  -- Validate inputs
  IF p_scenario_instance_id IS NULL OR p_original_instance_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid scenario instance or original instance ID', 0;
    RETURN;
  END IF;

  -- Verify that the scenario instance exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM scenario_instances si
    JOIN scenarios s ON s.id = si.scenario_id
    WHERE si.id = p_scenario_instance_id 
    AND s.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Scenario instance not found or access denied', 0;
    RETURN;
  END IF;

  -- Verify that the original instance exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM instances i
    WHERE i.id = p_original_instance_id 
    AND i.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Original instance not found or access denied', 0;
    RETURN;
  END IF;

  -- Start transaction block
  BEGIN
    -- Copy all funding from the original instance
    FOR v_funding IN 
      SELECT * FROM instance_fundings 
      WHERE instance_id = p_original_instance_id
    LOOP
      BEGIN
        -- Insert into scenario_instance_fundings
        INSERT INTO scenario_instance_fundings (
          scenario_instance_id,
          fund_id,
          fund_type,
          amount_allocated,
          amount_used,
          allocation_date,
          notes
        ) VALUES (
          p_scenario_instance_id,
          v_funding.fund_id,
          v_funding.fund_type,
          v_funding.amount_allocated,
          v_funding.amount_used,
          v_funding.allocation_date,
          v_funding.notes
        );

        v_copied_count := v_copied_count + 1;

      EXCEPTION WHEN OTHERS THEN
        -- Log error but continue with other fundings
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE WARNING 'Failed to copy funding %: %', v_funding.id, v_error_message;
      END;
    END LOOP;

    RETURN QUERY SELECT true, 'Funding copied successfully', v_copied_count;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in function context
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Failed to copy funding: ' || v_error_message, v_copied_count;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to copy all instance data comprehensively
CREATE OR REPLACE FUNCTION copy_instance_to_scenario_comprehensive(
  p_scenario_id UUID,
  p_instance_id UUID,
  p_scenario_name TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  scenario_instance_id UUID,
  copied_funding_count INTEGER
) AS $$
DECLARE
  v_instance RECORD;
  v_scenario_instance_id UUID;
  v_funding_result RECORD;
  v_copied_funding_count INTEGER := 0;
  v_error_message TEXT;
BEGIN
  -- Validate inputs
  IF p_scenario_id IS NULL OR p_instance_id IS NULL OR p_scenario_name IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid parameters', NULL::UUID, 0;
    RETURN;
  END IF;

  -- Verify that the scenario exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM scenarios s
    WHERE s.id = p_scenario_id 
    AND s.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, 'Scenario not found or access denied', NULL::UUID, 0;
    RETURN;
  END IF;

  -- Get the instance data
  SELECT * INTO v_instance
  FROM instances
  WHERE id = p_instance_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Instance not found or access denied', NULL::UUID, 0;
    RETURN;
  END IF;

  -- Start transaction block
  BEGIN
    -- Create scenario instance with comprehensive data
    INSERT INTO scenario_instances (
      scenario_id,
      original_instance_id,
      instance_data,
      scenario_name,
      status,
      display_order
    ) VALUES (
      p_scenario_id,
      p_instance_id,
      to_jsonb(v_instance),
      p_scenario_name,
      'draft',
      (SELECT COALESCE(MAX(display_order), 0) + 1 FROM scenario_instances WHERE scenario_id = p_scenario_id)
    ) RETURNING id INTO v_scenario_instance_id;

    -- Copy funding data
    SELECT * INTO v_funding_result
    FROM copy_instance_funding_to_scenario(v_scenario_instance_id, p_instance_id);

    v_copied_funding_count := v_funding_result.copied_count;

    IF NOT v_funding_result.success THEN
      RAISE WARNING 'Funding copy failed: %', v_funding_result.message;
    END IF;

    RETURN QUERY SELECT 
      true, 
      'Scenario instance created with comprehensive data', 
      v_scenario_instance_id,
      v_copied_funding_count;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in function context
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Failed to create scenario instance: ' || v_error_message, NULL::UUID, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION copy_instance_funding_to_scenario IS 'Copies all funding allocations from an instance to a scenario instance';
COMMENT ON FUNCTION copy_instance_to_scenario_comprehensive IS 'Creates a comprehensive scenario instance copy with all data including funding';
