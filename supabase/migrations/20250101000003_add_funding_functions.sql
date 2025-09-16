-- Migration: Add database functions for funding management
-- This migration adds functions for fund availability checking and atomic operations

-- Function to check fund availability
CREATE OR REPLACE FUNCTION check_fund_availability(
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount DECIMAL(12,2)
) RETURNS BOOLEAN AS $$
DECLARE
  available_amount DECIMAL(12,2);
BEGIN
  IF p_fund_type = 'loan' THEN
    SELECT (lf.fund_amount - COALESCE(SUM(if.amount_allocated), 0))
    INTO available_amount
    FROM loan_funds lf
    LEFT JOIN instance_fundings if ON lf.id = if.fund_id AND if.fund_type = 'loan'
    WHERE lf.id = p_fund_id
    GROUP BY lf.id, lf.fund_amount;
  ELSE
    SELECT (cf.total_amount - COALESCE(SUM(if.amount_allocated), 0))
    INTO available_amount
    FROM cash_funds cf
    LEFT JOIN instance_fundings if ON cf.id = if.fund_id AND if.fund_type = 'cash'
    WHERE cf.id = p_fund_id
    GROUP BY cf.id, cf.total_amount;
  END IF;
  
  RETURN COALESCE(available_amount, 0) >= p_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to update fund usage
CREATE OR REPLACE FUNCTION update_fund_usage(
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount_used DECIMAL(12,2)
) RETURNS VOID AS $$
BEGIN
  UPDATE instance_fundings
  SET amount_used = p_amount_used,
      updated_at = now()
  WHERE fund_id = p_fund_id AND fund_type = p_fund_type;
END;
$$ LANGUAGE plpgsql;

-- Function for atomic fund allocation
CREATE OR REPLACE FUNCTION allocate_fund_to_instance(
  p_instance_id UUID,
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount DECIMAL(12,2),
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  funding_id UUID;
BEGIN
  -- Check availability
  IF NOT check_fund_availability(p_fund_id, p_fund_type, p_amount) THEN
    RAISE EXCEPTION 'Insufficient fund availability for allocation of %', p_amount;
  END IF;
  
  -- Insert allocation
  INSERT INTO instance_fundings (instance_id, fund_id, fund_type, amount_allocated, notes)
  VALUES (p_instance_id, p_fund_id, p_fund_type, p_amount, p_notes)
  RETURNING id INTO funding_id;
  
  RETURN funding_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate fund allocation (for triggers)
CREATE OR REPLACE FUNCTION validate_fund_allocation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if fund exists and user has access
  IF NEW.fund_type = 'loan' THEN
    IF NOT EXISTS (
      SELECT 1 FROM loan_funds lf 
      WHERE lf.id = NEW.fund_id AND lf.owner_user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Loan fund not found or access denied';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM cash_funds cf 
      WHERE cf.id = NEW.fund_id AND cf.owner_user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Cash fund not found or access denied';
    END IF;
  END IF;
  
  -- Check availability
  IF NOT check_fund_availability(NEW.fund_id, NEW.fund_type, NEW.amount_allocated) THEN
    RAISE EXCEPTION 'Insufficient fund availability for allocation of %', NEW.amount_allocated;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate fund allocation
CREATE TRIGGER trg_validate_fund_allocation
  BEFORE INSERT OR UPDATE ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION validate_fund_allocation();

-- Function to get fund usage summary
CREATE OR REPLACE FUNCTION get_fund_usage_summary(p_fund_id UUID, p_fund_type TEXT)
RETURNS TABLE(
  total_allocated DECIMAL(12,2),
  total_used DECIMAL(12,2),
  available_amount DECIMAL(12,2),
  usage_percentage DECIMAL(5,2)
) AS $$
DECLARE
  fund_total DECIMAL(12,2);
  allocated DECIMAL(12,2);
  used DECIMAL(12,2);
BEGIN
  -- Get fund total amount
  IF p_fund_type = 'loan' THEN
    SELECT fund_amount INTO fund_total FROM loan_funds WHERE id = p_fund_id;
  ELSE
    SELECT total_amount INTO fund_total FROM cash_funds WHERE id = p_fund_id;
  END IF;
  
  -- Get allocated and used amounts
  SELECT 
    COALESCE(SUM(amount_allocated), 0),
    COALESCE(SUM(amount_used), 0)
  INTO allocated, used
  FROM instance_fundings 
  WHERE fund_id = p_fund_id AND fund_type = p_fund_type;
  
  RETURN QUERY SELECT 
    allocated,
    used,
    COALESCE(fund_total, 0) - allocated as available_amount,
    CASE 
      WHEN COALESCE(fund_total, 0) > 0 THEN (allocated / fund_total) * 100
      ELSE 0
    END as usage_percentage;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION check_fund_availability IS 'Checks if a fund has sufficient available balance for allocation';
COMMENT ON FUNCTION allocate_fund_to_instance IS 'Atomically allocates a fund to an instance with availability checking';
COMMENT ON FUNCTION get_fund_usage_summary IS 'Returns usage summary for a specific fund';
