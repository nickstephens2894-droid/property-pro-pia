-- Add refresh scenario instance function
-- This function refreshes a scenario instance with the latest data from its parent instance

CREATE OR REPLACE FUNCTION refresh_scenario_instance(
  p_scenario_instance_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  scenario_instance_id UUID,
  last_synced_at TIMESTAMPTZ
) AS $$
DECLARE
  v_scenario_instance RECORD;
  v_parent_instance RECORD;
  v_updated_scenario_instance RECORD;
  v_error_message TEXT;
BEGIN
  -- Validate input
  IF p_scenario_instance_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid scenario instance ID', NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Get the scenario instance
  SELECT * INTO v_scenario_instance
  FROM scenario_instances
  WHERE id = p_scenario_instance_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Scenario instance not found', NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check if it has a parent instance
  IF v_scenario_instance.original_instance_id IS NULL THEN
    RETURN QUERY SELECT false, 'Cannot refresh - no parent instance found', NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Get the current parent instance data
  SELECT * INTO v_parent_instance
  FROM instances
  WHERE id = v_scenario_instance.original_instance_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Parent instance not found', NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Start transaction block
  BEGIN
    -- Update the scenario instance with fresh data from parent
    UPDATE scenario_instances
    SET 
      instance_data = to_jsonb(v_parent_instance),
      last_synced_at = NOW(),
      status = 'synced',
      updated_at = NOW()
    WHERE id = p_scenario_instance_id
    RETURNING * INTO v_updated_scenario_instance;

    -- Refresh funding data from parent instance
    -- First, delete existing scenario funding
    DELETE FROM scenario_instance_fundings 
    WHERE scenario_instance_id = p_scenario_instance_id;

    -- Copy fresh funding data from parent instance
    INSERT INTO scenario_instance_fundings (
      scenario_instance_id,
      fund_id,
      fund_type,
      amount_allocated,
      amount_used,
      allocation_date,
      notes
    )
    SELECT 
      p_scenario_instance_id,
      fund_id,
      fund_type,
      amount_allocated,
      amount_used,
      allocation_date,
      notes
    FROM instance_fundings
    WHERE instance_id = v_scenario_instance.original_instance_id;

    RETURN QUERY SELECT 
      true, 
      'Scenario instance and funding refreshed successfully', 
      v_updated_scenario_instance.id,
      v_updated_scenario_instance.last_synced_at;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in function context
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Failed to refresh scenario instance: ' || v_error_message, NULL::UUID, NULL::TIMESTAMPTZ;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION refresh_scenario_instance IS 'Refreshes a scenario instance with the latest data from its parent instance';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION refresh_scenario_instance(UUID) TO authenticated;
