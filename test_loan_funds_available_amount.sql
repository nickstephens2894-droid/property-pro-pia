-- Test script to verify loan_funds available_amount column works correctly

-- 1. Check if the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loan_funds' 
AND column_name = 'available_amount';

-- 2. Create a test loan fund
INSERT INTO loan_funds (
  name, 
  fund_amount, 
  available_amount, 
  interest_rate, 
  owner_user_id
) VALUES (
  'Test Loan Fund', 
  200000, 
  200000, 
  6.5, 
  'your-user-id-here'
);

-- 3. Get the fund ID
SELECT id, name, fund_amount, available_amount FROM loan_funds WHERE name = 'Test Loan Fund';

-- 4. Test the update function
SELECT update_loan_fund_available_amount((SELECT id FROM loan_funds WHERE name = 'Test Loan Fund'));

-- 5. Check if the function worked
SELECT id, name, fund_amount, available_amount FROM loan_funds WHERE name = 'Test Loan Fund';

-- 6. Clean up
DELETE FROM loan_funds WHERE name = 'Test Loan Fund';
