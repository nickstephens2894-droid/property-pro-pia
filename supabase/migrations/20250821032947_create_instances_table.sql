-- Create instances table for property investment analysis
CREATE TABLE instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_model_id UUID REFERENCES property_models(id) ON DELETE SET NULL,
  
  -- Instance metadata
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Property Method and Funding Method
  property_method TEXT CHECK (property_method IN ('house-land-construction', 'built-first-owner', 'built-second-owner')),
  funding_method TEXT CHECK (funding_method IN ('loan-cash', 'loan-equity', 'full-equity')),
  
  -- Multi-investor structure (stored as JSON for now)
  investors JSONB NOT NULL DEFAULT '[]',
  ownership_allocations JSONB NOT NULL DEFAULT '[]',
  
  -- Project Type
  is_construction_project BOOLEAN DEFAULT FALSE,
  
  -- Basic Property Details
  purchase_price DECIMAL(12,2) DEFAULT 0,
  weekly_rent DECIMAL(8,2) DEFAULT 0,
  rental_growth_rate DECIMAL(5,2) DEFAULT 0,
  vacancy_rate DECIMAL(5,2) DEFAULT 0,
  construction_year INTEGER DEFAULT 2024,
  building_value DECIMAL(12,2) DEFAULT 0,
  plant_equipment_value DECIMAL(12,2) DEFAULT 0,
  
  -- Construction-specific
  land_value DECIMAL(12,2) DEFAULT 0,
  construction_value DECIMAL(12,2) DEFAULT 0,
  construction_period INTEGER DEFAULT 0,
  construction_interest_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Construction Progress Payments
  construction_progress_payments JSONB DEFAULT '[]',
  
  -- Traditional Financing
  deposit DECIMAL(12,2) DEFAULT 0,
  loan_amount DECIMAL(12,2) DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  loan_term INTEGER DEFAULT 30,
  lvr DECIMAL(5,2) DEFAULT 80,
  
  -- Enhanced Loan Options
  main_loan_type TEXT CHECK (main_loan_type IN ('io', 'pi')) DEFAULT 'pi',
  io_term_years INTEGER DEFAULT 5,
  
  -- Equity Funding Enhanced
  use_equity_funding BOOLEAN DEFAULT FALSE,
  primary_property_value DECIMAL(12,2) DEFAULT 0,
  existing_debt DECIMAL(12,2) DEFAULT 0,
  max_lvr DECIMAL(5,2) DEFAULT 80,
  equity_loan_type TEXT CHECK (equity_loan_type IN ('io', 'pi')) DEFAULT 'pi',
  equity_loan_io_term_years INTEGER DEFAULT 5,
  equity_loan_interest_rate DECIMAL(5,2) DEFAULT 0,
  equity_loan_term INTEGER DEFAULT 30,
  
  -- Deposit Management
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  minimum_deposit_required DECIMAL(12,2) DEFAULT 0,
  
  -- Holding Costs During Construction
  holding_cost_funding TEXT CHECK (holding_cost_funding IN ('cash', 'debt', 'hybrid')) DEFAULT 'cash',
  holding_cost_cash_percentage DECIMAL(5,2) DEFAULT 100,
  capitalize_construction_costs BOOLEAN DEFAULT FALSE,
  construction_equity_repayment_type TEXT CHECK (construction_equity_repayment_type IN ('io', 'pi')) DEFAULT 'io',
  
  -- Separate interest calculations for tax purposes
  land_holding_interest DECIMAL(12,2) DEFAULT 0,
  construction_holding_interest DECIMAL(12,2) DEFAULT 0,
  total_holding_costs DECIMAL(12,2) DEFAULT 0,
  
  -- Purchase Costs
  stamp_duty DECIMAL(12,2) DEFAULT 0,
  legal_fees DECIMAL(8,2) DEFAULT 0,
  inspection_fees DECIMAL(8,2) DEFAULT 0,
  
  -- Construction Costs
  council_fees DECIMAL(8,2) DEFAULT 0,
  architect_fees DECIMAL(8,2) DEFAULT 0,
  site_costs DECIMAL(8,2) DEFAULT 0,
  
  -- Annual Expenses
  property_management DECIMAL(5,2) DEFAULT 0,
  council_rates DECIMAL(8,2) DEFAULT 0,
  insurance DECIMAL(8,2) DEFAULT 0,
  repairs DECIMAL(8,2) DEFAULT 0,
  
  -- Depreciation fields
  depreciation_method TEXT CHECK (depreciation_method IN ('prime-cost', 'diminishing-value')) DEFAULT 'prime-cost',
  is_new_property BOOLEAN DEFAULT TRUE,
  
  -- Additional fields for state and calculations
  property_state TEXT CHECK (property_state IN ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA')),
  
  -- Calculated fields (stored for performance)
  total_project_cost DECIMAL(12,2) DEFAULT 0,
  equity_loan_amount DECIMAL(12,2) DEFAULT 0,
  available_equity DECIMAL(12,2) DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_instances_user_id ON instances(user_id);
CREATE INDEX idx_instances_property_model_id ON instances(property_model_id);
CREATE INDEX idx_instances_status ON instances(status);
CREATE INDEX idx_instances_created_at ON instances(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own instances" ON instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instances" ON instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances" ON instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instances" ON instances
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_instances_updated_at
  BEFORE UPDATE ON instances
  FOR EACH ROW
  EXECUTE FUNCTION update_instances_updated_at();
