-- Migration: Update fund available amounts when allocations are made
-- This ensures the available_amount field in fund tables is kept in sync

-- Function to update fund available amounts
CREATE OR REPLACE FUNCTION update_fund_available_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the appropriate fund table based on fund_type
  IF NEW.fund_type = 'loan' THEN
    UPDATE loan_funds 
    SET available_amount = (
      SELECT fund_amount - COALESCE(SUM(amount_allocated), 0)
      FROM instance_fundings 
      WHERE fund_id = NEW.fund_id AND fund_type = 'loan'
    )
    WHERE id = NEW.fund_id;
  ELSIF NEW.fund_type = 'cash' THEN
    UPDATE cash_funds 
    SET available_amount = (
      SELECT total_amount - COALESCE(SUM(amount_allocated), 0)
      FROM instance_fundings 
      WHERE fund_id = NEW.fund_id AND fund_type = 'cash'
    )
    WHERE id = NEW.fund_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update fund available amounts on DELETE
CREATE OR REPLACE FUNCTION update_fund_available_amounts_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the appropriate fund table based on fund_type
  IF OLD.fund_type = 'loan' THEN
    UPDATE loan_funds 
    SET available_amount = (
      SELECT fund_amount - COALESCE(SUM(amount_allocated), 0)
      FROM instance_fundings 
      WHERE fund_id = OLD.fund_id AND fund_type = 'loan'
    )
    WHERE id = OLD.fund_id;
  ELSIF OLD.fund_type = 'cash' THEN
    UPDATE cash_funds 
    SET available_amount = (
      SELECT total_amount - COALESCE(SUM(amount_allocated), 0)
      FROM instance_fundings 
      WHERE fund_id = OLD.fund_id AND fund_type = 'cash'
    )
    WHERE id = OLD.fund_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update available amounts
CREATE TRIGGER trg_update_fund_available_amounts_insert
  AFTER INSERT ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION update_fund_available_amounts();

CREATE TRIGGER trg_update_fund_available_amounts_update
  AFTER UPDATE ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION update_fund_available_amounts();

CREATE TRIGGER trg_update_fund_available_amounts_delete
  AFTER DELETE ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION update_fund_available_amounts_on_delete();

-- Functions to update specific fund available amounts (for manual calls)
CREATE OR REPLACE FUNCTION update_loan_fund_available_amount(fund_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE loan_funds 
  SET available_amount = (
    SELECT fund_amount - COALESCE(SUM(amount_allocated), 0)
    FROM instance_fundings 
    WHERE fund_id = $1 AND fund_type = 'loan'
  )
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_cash_fund_available_amount(fund_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE cash_funds 
  SET available_amount = (
    SELECT total_amount - COALESCE(SUM(amount_allocated), 0)
    FROM instance_fundings 
    WHERE fund_id = $1 AND fund_type = 'cash'
  )
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION update_fund_available_amounts() IS 'Updates available_amount in fund tables when allocations are added or updated';
COMMENT ON FUNCTION update_fund_available_amounts_on_delete() IS 'Updates available_amount in fund tables when allocations are deleted';
COMMENT ON FUNCTION update_loan_fund_available_amount(UUID) IS 'Updates available_amount for a specific loan fund';
COMMENT ON FUNCTION update_cash_fund_available_amount(UUID) IS 'Updates available_amount for a specific cash fund';
