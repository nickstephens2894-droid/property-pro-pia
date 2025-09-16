-- Test script to verify fund allocation updates database correctly
-- Run this after creating a cash fund and allocating from it

-- 1. Create a test cash fund
INSERT INTO cash_funds (name, fund_type, total_amount, available_amount, return_rate, owner_user_id)
VALUES ('Test Cash Fund', 'Savings', 100000, 100000, 5.0, 'your-user-id-here');

-- 2. Get the fund ID
SELECT id, name, total_amount, available_amount FROM cash_funds WHERE name = 'Test Cash Fund';

-- 3. Create a test instance funding allocation
INSERT INTO instance_fundings (instance_id, fund_id, fund_type, amount_allocated, notes)
VALUES ('test-instance-id', (SELECT id FROM cash_funds WHERE name = 'Test Cash Fund'), 'cash', 30000, 'Test allocation');

-- 4. Check if the available_amount was updated in the cash_funds table
SELECT id, name, total_amount, available_amount FROM cash_funds WHERE name = 'Test Cash Fund';

-- 5. Check the instance_fundings record
SELECT * FROM instance_fundings WHERE fund_id = (SELECT id FROM cash_funds WHERE name = 'Test Cash Fund');

-- 6. Test updating the allocation
UPDATE instance_fundings 
SET amount_allocated = 50000 
WHERE fund_id = (SELECT id FROM cash_funds WHERE name = 'Test Cash Fund');

-- 7. Check if the available_amount was updated again
SELECT id, name, total_amount, available_amount FROM cash_funds WHERE name = 'Test Cash Fund';

-- 8. Test deleting the allocation
DELETE FROM instance_fundings WHERE fund_id = (SELECT id FROM cash_funds WHERE name = 'Test Cash Fund');

-- 9. Check if the available_amount was restored
SELECT id, name, total_amount, available_amount FROM cash_funds WHERE name = 'Test Cash Fund';

-- 10. Clean up
DELETE FROM cash_funds WHERE name = 'Test Cash Fund';
