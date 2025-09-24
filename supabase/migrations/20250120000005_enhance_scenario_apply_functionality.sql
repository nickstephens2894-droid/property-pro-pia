-- Migration: Enhance scenario apply functionality with proper transactional handling
-- This provides comprehensive apply logic with conflict detection and state synchronization

-- Create function to apply scenario instance with full transactional support
CREATE OR REPLACE FUNCTION apply_scenario_instance(
  p_scenario_instance_id UUID,
  p_resolution_strategy TEXT DEFAULT 'overwrite'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  target_instance_id UUID,
  operation_type TEXT,
  conflicts JSONB,
  applied_at TIMESTAMPTZ
) AS $$
DECLARE
  v_scenario_instance RECORD;
  v_scenario RECORD;
  v_target_instance_id UUID;
  v_operation_type TEXT;
  v_conflicts JSONB := '[]';
  v_applied_at TIMESTAMPTZ := NOW();
  v_instance_data JSONB;
  v_existing_instance RECORD;
  v_conflict_detected BOOLEAN := FALSE;
  v_error_message TEXT;
BEGIN
  -- Validate inputs
  IF p_resolution_strategy NOT IN ('overwrite', 'merge', 'skip') THEN
    RETURN QUERY SELECT false, 'Invalid resolution strategy', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Get scenario instance with scenario data
  SELECT 
    si.*,
    s.user_id as scenario_user_id,
    s.id as scenario_id
  INTO v_scenario_instance
  FROM scenario_instances si
  JOIN scenarios s ON s.id = si.scenario_id
  WHERE si.id = p_scenario_instance_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Scenario instance not found', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Verify user ownership
  IF v_scenario_instance.scenario_user_id != auth.uid() THEN
    RETURN QUERY SELECT false, 'Access denied', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Determine operation type
  IF v_scenario_instance.original_instance_id IS NOT NULL THEN
    v_operation_type := 'update';
    v_target_instance_id := v_scenario_instance.original_instance_id;
  ELSE
    v_operation_type := 'create';
    v_target_instance_id := NULL;
  END IF;

  -- Parse instance data
  v_instance_data := v_scenario_instance.instance_data;

  -- Start transaction block
  BEGIN
    IF v_operation_type = 'create' THEN
      -- Create new instance
      INSERT INTO instances (
        user_id,
        name,
        status,
        property_method,
        funding_method,
        investors,
        ownership_allocations,
        is_construction_project,
        purchase_price,
        weekly_rent,
        rental_growth_rate,
        vacancy_rate,
        construction_year,
        building_value,
        plant_equipment_value,
        land_value,
        construction_value,
        construction_period,
        construction_interest_rate,
        construction_progress_payments,
        deposit,
        loan_amount,
        interest_rate,
        loan_term,
        lvr,
        main_loan_type,
        io_term_years,
        use_equity_funding,
        primary_property_value,
        existing_debt,
        max_lvr,
        equity_loan_type,
        equity_loan_io_term_years,
        equity_loan_interest_rate,
        equity_loan_term,
        deposit_amount,
        minimum_deposit_required,
        holding_cost_funding,
        holding_cost_cash_percentage,
        capitalize_construction_costs,
        construction_equity_repayment_type,
        land_holding_interest,
        construction_holding_interest,
        total_holding_costs,
        stamp_duty,
        legal_fees,
        inspection_fees,
        council_fees,
        architect_fees,
        site_costs,
        property_management,
        council_rates,
        insurance,
        repairs,
        depreciation_method,
        is_new_property,
        property_state,
        total_project_cost,
        equity_loan_amount,
        available_equity,
        minimum_cash_required,
        actual_cash_deposit,
        funding_shortfall,
        funding_surplus,
        projections,
        assumptions,
        weekly_cashflow_year1,
        tax_savings_year1,
        tax_savings_total,
        net_equity_at_year_to,
        roi_at_year_to,
        analysis_year_to
      ) VALUES (
        v_scenario_instance.scenario_user_id,
        (v_instance_data->>'name')::TEXT,
        COALESCE((v_instance_data->>'status')::TEXT, 'draft'),
        (v_instance_data->>'property_method')::TEXT,
        (v_instance_data->>'funding_method')::TEXT,
        COALESCE((v_instance_data->'investors')::JSONB, '[]'::JSONB),
        COALESCE((v_instance_data->'ownership_allocations')::JSONB, '[]'::JSONB),
        COALESCE((v_instance_data->>'is_construction_project')::BOOLEAN, FALSE),
        COALESCE((v_instance_data->>'purchase_price')::DECIMAL, 0),
        COALESCE((v_instance_data->>'weekly_rent')::DECIMAL, 0),
        COALESCE((v_instance_data->>'rental_growth_rate')::DECIMAL, 0),
        COALESCE((v_instance_data->>'vacancy_rate')::DECIMAL, 0),
        COALESCE((v_instance_data->>'construction_year')::INTEGER, 0),
        COALESCE((v_instance_data->>'building_value')::DECIMAL, 0),
        COALESCE((v_instance_data->>'plant_equipment_value')::DECIMAL, 0),
        COALESCE((v_instance_data->>'land_value')::DECIMAL, 0),
        COALESCE((v_instance_data->>'construction_value')::DECIMAL, 0),
        COALESCE((v_instance_data->>'construction_period')::INTEGER, 0),
        COALESCE((v_instance_data->>'construction_interest_rate')::DECIMAL, 0),
        COALESCE((v_instance_data->'construction_progress_payments')::JSONB, '[]'::JSONB),
        COALESCE((v_instance_data->>'deposit')::DECIMAL, 0),
        COALESCE((v_instance_data->>'loan_amount')::DECIMAL, 0),
        COALESCE((v_instance_data->>'interest_rate')::DECIMAL, 0),
        COALESCE((v_instance_data->>'loan_term')::INTEGER, 0),
        COALESCE((v_instance_data->>'lvr')::DECIMAL, 0),
        COALESCE((v_instance_data->>'main_loan_type')::TEXT, 'pi'),
        COALESCE((v_instance_data->>'io_term_years')::INTEGER, 0),
        COALESCE((v_instance_data->>'use_equity_funding')::BOOLEAN, FALSE),
        COALESCE((v_instance_data->>'primary_property_value')::DECIMAL, 0),
        COALESCE((v_instance_data->>'existing_debt')::DECIMAL, 0),
        COALESCE((v_instance_data->>'max_lvr')::DECIMAL, 0),
        COALESCE((v_instance_data->>'equity_loan_type')::TEXT, 'pi'),
        COALESCE((v_instance_data->>'equity_loan_io_term_years')::INTEGER, 0),
        COALESCE((v_instance_data->>'equity_loan_interest_rate')::DECIMAL, 0),
        COALESCE((v_instance_data->>'equity_loan_term')::INTEGER, 0),
        COALESCE((v_instance_data->>'deposit_amount')::DECIMAL, 0),
        COALESCE((v_instance_data->>'minimum_deposit_required')::DECIMAL, 0),
        COALESCE((v_instance_data->>'holding_cost_funding')::TEXT, 'cash'),
        COALESCE((v_instance_data->>'holding_cost_cash_percentage')::DECIMAL, 0),
        COALESCE((v_instance_data->>'capitalize_construction_costs')::BOOLEAN, FALSE),
        COALESCE((v_instance_data->>'construction_equity_repayment_type')::TEXT, 'pi'),
        COALESCE((v_instance_data->>'land_holding_interest')::DECIMAL, 0),
        COALESCE((v_instance_data->>'construction_holding_interest')::DECIMAL, 0),
        COALESCE((v_instance_data->>'total_holding_costs')::DECIMAL, 0),
        COALESCE((v_instance_data->>'stamp_duty')::DECIMAL, 0),
        COALESCE((v_instance_data->>'legal_fees')::DECIMAL, 0),
        COALESCE((v_instance_data->>'inspection_fees')::DECIMAL, 0),
        COALESCE((v_instance_data->>'council_fees')::DECIMAL, 0),
        COALESCE((v_instance_data->>'architect_fees')::DECIMAL, 0),
        COALESCE((v_instance_data->>'site_costs')::DECIMAL, 0),
        COALESCE((v_instance_data->>'property_management')::DECIMAL, 0),
        COALESCE((v_instance_data->>'council_rates')::DECIMAL, 0),
        COALESCE((v_instance_data->>'insurance')::DECIMAL, 0),
        COALESCE((v_instance_data->>'repairs')::DECIMAL, 0),
        COALESCE((v_instance_data->>'depreciation_method')::TEXT, 'prime-cost'),
        COALESCE((v_instance_data->>'is_new_property')::BOOLEAN, FALSE),
        COALESCE((v_instance_data->>'property_state')::TEXT, ''),
        COALESCE((v_instance_data->>'total_project_cost')::DECIMAL, 0),
        COALESCE((v_instance_data->>'equity_loan_amount')::DECIMAL, 0),
        COALESCE((v_instance_data->>'available_equity')::DECIMAL, 0),
        COALESCE((v_instance_data->>'minimum_cash_required')::DECIMAL, 0),
        COALESCE((v_instance_data->>'actual_cash_deposit')::DECIMAL, 0),
        COALESCE((v_instance_data->>'funding_shortfall')::DECIMAL, 0),
        COALESCE((v_instance_data->>'funding_surplus')::DECIMAL, 0),
        COALESCE((v_instance_data->'projections')::JSONB, '[]'::JSONB),
        COALESCE((v_instance_data->'assumptions')::JSONB, '{}'::JSONB),
        COALESCE((v_instance_data->>'weekly_cashflow_year1')::DECIMAL, 0),
        COALESCE((v_instance_data->>'tax_savings_year1')::DECIMAL, 0),
        COALESCE((v_instance_data->>'tax_savings_total')::DECIMAL, 0),
        COALESCE((v_instance_data->>'net_equity_at_year_to')::DECIMAL, 0),
        COALESCE((v_instance_data->>'roi_at_year_to')::DECIMAL, 0),
        COALESCE((v_instance_data->>'analysis_year_to')::INTEGER, 30)
      ) RETURNING id INTO v_target_instance_id;

      -- Update scenario instance to reference the new instance
      UPDATE scenario_instances
      SET 
        original_instance_id = v_target_instance_id,
        status = 'synced',
        last_synced_at = v_applied_at,
        updated_at = v_applied_at
      WHERE id = p_scenario_instance_id;

    ELSE
      -- Update existing instance
      -- First check for conflicts if resolution strategy is not overwrite
      IF p_resolution_strategy != 'overwrite' THEN
        -- Get current instance data
        SELECT * INTO v_existing_instance
        FROM instances
        WHERE id = v_target_instance_id;

        -- Check for conflicts (simplified - could be enhanced)
        IF v_existing_instance.updated_at > v_scenario_instance.created_at THEN
          v_conflict_detected := TRUE;
          v_conflicts := jsonb_build_array(
            jsonb_build_object(
              'field', 'instance_modified',
              'scenario_value', v_scenario_instance.updated_at,
              'instance_value', v_existing_instance.updated_at,
              'conflict_type', 'value_mismatch',
              'resolution', p_resolution_strategy
            )
          );
        END IF;
      END IF;

      -- Apply based on resolution strategy
      IF p_resolution_strategy = 'skip' AND v_conflict_detected THEN
        -- Skip update due to conflicts
        UPDATE scenario_instances
        SET 
          status = 'conflict',
          updated_at = v_applied_at
        WHERE id = p_scenario_instance_id;

        RETURN QUERY SELECT false, 'Conflicts detected, update skipped', v_target_instance_id, v_operation_type, v_conflicts, v_applied_at;
        RETURN;
      END IF;

      -- Perform the update
      UPDATE instances SET
        name = (v_instance_data->>'name')::TEXT,
        status = COALESCE((v_instance_data->>'status')::TEXT, status),
        property_method = (v_instance_data->>'property_method')::TEXT,
        funding_method = (v_instance_data->>'funding_method')::TEXT,
        investors = COALESCE((v_instance_data->'investors')::JSONB, investors),
        ownership_allocations = COALESCE((v_instance_data->'ownership_allocations')::JSONB, ownership_allocations),
        is_construction_project = COALESCE((v_instance_data->>'is_construction_project')::BOOLEAN, is_construction_project),
        purchase_price = COALESCE((v_instance_data->>'purchase_price')::DECIMAL, purchase_price),
        weekly_rent = COALESCE((v_instance_data->>'weekly_rent')::DECIMAL, weekly_rent),
        rental_growth_rate = COALESCE((v_instance_data->>'rental_growth_rate')::DECIMAL, rental_growth_rate),
        vacancy_rate = COALESCE((v_instance_data->>'vacancy_rate')::DECIMAL, vacancy_rate),
        construction_year = COALESCE((v_instance_data->>'construction_year')::INTEGER, construction_year),
        building_value = COALESCE((v_instance_data->>'building_value')::DECIMAL, building_value),
        plant_equipment_value = COALESCE((v_instance_data->>'plant_equipment_value')::DECIMAL, plant_equipment_value),
        land_value = COALESCE((v_instance_data->>'land_value')::DECIMAL, land_value),
        construction_value = COALESCE((v_instance_data->>'construction_value')::DECIMAL, construction_value),
        construction_period = COALESCE((v_instance_data->>'construction_period')::INTEGER, construction_period),
        construction_interest_rate = COALESCE((v_instance_data->>'construction_interest_rate')::DECIMAL, construction_interest_rate),
        construction_progress_payments = COALESCE((v_instance_data->'construction_progress_payments')::JSONB, construction_progress_payments),
        deposit = COALESCE((v_instance_data->>'deposit')::DECIMAL, deposit),
        loan_amount = COALESCE((v_instance_data->>'loan_amount')::DECIMAL, loan_amount),
        interest_rate = COALESCE((v_instance_data->>'interest_rate')::DECIMAL, interest_rate),
        loan_term = COALESCE((v_instance_data->>'loan_term')::INTEGER, loan_term),
        lvr = COALESCE((v_instance_data->>'lvr')::DECIMAL, lvr),
        main_loan_type = COALESCE((v_instance_data->>'main_loan_type')::TEXT, main_loan_type),
        io_term_years = COALESCE((v_instance_data->>'io_term_years')::INTEGER, io_term_years),
        use_equity_funding = COALESCE((v_instance_data->>'use_equity_funding')::BOOLEAN, use_equity_funding),
        primary_property_value = COALESCE((v_instance_data->>'primary_property_value')::DECIMAL, primary_property_value),
        existing_debt = COALESCE((v_instance_data->>'existing_debt')::DECIMAL, existing_debt),
        max_lvr = COALESCE((v_instance_data->>'max_lvr')::DECIMAL, max_lvr),
        equity_loan_type = COALESCE((v_instance_data->>'equity_loan_type')::TEXT, equity_loan_type),
        equity_loan_io_term_years = COALESCE((v_instance_data->>'equity_loan_io_term_years')::INTEGER, equity_loan_io_term_years),
        equity_loan_interest_rate = COALESCE((v_instance_data->>'equity_loan_interest_rate')::DECIMAL, equity_loan_interest_rate),
        equity_loan_term = COALESCE((v_instance_data->>'equity_loan_term')::INTEGER, equity_loan_term),
        deposit_amount = COALESCE((v_instance_data->>'deposit_amount')::DECIMAL, deposit_amount),
        minimum_deposit_required = COALESCE((v_instance_data->>'minimum_deposit_required')::DECIMAL, minimum_deposit_required),
        holding_cost_funding = COALESCE((v_instance_data->>'holding_cost_funding')::TEXT, holding_cost_funding),
        holding_cost_cash_percentage = COALESCE((v_instance_data->>'holding_cost_cash_percentage')::DECIMAL, holding_cost_cash_percentage),
        capitalize_construction_costs = COALESCE((v_instance_data->>'capitalize_construction_costs')::BOOLEAN, capitalize_construction_costs),
        construction_equity_repayment_type = COALESCE((v_instance_data->>'construction_equity_repayment_type')::TEXT, construction_equity_repayment_type),
        land_holding_interest = COALESCE((v_instance_data->>'land_holding_interest')::DECIMAL, land_holding_interest),
        construction_holding_interest = COALESCE((v_instance_data->>'construction_holding_interest')::DECIMAL, construction_holding_interest),
        total_holding_costs = COALESCE((v_instance_data->>'total_holding_costs')::DECIMAL, total_holding_costs),
        stamp_duty = COALESCE((v_instance_data->>'stamp_duty')::DECIMAL, stamp_duty),
        legal_fees = COALESCE((v_instance_data->>'legal_fees')::DECIMAL, legal_fees),
        inspection_fees = COALESCE((v_instance_data->>'inspection_fees')::DECIMAL, inspection_fees),
        council_fees = COALESCE((v_instance_data->>'council_fees')::DECIMAL, council_fees),
        architect_fees = COALESCE((v_instance_data->>'architect_fees')::DECIMAL, architect_fees),
        site_costs = COALESCE((v_instance_data->>'site_costs')::DECIMAL, site_costs),
        property_management = COALESCE((v_instance_data->>'property_management')::DECIMAL, property_management),
        council_rates = COALESCE((v_instance_data->>'council_rates')::DECIMAL, council_rates),
        insurance = COALESCE((v_instance_data->>'insurance')::DECIMAL, insurance),
        repairs = COALESCE((v_instance_data->>'repairs')::DECIMAL, repairs),
        depreciation_method = COALESCE((v_instance_data->>'depreciation_method')::TEXT, depreciation_method),
        is_new_property = COALESCE((v_instance_data->>'is_new_property')::BOOLEAN, is_new_property),
        property_state = COALESCE((v_instance_data->>'property_state')::TEXT, property_state),
        total_project_cost = COALESCE((v_instance_data->>'total_project_cost')::DECIMAL, total_project_cost),
        equity_loan_amount = COALESCE((v_instance_data->>'equity_loan_amount')::DECIMAL, equity_loan_amount),
        available_equity = COALESCE((v_instance_data->>'available_equity')::DECIMAL, available_equity),
        minimum_cash_required = COALESCE((v_instance_data->>'minimum_cash_required')::DECIMAL, minimum_cash_required),
        actual_cash_deposit = COALESCE((v_instance_data->>'actual_cash_deposit')::DECIMAL, actual_cash_deposit),
        funding_shortfall = COALESCE((v_instance_data->>'funding_shortfall')::DECIMAL, funding_shortfall),
        funding_surplus = COALESCE((v_instance_data->>'funding_surplus')::DECIMAL, funding_surplus),
        projections = COALESCE((v_instance_data->'projections')::JSONB, projections),
        assumptions = COALESCE((v_instance_data->'assumptions')::JSONB, assumptions),
        weekly_cashflow_year1 = COALESCE((v_instance_data->>'weekly_cashflow_year1')::DECIMAL, weekly_cashflow_year1),
        tax_savings_year1 = COALESCE((v_instance_data->>'tax_savings_year1')::DECIMAL, tax_savings_year1),
        tax_savings_total = COALESCE((v_instance_data->>'tax_savings_total')::DECIMAL, tax_savings_total),
        net_equity_at_year_to = COALESCE((v_instance_data->>'net_equity_at_year_to')::DECIMAL, net_equity_at_year_to),
        roi_at_year_to = COALESCE((v_instance_data->>'roi_at_year_to')::DECIMAL, roi_at_year_to),
        analysis_year_to = COALESCE((v_instance_data->>'analysis_year_to')::INTEGER, analysis_year_to),
        updated_at = v_applied_at
      WHERE id = v_target_instance_id;

      -- Update scenario instance status
      UPDATE scenario_instances
      SET 
        status = CASE 
          WHEN v_conflict_detected THEN 'conflict'
          ELSE 'synced'
        END,
        last_synced_at = v_applied_at,
        updated_at = v_applied_at
      WHERE id = p_scenario_instance_id;
    END IF;

    -- Create application record
    INSERT INTO scenario_applications (
      scenario_id,
      scenario_instance_id,
      operation_type,
      target_instance_id,
      status,
      applied_at,
      conflict_data
    ) VALUES (
      v_scenario_instance.scenario_id,
      p_scenario_instance_id,
      v_operation_type,
      v_target_instance_id,
      CASE 
        WHEN v_conflict_detected THEN 'conflict'
        ELSE 'success'
      END,
      v_applied_at,
      v_conflicts
    );

    -- Return success result
    RETURN QUERY SELECT 
      true, 
      CASE 
        WHEN v_operation_type = 'create' THEN 'Instance created successfully'
        ELSE 'Instance updated successfully'
      END,
      v_target_instance_id,
      v_operation_type,
      v_conflicts,
      v_applied_at;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in function context
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Apply failed: ' || v_error_message, NULL::UUID, v_operation_type, '[]'::JSONB, NULL::TIMESTAMPTZ;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for conflicts before applying
CREATE OR REPLACE FUNCTION check_scenario_instance_conflicts(
  p_scenario_instance_id UUID
)
RETURNS TABLE(
  has_conflicts BOOLEAN,
  conflicts JSONB,
  last_instance_update TIMESTAMPTZ,
  last_scenario_update TIMESTAMPTZ
) AS $$
DECLARE
  v_scenario_instance RECORD;
  v_instance RECORD;
  v_conflicts JSONB := '[]';
  v_has_conflicts BOOLEAN := FALSE;
  v_instance_updated_at TIMESTAMPTZ := NULL;
