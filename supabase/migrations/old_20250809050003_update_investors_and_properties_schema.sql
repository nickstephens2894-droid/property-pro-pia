-- Migration: Update investors and properties tables for new form requirements
-- This migration removes client dependencies and adds missing fields

-- 1. Update Investors table
-- Add missing fields and remove client dependency
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS non_taxable_income NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing investors to set owner_user_id based on their client ownership
UPDATE public.investors 
SET owner_user_id = (
  SELECT c.owner_user_id 
  FROM public.clients c 
  WHERE c.id = public.investors.client_id
)
WHERE owner_user_id IS NULL AND client_id IS NOT NULL;

-- Make owner_user_id NOT NULL after populating existing data
ALTER TABLE public.investors 
ALTER COLUMN owner_user_id SET NOT NULL;

-- Drop the client_id column and related constraints
ALTER TABLE public.investors 
DROP CONSTRAINT IF EXISTS investors_client_id_fkey;

ALTER TABLE public.investors 
DROP COLUMN IF EXISTS client_id;

-- Update RLS policies to work with owner_user_id instead of client ownership
DROP POLICY IF EXISTS "Owners can CRUD investors via client ownership" ON public.investors;

CREATE POLICY "Users can CRUD their own investors" ON public.investors
FOR ALL TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 2. Update Properties table
-- Add missing fields for comprehensive property management
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add all the missing fields from the comprehensive form
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owned_or_potential TEXT NOT NULL DEFAULT 'Owned',
ADD COLUMN IF NOT EXISTS is_construction_project BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS construction_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN IF NOT EXISTS building_value NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS land_value NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS construction_value NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS plant_equipment_value NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_property_value NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS investment_status TEXT NOT NULL DEFAULT 'Investment',
ADD COLUMN IF NOT EXISTS rental_growth_rate NUMERIC NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS capital_growth_rate NUMERIC NOT NULL DEFAULT 7,
ADD COLUMN IF NOT EXISTS vacancy_rate NUMERIC NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS stamp_duty NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS legal_fees NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS inspection_fees NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS council_approval_fees NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS site_costs NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_management_percentage NUMERIC NOT NULL DEFAULT 7,
ADD COLUMN IF NOT EXISTS council_rates NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_repairs NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS smoke_alarm_inspection NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pest_treatment NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS depreciation_method TEXT NOT NULL DEFAULT 'Prime Cost',
ADD COLUMN IF NOT EXISTS is_new_property BOOLEAN NOT NULL DEFAULT false;

-- Update existing properties to set owner_user_id (will be set to a default user for now)
-- Note: This is a placeholder - you may need to set this based on your user management
UPDATE public.properties 
SET owner_user_id = (
  SELECT id FROM auth.users LIMIT 1
)
WHERE owner_user_id IS NULL;

-- Make owner_user_id NOT NULL after populating existing data
ALTER TABLE public.properties 
ALTER COLUMN owner_user_id SET NOT NULL;

-- Update RLS policies to work with owner_user_id instead of client ownership
DROP POLICY IF EXISTS "Owners can CRUD properties via client ownership" ON public.properties;

CREATE POLICY "Users can CRUD their own properties" ON public.properties
FOR ALL TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 3. Create Property-Investor assignments table
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

-- Policy: Users can manage property_investors if they own the property
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

-- Add trigger to auto-update updated_at
CREATE TRIGGER trg_property_investors_updated
BEFORE UPDATE ON public.property_investors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Clean up old property_clients table (no longer needed)
-- Note: Only drop if you're sure you don't need this data
-- DROP TABLE IF EXISTS public.property_clients CASCADE;

-- Add comments to document the changes
COMMENT ON COLUMN public.investors.owner_user_id IS 'Direct ownership by user, no longer tied to clients';
COMMENT ON COLUMN public.investors.non_taxable_income IS 'Income that is not subject to tax';
COMMENT ON COLUMN public.properties.owner_user_id IS 'Direct ownership by user, no longer tied to clients';
COMMENT ON COLUMN public.properties.owned_or_potential IS 'Whether property is owned or potential purchase';
COMMENT ON COLUMN public.properties.is_construction_project IS 'Whether this is a construction project';
COMMENT ON COLUMN public.properties.investment_status IS 'Investment, Home, or Holiday property';
COMMENT ON COLUMN public.properties.depreciation_method IS 'Prime Cost or Diminishing Value depreciation method';
COMMENT ON TABLE public.property_investors IS 'Junction table linking properties to investors with ownership details';
