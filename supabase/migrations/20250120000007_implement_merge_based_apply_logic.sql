-- Migration: Implement merge-based apply logic for scenario instances
-- This replaces the overwrite logic with proper merge functionality that preserves existing data

-- Create function to merge scenario instance changes into original instance
CREATE OR REPLACE FUNCTION apply_scenario_instance_merge(
  p_scenario_instance_id UUID,
  p_resolution_strategy TEXT DEFAULT 'merge'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  target_instance_id UUID,
  operation_type TEXT,
  conflicts JSONB,
  applied_at TIMESTAMPTZ,
  merged_funding_count INTEGER,
  merged_investors_count INTEGER
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
  v_merged_funding_count INTEGER := 0;
  v_merged_investors_count INTEGER := 0;
  v_scenario_funding RECORD;
  v_existing_funding RECORD;
  v_scenario_investors JSONB;
  v_existing_investors JSONB;
  v_merged_investors JSONB;
  v_scenario_ownership JSONB;
  v_existing_ownership JSONB;
  v_merged_ownership JSONB;
BEGIN
  -- Validate inputs
  IF p_resolution_strategy NOT IN ('overwrite', 'merge', 'skip') THEN
    RETURN QUERY SELECT false, 'Invalid resolution strategy', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ, 0, 0;
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
    RETURN QUERY SELECT false, 'Scenario instance not found', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ, 0, 0;
    RETURN;
  END IF;

  -- Verify user ownership
  IF v_scenario_instance.scenario_user_id != auth.uid() THEN
    RETURN QUERY SELECT false, 'Access denied', NULL::UUID, NULL::TEXT, '[]'::JSONB, NULL::TIMESTAMPTZ, 0, 0;
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
      -- Create new instance (same as before)
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

      -- Copy scenario funding to the new instance
      FOR v_scenario_funding IN 
        SELECT * FROM scenario_instance_fundings 
        WHERE scenario_instance_id = p_scenario_instance_id
      LOOP
        INSERT INTO instance_fundings (
          instance_id,
          fund_id,
          fund_type,
          amount_allocated,
          amount_used,
          allocation_date,
          notes
        ) VALUES (
          v_target_instance_id,
          v_scenario_funding.fund_id,
          v_scenario_funding.fund_type,
          v_scenario_funding.amount_allocated,
          v_scenario_funding.amount_used,
          v_scenario_funding.allocation_date,
          v_scenario_funding.notes
        );
        v_merged_funding_count := v_merged_funding_count + 1;
      END LOOP;

      -- Update scenario instance to reference the new instance
      UPDATE scenario_instances
      SET 
        original_instance_id = v_target_instance_id,
        status = 'synced',
        last_synced_at = v_applied_at,
        updated_at = v_applied_at
      WHERE id = p_scenario_instance_id;

    ELSE
      -- Update existing instance with merge logic
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

        RETURN QUERY SELECT false, 'Conflicts detected, update skipped', v_target_instance_id, v_operation_type, v_conflicts, v_applied_at, 0, 0;
        RETURN;
      END IF;

      -- MERGE LOGIC: Update only non-null/non-zero values from scenario
      UPDATE instances SET
        name = CASE 
          WHEN (v_instance_data->>'name') IS NOT NULL AND (v_instance_data->>'name') != '' 
          THEN (v_instance_data->>'name')::TEXT 
          ELSE name 
        END,
        status = CASE 
          WHEN (v_instance_data->>'status') IS NOT NULL AND (v_instance_data->>'status') != '' 
          THEN (v_instance_data->>'status')::TEXT 
          ELSE status 
        END,
        property_method = CASE 
          WHEN (v_instance_data->>'property_method') IS NOT NULL AND (v_instance_data->>'property_method') != '' 
          THEN (v_instance_data->>'property_method')::TEXT 
          ELSE property_method 
        END,
        funding_method = CASE 
          WHEN (v_instance_data->>'funding_method') IS NOT NULL AND (v_instance_data->>'funding_method') != '' 
          THEN (v_instance_data->>'funding_method')::TEXT 
          ELSE funding_method 
        END,
        is_construction_project = CASE 
          WHEN (v_instance_data->>'is_construction_project') IS NOT NULL 
          THEN (v_instance_data->>'is_construction_project')::BOOLEAN 
          ELSE is_construction_project 
        END,
        purchase_price = CASE 
          WHEN (v_instance_data->>'purchase_price') IS NOT NULL AND (v_instance_data->>'purchase_price')::DECIMAL > 0 
          THEN (v_instance_data->>'purchase_price')::DECIMAL 
          ELSE purchase_price 
        END,
        weekly_rent = CASE 
          WHEN (v_instance_data->>'weekly_rent') IS NOT NULL AND (v_instance_data->>'weekly_rent')::DECIMAL > 0 
          THEN (v_instance_data->>'weekly_rent')::DECIMAL 
          ELSE weekly_rent 
        END,
        rental_growth_rate = CASE 
          WHEN (v_instance_data->>'rental_growth_rate') IS NOT NULL AND (v_instance_data->>'rental_growth_rate')::DECIMAL > 0 
          THEN (v_instance_data->>'rental_growth_rate')::DECIMAL 
          ELSE rental_growth_rate 
        END,
        vacancy_rate = CASE 
          WHEN (v_instance_data->>'vacancy_rate') IS NOT NULL AND (v_instance_data->>'vacancy_rate')::DECIMAL > 0 
          THEN (v_instance_data->>'vacancy_rate')::DECIMAL 
          ELSE vacancy_rate 
        END,
        construction_year = CASE 
          WHEN (v_instance_data->>'construction_year') IS NOT NULL AND (v_instance_data->>'construction_year')::INTEGER > 0 
          THEN (v_instance_data->>'construction_year')::INTEGER 
          ELSE construction_year 
        END,
        building_value = CASE 
          WHEN (v_instance_data->>'building_value') IS NOT NULL AND (v_instance_data->>'building_value')::DECIMAL > 0 
          THEN (v_instance_data->>'building_value')::DECIMAL 
          ELSE building_value 
        END,
        plant_equipment_value = CASE 
          WHEN (v_instance_data->>'plant_equipment_value') IS NOT NULL AND (v_instance_data->>'plant_equipment_value')::DECIMAL > 0 
          THEN (v_instance_data->>'plant_equipment_value')::DECIMAL 
          ELSE plant_equipment_value 
        END,
        land_value = CASE 
          WHEN (v_instance_data->>'land_value') IS NOT NULL AND (v_instance_data->>'land_value')::DECIMAL > 0 
          THEN (v_instance_data->>'land_value')::DECIMAL 
          ELSE land_value 
        END,
        construction_value = CASE 
          WHEN (v_instance_data->>'construction_value') IS NOT NULL AND (v_instance_data->>'construction_value')::DECIMAL > 0 
          THEN (v_instance_data->>'construction_value')::DECIMAL 
          ELSE construction_value 
        END,
        construction_period = CASE 
          WHEN (v_instance_data->>'construction_period') IS NOT NULL AND (v_instance_data->>'construction_period')::INTEGER > 0 
          THEN (v_instance_data->>'construction_period')::INTEGER 
          ELSE construction_period 
        END,
        construction_interest_rate = CASE 
          WHEN (v_instance_data->>'construction_interest_rate') IS NOT NULL AND (v_instance_data->>'construction_interest_rate')::DECIMAL > 0 
          THEN (v_instance_data->>'construction_interest_rate')::DECIMAL 
          ELSE construction_interest_rate 
        END,
        construction_progress_payments = CASE 
          WHEN (v_instance_data->'construction_progress_payments') IS NOT NULL AND jsonb_array_length(v_instance_data->'construction_progress_payments') > 0 
          THEN (v_instance_data->'construction_progress_payments')::JSONB 
          ELSE construction_progress_payments 
        END,
        deposit = CASE 
          WHEN (v_instance_data->>'deposit') IS NOT NULL AND (v_instance_data->>'deposit')::DECIMAL > 0 
          THEN (v_instance_data->>'deposit')::DECIMAL 
          ELSE deposit 
        END,
        loan_amount = CASE 
          WHEN (v_instance_data->>'loan_amount') IS NOT NULL AND (v_instance_data->>'loan_amount')::DECIMAL > 0 
          THEN (v_instance_data->>'loan_amount')::DECIMAL 
          ELSE loan_amount 
        END,
        interest_rate = CASE 
          WHEN (v_instance_data->>'interest_rate') IS NOT NULL AND (v_instance_data->>'interest_rate')::DECIMAL > 0 
          THEN (v_instance_data->>'interest_rate')::DECIMAL 
          ELSE interest_rate 
        END,
        loan_term = CASE 
          WHEN (v_instance_data->>'loan_term') IS NOT NULL AND (v_instance_data->>'loan_term')::INTEGER > 0 
          THEN (v_instance_data->>'loan_term')::INTEGER 
          ELSE loan_term 
        END,
        lvr = CASE 
          WHEN (v_instance_data->>'lvr') IS NOT NULL AND (v_instance_data->>'lvr')::DECIMAL > 0 
          THEN (v_instance_data->>'lvr')::DECIMAL 
          ELSE lvr 
        END,
        main_loan_type = CASE 
          WHEN (v_instance_data->>'main_loan_type') IS NOT NULL AND (v_instance_data->>'main_loan_type') != '' 
          THEN (v_instance_data->>'main_loan_type')::TEXT 
          ELSE main_loan_type 
        END,
        io_term_years = CASE 
          WHEN (v_instance_data->>'io_term_years') IS NOT NULL AND (v_instance_data->>'io_term_years')::INTEGER > 0 
          THEN (v_instance_data->>'io_term_years')::INTEGER 
          ELSE io_term_years 
        END,
        use_equity_funding = CASE 
          WHEN (v_instance_data->>'use_equity_funding') IS NOT NULL 
          THEN (v_instance_data->>'use_equity_funding')::BOOLEAN 
          ELSE use_equity_funding 
        END,
        primary_property_value = CASE 
          WHEN (v_instance_data->>'primary_property_value') IS NOT NULL AND (v_instance_data->>'primary_property_value')::DECIMAL > 0 
          THEN (v_instance_data->>'primary_property_value')::DECIMAL 
          ELSE primary_property_value 
        END,
        existing_debt = CASE 
          WHEN (v_instance_data->>'existing_debt') IS NOT NULL AND (v_instance_data->>'existing_debt')::DECIMAL > 0 
          THEN (v_instance_data->>'existing_debt')::DECIMAL 
          ELSE existing_debt 
        END,
        max_lvr = CASE 
          WHEN (v_instance_data->>'max_lvr') IS NOT NULL AND (v_instance_data->>'max_lvr')::DECIMAL > 0 
          THEN (v_instance_data->>'max_lvr')::DECIMAL 
          ELSE max_lvr 
        END,
        equity_loan_type = CASE 
          WHEN (v_instance_data->>'equity_loan_type') IS NOT NULL AND (v_instance_data->>'equity_loan_type') != '' 
          THEN (v_instance_data->>'equity_loan_type')::TEXT 
          ELSE equity_loan_type 
        END,
        equity_loan_io_term_years = CASE 
          WHEN (v_instance_data->>'equity_loan_io_term_years') IS NOT NULL AND (v_instance_data->>'equity_loan_io_term_years')::INTEGER > 0 
          THEN (v_instance_data->>'equity_loan_io_term_years')::INTEGER 
          ELSE equity_loan_io_term_years 
        END,
        equity_loan_interest_rate = CASE 
          WHEN (v_instance_data->>'equity_loan_interest_rate') IS NOT NULL AND (v_instance_data->>'equity_loan_interest_rate')::DECIMAL > 0 
          THEN (v_instance_data->>'equity_loan_interest_rate')::DECIMAL 
          ELSE equity_loan_interest_rate 
        END,
        equity_loan_term = CASE 
          WHEN (v_instance_data->>'equity_loan_term') IS NOT NULL AND (v_instance_data->>'equity_loan_term')::INTEGER > 0 
          THEN (v_instance_data->>'equity_loan_term')::INTEGER 
          ELSE equity_loan_term 
        END,
        deposit_amount = CASE 
          WHEN (v_instance_data->>'deposit_amount') IS NOT NULL AND (v_instance_data->>'deposit_amount')::DECIMAL > 0 
          THEN (v_instance_data->>'deposit_amount')::DECIMAL 
          ELSE deposit_amount 
        END,
        minimum_deposit_required = CASE 
          WHEN (v_instance_data->>'minimum_deposit_required') IS NOT NULL AND (v_instance_data->>'minimum_deposit_required')::DECIMAL > 0 
          THEN (v_instance_data->>'minimum_deposit_required')::DECIMAL 
          ELSE minimum_deposit_required 
        END,
        holding_cost_funding = CASE 
          WHEN (v_instance_data->>'holding_cost_funding') IS NOT NULL AND (v_instance_data->>'holding_cost_funding') != '' 
          THEN (v_instance_data->>'holding_cost_funding')::TEXT 
          ELSE holding_cost_funding 
        END,
        holding_cost_cash_percentage = CASE 
          WHEN (v_instance_data->>'holding_cost_cash_percentage') IS NOT NULL AND (v_instance_data->>'holding_cost_cash_percentage')::DECIMAL > 0 
          THEN (v_instance_data->>'holding_cost_cash_percentage')::DECIMAL 
          ELSE holding_cost_cash_percentage 
        END,
        capitalize_construction_costs = CASE 
          WHEN (v_instance_data->>'capitalize_construction_costs') IS NOT NULL 
          THEN (v_instance_data->>'capitalize_construction_costs')::BOOLEAN 
          ELSE capitalize_construction_costs 
        END,
        construction_equity_repayment_type = CASE 
          WHEN (v_instance_data->>'construction_equity_repayment_type') IS NOT NULL AND (v_instance_data->>'construction_equity_repayment_type') != '' 
          THEN (v_instance_data->>'construction_equity_repayment_type')::TEXT 
          ELSE construction_equity_repayment_type 
        END,
        land_holding_interest = CASE 
          WHEN (v_instance_data->>'land_holding_interest') IS NOT NULL AND (v_instance_data->>'land_holding_interest')::DECIMAL > 0 
          THEN (v_instance_data->>'land_holding_interest')::DECIMAL 
          ELSE land_holding_interest 
        END,
        construction_holding_interest = CASE 
          WHEN (v_instance_data->>'construction_holding_interest') IS NOT NULL AND (v_instance_data->>'construction_holding_interest')::DECIMAL > 0 
          THEN (v_instance_data->>'construction_holding_interest')::DECIMAL 
          ELSE construction_holding_interest 
        END,
        total_holding_costs = CASE 
          WHEN (v_instance_data->>'total_holding_costs') IS NOT NULL AND (v_instance_data->>'total_holding_costs')::DECIMAL > 0 
          THEN (v_instance_data->>'total_holding_costs')::DECIMAL 
          ELSE total_holding_costs 
        END,
        stamp_duty = CASE 
          WHEN (v_instance_data->>'stamp_duty') IS NOT NULL AND (v_instance_data->>'stamp_duty')::DECIMAL > 0 
          THEN (v_instance_data->>'stamp_duty')::DECIMAL 
          ELSE stamp_duty 
        END,
        legal_fees = CASE 
          WHEN (v_instance_data->>'legal_fees') IS NOT NULL AND (v_instance_data->>'legal_fees')::DECIMAL > 0 
          THEN (v_instance_data->>'legal_fees')::DECIMAL 
          ELSE legal_fees 
        END,
        inspection_fees = CASE 
          WHEN (v_instance_data->>'inspection_fees') IS NOT NULL AND (v_instance_data->>'inspection_fees')::DECIMAL > 0 
          THEN (v_instance_data->>'inspection_fees')::DECIMAL 
          ELSE inspection_fees 
        END,
        council_fees = CASE 
          WHEN (v_instance_data->>'council_fees') IS NOT NULL AND (v_instance_data->>'council_fees')::DECIMAL > 0 
          THEN (v_instance_data->>'council_fees')::DECIMAL 
          ELSE council_fees 
        END,
        architect_fees = CASE 
          WHEN (v_instance_data->>'architect_fees') IS NOT NULL AND (v_instance_data->>'architect_fees')::DECIMAL > 0 
          THEN (v_instance_data->>'architect_fees')::DECIMAL 
          ELSE architect_fees 
        END,
        site_costs = CASE 
          WHEN (v_instance_data->>'site_costs') IS NOT NULL AND (v_instance_data->>'site_costs')::DECIMAL > 0 
          THEN (v_instance_data->>'site_costs')::DECIMAL 
          ELSE site_costs 
        END,
        property_management = CASE 
          WHEN (v_instance_data->>'property_management') IS NOT NULL AND (v_instance_data->>'property_management')::DECIMAL > 0 
          THEN (v_instance_data->>'property_management')::DECIMAL 
          ELSE property_management 
        END,
        council_rates = CASE 
          WHEN (v_instance_data->>'council_rates') IS NOT NULL AND (v_instance_data->>'council_rates')::DECIMAL > 0 
          THEN (v_instance_data->>'council_rates')::DECIMAL 
          ELSE council_rates 
        END,
        insurance = CASE 
          WHEN (v_instance_data->>'insurance') IS NOT NULL AND (v_instance_data->>'insurance')::DECIMAL > 0 
          THEN (v_instance_data->>'insurance')::DECIMAL 
          ELSE insurance 
        END,
        repairs = CASE 
          WHEN (v_instance_data->>'repairs') IS NOT NULL AND (v_instance_data->>'repairs')::DECIMAL > 0 
          THEN (v_instance_data->>'repairs')::DECIMAL 
          ELSE repairs 
        END,
        depreciation_method = CASE 
          WHEN (v_instance_data->>'depreciation_method') IS NOT NULL AND (v_instance_data->>'depreciation_method') != '' 
          THEN (v_instance_data->>'depreciation_method')::TEXT 
          ELSE depreciation_method 
        END,
        is_new_property = CASE 
          WHEN (v_instance_data->>'is_new_property') IS NOT NULL 
          THEN (v_instance_data->>'is_new_property')::BOOLEAN 
          ELSE is_new_property 
        END,
        property_state = CASE 
          WHEN (v_instance_data->>'property_state') IS NOT NULL AND (v_instance_data->>'property_state') != '' 
          THEN (v_instance_data->>'property_state')::TEXT 
          ELSE property_state 
        END,
        total_project_cost = CASE 
          WHEN (v_instance_data->>'total_project_cost') IS NOT NULL AND (v_instance_data->>'total_project_cost')::DECIMAL > 0 
          THEN (v_instance_data->>'total_project_cost')::DECIMAL 
          ELSE total_project_cost 
        END,
        equity_loan_amount = CASE 
          WHEN (v_instance_data->>'equity_loan_amount') IS NOT NULL AND (v_instance_data->>'equity_loan_amount')::DECIMAL > 0 
          THEN (v_instance_data->>'equity_loan_amount')::DECIMAL 
          ELSE equity_loan_amount 
        END,
        available_equity = CASE 
          WHEN (v_instance_data->>'available_equity') IS NOT NULL AND (v_instance_data->>'available_equity')::DECIMAL > 0 
          THEN (v_instance_data->>'available_equity')::DECIMAL 
          ELSE available_equity 
        END,
        minimum_cash_required = CASE 
          WHEN (v_instance_data->>'minimum_cash_required') IS NOT NULL AND (v_instance_data->>'minimum_cash_required')::DECIMAL > 0 
          THEN (v_instance_data->>'minimum_cash_required')::DECIMAL 
          ELSE minimum_cash_required 
        END,
        actual_cash_deposit = CASE 
          WHEN (v_instance_data->>'actual_cash_deposit') IS NOT NULL AND (v_instance_data->>'actual_cash_deposit')::DECIMAL > 0 
          THEN (v_instance_data->>'actual_cash_deposit')::DECIMAL 
          ELSE actual_cash_deposit 
        END,
        funding_shortfall = CASE 
          WHEN (v_instance_data->>'funding_shortfall') IS NOT NULL AND (v_instance_data->>'funding_shortfall')::DECIMAL > 0 
          THEN (v_instance_data->>'funding_shortfall')::DECIMAL 
          ELSE funding_shortfall 
        END,
        funding_surplus = CASE 
          WHEN (v_instance_data->>'funding_surplus') IS NOT NULL AND (v_instance_data->>'funding_surplus')::DECIMAL > 0 
          THEN (v_instance_data->>'funding_surplus')::DECIMAL 
          ELSE funding_surplus 
        END,
        projections = CASE 
          WHEN (v_instance_data->'projections') IS NOT NULL AND jsonb_array_length(v_instance_data->'projections') > 0 
          THEN (v_instance_data->'projections')::JSONB 
          ELSE projections 
        END,
        assumptions = CASE 
          WHEN (v_instance_data->'assumptions') IS NOT NULL AND jsonb_array_length(v_instance_data->'assumptions') > 0 
          THEN (v_instance_data->'assumptions')::JSONB 
          ELSE assumptions 
        END,
        weekly_cashflow_year1 = CASE 
          WHEN (v_instance_data->>'weekly_cashflow_year1') IS NOT NULL AND (v_instance_data->>'weekly_cashflow_year1')::DECIMAL > 0 
          THEN (v_instance_data->>'weekly_cashflow_year1')::DECIMAL 
          ELSE weekly_cashflow_year1 
        END,
        tax_savings_year1 = CASE 
          WHEN (v_instance_data->>'tax_savings_year1') IS NOT NULL AND (v_instance_data->>'tax_savings_year1')::DECIMAL > 0 
          THEN (v_instance_data->>'tax_savings_year1')::DECIMAL 
          ELSE tax_savings_year1 
        END,
        tax_savings_total = CASE 
          WHEN (v_instance_data->>'tax_savings_total') IS NOT NULL AND (v_instance_data->>'tax_savings_total')::DECIMAL > 0 
          THEN (v_instance_data->>'tax_savings_total')::DECIMAL 
          ELSE tax_savings_total 
        END,
        net_equity_at_year_to = CASE 
          WHEN (v_instance_data->>'net_equity_at_year_to') IS NOT NULL AND (v_instance_data->>'net_equity_at_year_to')::DECIMAL > 0 
          THEN (v_instance_data->>'net_equity_at_year_to')::DECIMAL 
          ELSE net_equity_at_year_to 
        END,
        roi_at_year_to = CASE 
          WHEN (v_instance_data->>'roi_at_year_to') IS NOT NULL AND (v_instance_data->>'roi_at_year_to')::DECIMAL > 0 
          THEN (v_instance_data->>'roi_at_year_to')::DECIMAL 
          ELSE roi_at_year_to 
        END,
        analysis_year_to = CASE 
          WHEN (v_instance_data->>'analysis_year_to') IS NOT NULL AND (v_instance_data->>'analysis_year_to')::INTEGER > 0 
          THEN (v_instance_data->>'analysis_year_to')::INTEGER 
          ELSE analysis_year_to 
        END,
        updated_at = v_applied_at
      WHERE id = v_target_instance_id;

      -- MERGE INVESTORS: Combine scenario investors with existing ones
      v_scenario_investors := COALESCE(v_instance_data->'investors', '[]'::JSONB);
      v_existing_investors := (SELECT investors FROM instances WHERE id = v_target_instance_id);
      
      -- If scenario has investors, merge them (scenario investors take precedence for updates)
      IF jsonb_array_length(v_scenario_investors) > 0 THEN
        -- For now, we'll replace the investors array with the scenario one
        -- In a more sophisticated implementation, we could merge individual investors
        UPDATE instances 
        SET investors = v_scenario_investors
        WHERE id = v_target_instance_id;
        v_merged_investors_count := jsonb_array_length(v_scenario_investors);
      END IF;

      -- MERGE OWNERSHIP ALLOCATIONS: Combine scenario ownership with existing ones
      v_scenario_ownership := COALESCE(v_instance_data->'ownership_allocations', '[]'::JSONB);
      v_existing_ownership := (SELECT ownership_allocations FROM instances WHERE id = v_target_instance_id);
      
      -- If scenario has ownership allocations, merge them (scenario ownership takes precedence for updates)
      IF jsonb_array_length(v_scenario_ownership) > 0 THEN
        -- For now, we'll replace the ownership allocations array with the scenario one
        -- In a more sophisticated implementation, we could merge individual allocations
        UPDATE instances 
        SET ownership_allocations = v_scenario_ownership
        WHERE id = v_target_instance_id;
      END IF;

      -- MERGE FUNDING: Add scenario funding to existing funding
      FOR v_scenario_funding IN 
        SELECT * FROM scenario_instance_fundings 
        WHERE scenario_instance_id = p_scenario_instance_id
      LOOP
        -- Check if this funding already exists in the instance
        SELECT * INTO v_existing_funding
        FROM instance_fundings
        WHERE instance_id = v_target_instance_id
        AND fund_id = v_scenario_funding.fund_id
        AND fund_type = v_scenario_funding.fund_type;

        IF FOUND THEN
          -- Update existing funding
          UPDATE instance_fundings SET
            amount_allocated = v_scenario_funding.amount_allocated,
            amount_used = v_scenario_funding.amount_used,
            notes = COALESCE(v_scenario_funding.notes, notes),
            updated_at = v_applied_at
          WHERE id = v_existing_funding.id;
        ELSE
          -- Add new funding
          INSERT INTO instance_fundings (
            instance_id,
            fund_id,
            fund_type,
            amount_allocated,
            amount_used,
            allocation_date,
            notes
          ) VALUES (
            v_target_instance_id,
            v_scenario_funding.fund_id,
            v_scenario_funding.fund_type,
            v_scenario_funding.amount_allocated,
            v_scenario_funding.amount_used,
            v_scenario_funding.allocation_date,
            v_scenario_funding.notes
          );
        END IF;
        v_merged_funding_count := v_merged_funding_count + 1;
      END LOOP;

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
        ELSE 'Instance updated successfully with merged changes'
      END,
      v_target_instance_id,
      v_operation_type,
      v_conflicts,
      v_applied_at,
      v_merged_funding_count,
      v_merged_investors_count;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in function context
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Apply failed: ' || v_error_message, NULL::UUID, v_operation_type, '[]'::JSONB, NULL::TIMESTAMPTZ, 0, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing apply_scenario_instance function to use merge logic by default
CREATE OR REPLACE FUNCTION apply_scenario_instance(
  p_scenario_instance_id UUID,
  p_resolution_strategy TEXT DEFAULT 'merge'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  target_instance_id UUID,
  operation_type TEXT,
  conflicts JSONB,
  applied_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Call the new merge-based function and return the results
  RETURN QUERY 
  SELECT 
    success,
    message,
    target_instance_id,
    operation_type,
    conflicts,
    applied_at
  FROM apply_scenario_instance_merge(p_scenario_instance_id, p_resolution_strategy);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION apply_scenario_instance_merge IS 'Applies scenario instance changes using merge logic that preserves existing data while layering in modifications';
COMMENT ON FUNCTION apply_scenario_instance IS 'Updated to use merge logic by default instead of overwrite logic';
