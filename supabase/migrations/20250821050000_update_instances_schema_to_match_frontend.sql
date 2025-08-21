-- Update instances table to match frontend requirements
-- This migration adds all the missing fields that the frontend is trying to send

-- Add missing columns to existing instances table
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS property_method TEXT CHECK (property_method IN ('house-land-construction', 'built-first-owner', 'built-second-owner')),
ADD COLUMN IF NOT EXISTS funding_method TEXT CHECK (funding_method IN ('loan-cash', 'loan-equity', 'full-equity')),
ADD COLUMN IF NOT EXISTS investors JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ownership_allocations JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS building_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS plant_equipment_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS loan_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS loan_term INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS lvr DECIMAL(5,2) DEFAULT 80,
ADD COLUMN IF NOT EXISTS main_loan_type TEXT CHECK (main_loan_type IN ('io', 'pi')) DEFAULT 'pi',
ADD COLUMN IF NOT EXISTS io_term_years INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS use_equity_funding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primary_property_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS existing_debt DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_lvr DECIMAL(5,2) DEFAULT 80,
ADD COLUMN IF NOT EXISTS equity_loan_type TEXT CHECK (equity_loan_type IN ('io', 'pi')) DEFAULT 'pi',
ADD COLUMN IF NOT EXISTS equity_loan_io_term_years INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS equity_loan_interest_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS equity_loan_term INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_deposit_required DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS holding_cost_funding TEXT CHECK (holding_cost_funding IN ('cash', 'debt', 'hybrid')) DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS holding_cost_cash_percentage DECIMAL(5,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS capitalize_construction_costs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS construction_equity_repayment_type TEXT CHECK (construction_equity_repayment_type IN ('io', 'pi')) DEFAULT 'io',
ADD COLUMN IF NOT EXISTS land_holding_interest DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS construction_holding_interest DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_holding_costs DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stamp_duty DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS legal_fees DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS council_fees DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS architect_fees DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_management DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS repairs DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_project_cost DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS equity_loan_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_equity DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_state TEXT CHECK (property_state IN ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA')) DEFAULT 'VIC';

-- Add constraint to property_method if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_property_method_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_property_method_check 
        CHECK (property_method IN ('house-land-construction', 'built-first-owner', 'built-second-owner'));
    END IF;
END $$;

-- Add constraint to funding_method if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_funding_method_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_funding_method_check 
        CHECK (funding_method IN ('loan-cash', 'loan-equity', 'full-equity'));
    END IF;
END $$;

-- Add constraint to main_loan_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_main_loan_type_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_main_loan_type_check 
        CHECK (main_loan_type IN ('io', 'pi'));
    END IF;
END $$;

-- Add constraint to equity_loan_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_equity_loan_type_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_equity_loan_type_check 
        CHECK (equity_loan_type IN ('io', 'pi'));
    END IF;
END $$;

-- Add constraint to holding_cost_funding if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_holding_cost_funding_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_holding_cost_funding_check 
        CHECK (holding_cost_funding IN ('cash', 'debt', 'hybrid'));
    END IF;
END $$;

-- Add constraint to construction_equity_repayment_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_construction_equity_repayment_type_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_construction_equity_repayment_type_check 
        CHECK (construction_equity_repayment_type IN ('io', 'pi'));
    END IF;
END $$;

-- Add constraint to depreciation_method if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_depreciation_method_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_depreciation_method_check 
        CHECK (depreciation_method IN ('prime-cost', 'diminishing-value'));
    END IF;
END $$;

-- Add constraint to status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'instances_status_check'
    ) THEN
        ALTER TABLE instances 
        ADD CONSTRAINT instances_status_check 
        CHECK (status IN ('draft', 'active', 'archived'));
    END IF;
END $$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_instances_user_id ON instances(user_id);
CREATE INDEX IF NOT EXISTS idx_instances_source_model_id ON instances(source_model_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);
CREATE INDEX IF NOT EXISTS idx_instances_created_at ON instances(created_at);

-- Enable RLS if not already enabled
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'instances' AND policyname = 'Users can view their own instances'
    ) THEN
        CREATE POLICY "Users can view their own instances" ON instances
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'instances' AND policyname = 'Users can insert their own instances'
    ) THEN
        CREATE POLICY "Users can insert their own instances" ON instances
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'instances' AND policyname = 'Users can update their own instances'
    ) THEN
        CREATE POLICY "Users can update their own instances" ON instances
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'instances' AND policyname = 'Users can delete their own instances'
    ) THEN
        CREATE POLICY "Users can delete their own instances" ON instances
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_instances_updated_at'
    ) THEN
        CREATE TRIGGER update_instances_updated_at
        BEFORE UPDATE ON instances
        FOR EACH ROW
        EXECUTE FUNCTION update_instances_updated_at();
    END IF;
END $$;
