-- Move construction details from loan_funds to instances table
-- This migration adds construction-specific fields to instances table
-- and removes them from loan_funds table

-- Add construction details fields to instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS construction_period INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS construction_interest_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_payment_weeks INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS progress_payment_percentage DECIMAL(5,2) DEFAULT 5,
ADD COLUMN IF NOT EXISTS progress_payment_description TEXT DEFAULT '4 Weeks - 5% of construction price';

-- Add comments for the new fields
COMMENT ON COLUMN instances.construction_period IS 'Construction period in months';
COMMENT ON COLUMN instances.construction_interest_rate IS 'Interest rate during construction period';
COMMENT ON COLUMN instances.progress_payment_weeks IS 'Progress payment schedule in weeks';
COMMENT ON COLUMN instances.progress_payment_percentage IS 'Progress payment percentage of construction price';
COMMENT ON COLUMN instances.progress_payment_description IS 'Description of progress payment schedule';

-- Remove construction details from loan_funds table
-- Note: We'll keep the columns for now to avoid data loss during migration
-- They will be removed in a separate migration after data migration is complete
-- ALTER TABLE loan_funds DROP COLUMN IF EXISTS construction_period;
-- ALTER TABLE loan_funds DROP COLUMN IF EXISTS construction_interest_rate;
-- ALTER TABLE loan_funds DROP COLUMN IF EXISTS progress_payment_weeks;
-- ALTER TABLE loan_funds DROP COLUMN IF EXISTS progress_payment_percentage;
-- ALTER TABLE loan_funds DROP COLUMN IF EXISTS progress_payment_description;
