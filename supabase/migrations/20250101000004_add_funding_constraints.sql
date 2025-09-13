-- Migration: Add constraints and functions for instance_fundings table
-- This ensures data integrity for the polymorphic fund_id relationship

-- Add check constraint to ensure fund_id exists in the appropriate table
CREATE OR REPLACE FUNCTION check_fund_id_exists()
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

-- Create trigger to enforce fund_id existence
DROP TRIGGER IF EXISTS trg_check_fund_id_exists ON instance_fundings;
CREATE TRIGGER trg_check_fund_id_exists
  BEFORE INSERT OR UPDATE ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION check_fund_id_exists();

-- Add comments
COMMENT ON FUNCTION check_fund_id_exists() IS 'Ensures fund_id exists in the appropriate fund table based on fund_type';