BEGIN
  -- Get scenario instance data
  SELECT 
    si.*,
    s.user_id as scenario_user_id
  INTO v_scenario_instance
  FROM scenario_instances si
  JOIN scenarios s ON s.id = si.scenario_id
  WHERE si.id = p_scenario_instance_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, '[]'::JSONB, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check if there's an original instance to compare against
  IF v_scenario_instance.original_instance_id IS NOT NULL THEN
    SELECT * INTO v_instance
    FROM instances
    WHERE id = v_scenario_instance.original_instance_id;

    IF FOUND THEN
      -- Store the instance updated_at for return
      v_instance_updated_at := v_instance.updated_at;
      
      -- Check for conflicts (simplified version)
      IF v_instance.updated_at > v_scenario_instance.created_at THEN
        v_has_conflicts := TRUE;
        v_conflicts := jsonb_build_array(
          jsonb_build_object(
            'field', 'instance_modified',
            'scenario_value', v_scenario_instance.updated_at,
            'instance_value', v_instance.updated_at,
            'conflict_type', 'value_mismatch',
            'description', 'Instance has been modified since scenario was created'
          )
        );
      END IF;
    END IF;
  END IF;

  RETURN QUERY SELECT 
    v_has_conflicts,
    v_conflicts,
    v_instance_updated_at,
    v_scenario_instance.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION apply_scenario_instance IS 'Applies scenario instance changes to real instances with full transactional support and conflict detection';
COMMENT ON FUNCTION check_scenario_instance_conflicts IS 'Checks for conflicts between scenario instance and original instance before applying';
