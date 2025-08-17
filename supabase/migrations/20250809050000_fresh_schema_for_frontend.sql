-- Migration: Fresh database schema for frontend UI
-- This migration creates a completely new, clean database schema
-- Perfectly compatible with Investors, Properties, and Scenarios pages

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles table (one row per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: user can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile row automatically on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Investors table (direct user ownership, no clients)
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  annual_income NUMERIC NOT NULL DEFAULT 0,
  other_income NUMERIC NOT NULL DEFAULT 0,
  non_taxable_income NUMERIC NOT NULL DEFAULT 0,
  has_medicare_levy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own investors
CREATE POLICY "Users can CRUD their own investors" ON public.investors
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_investors_updated
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Properties table (comprehensive fields, direct user ownership)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'House',
  status TEXT NOT NULL DEFAULT 'current',
  
  -- Property Meta
  owned_or_potential TEXT NOT NULL DEFAULT 'Owned',
  is_construction_project BOOLEAN NOT NULL DEFAULT false,
  construction_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  
  -- Property Values
  building_value NUMERIC NOT NULL DEFAULT 0,
  land_value NUMERIC NOT NULL DEFAULT 0,
  construction_value NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  plant_equipment_value NUMERIC NOT NULL DEFAULT 0,
  current_property_value NUMERIC NOT NULL DEFAULT 0,
  weekly_rent NUMERIC NOT NULL DEFAULT 0,
  
  -- Investment Details
  investment_status TEXT NOT NULL DEFAULT 'Investment',
  rental_growth_rate NUMERIC NOT NULL DEFAULT 5,
  capital_growth_rate NUMERIC NOT NULL DEFAULT 7,
  vacancy_rate NUMERIC NOT NULL DEFAULT 2,
  
  -- Purchase Costs
  stamp_duty NUMERIC NOT NULL DEFAULT 0,
  legal_fees NUMERIC NOT NULL DEFAULT 0,
  inspection_fees NUMERIC NOT NULL DEFAULT 0,
  
  -- Construction Costs
  council_approval_fees NUMERIC NOT NULL DEFAULT 0,
  site_costs NUMERIC NOT NULL DEFAULT 0,
  
  -- Annual Expenses
  property_management_percentage NUMERIC NOT NULL DEFAULT 7,
  council_rates NUMERIC NOT NULL DEFAULT 0,
  insurance NUMERIC NOT NULL DEFAULT 0,
  maintenance_repairs NUMERIC NOT NULL DEFAULT 0,
  smoke_alarm_inspection NUMERIC NOT NULL DEFAULT 0,
  pest_treatment NUMERIC NOT NULL DEFAULT 0,
  
  -- Depreciation & Tax
  depreciation_method TEXT NOT NULL DEFAULT 'Prime Cost',
  is_new_property BOOLEAN NOT NULL DEFAULT false,
  
  -- Location & Notes
  location TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own properties
CREATE POLICY "Users can CRUD their own properties" ON public.properties
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_properties_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Property-Investor assignments table
CREATE TABLE IF NOT EXISTS public.property_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC NOT NULL DEFAULT 100,
  cash_contribution NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, investor_id)
);

ALTER TABLE public.property_investors ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage property_investors if they own the property
CREATE POLICY "Users can CRUD property_investors via property ownership" ON public.property_investors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_investors.property_id AND p.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_investors.property_id AND p.owner_user_id = auth.uid()
    )
  );

-- Enforce maximum 4 investors per property
CREATE OR REPLACE FUNCTION public.check_max_investors_per_property()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.property_investors WHERE property_id = NEW.property_id) > 4 THEN
    RAISE EXCEPTION 'Maximum 4 investors allowed per property';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_investors_per_property
  BEFORE INSERT OR UPDATE ON public.property_investors
  FOR EACH ROW EXECUTE FUNCTION public.check_max_investors_per_property();

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_property_investors_updated
  BEFORE UPDATE ON public.property_investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Scenarios table (direct user ownership, no clients)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_core BOOLEAN NOT NULL DEFAULT false,
  snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own scenarios
CREATE POLICY "Users can CRUD their own scenarios" ON public.scenarios
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Enforce at most one core scenario per user
CREATE UNIQUE INDEX unique_core_scenario_per_user
  ON public.scenarios (owner_user_id)
  WHERE is_core;

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_scenarios_updated
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Add comments to document the schema
COMMENT ON TABLE public.investors IS 'Investor profiles with direct user ownership';
COMMENT ON COLUMN public.investors.non_taxable_income IS 'Income that is not subject to tax';
COMMENT ON COLUMN public.investors.has_medicare_levy IS 'Whether investor is subject to Medicare levy';

COMMENT ON TABLE public.properties IS 'Comprehensive property information with direct user ownership';
COMMENT ON COLUMN public.properties.owned_or_potential IS 'Whether property is owned or potential purchase';
COMMENT ON COLUMN public.properties.is_construction_project IS 'Whether this is a construction project';
COMMENT ON COLUMN public.properties.investment_status IS 'Investment, Home, or Holiday property';
COMMENT ON COLUMN public.properties.depreciation_method IS 'Prime Cost or Diminishing Value depreciation method';

COMMENT ON TABLE public.property_investors IS 'Junction table linking properties to investors with ownership details';
COMMENT ON COLUMN public.property_investors.ownership_percentage IS 'Percentage ownership of the property';
COMMENT ON COLUMN public.property_investors.cash_contribution IS 'Cash contribution to the property';

COMMENT ON TABLE public.scenarios IS 'Investment scenarios with comprehensive configuration data';
COMMENT ON COLUMN public.scenarios.snapshot IS 'JSON data containing scenario configuration (financing, equity funding, property selection, etc.)';
COMMENT ON COLUMN public.scenarios.is_core IS 'Whether this is the primary scenario for the user';
