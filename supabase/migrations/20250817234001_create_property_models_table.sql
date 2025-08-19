-- Migration: Create Property Models Table and Clean Up Old Schema
-- This migration creates the property_models table for property templates
-- and cleans up the old properties table structure

-- 1. First, let's clean up any old properties table that might conflict
DROP TABLE IF EXISTS public.old_properties CASCADE;
DROP TABLE IF EXISTS public.scenario_properties CASCADE;

-- 2. Create the property_models table for property templates
CREATE TABLE IF NOT EXISTS public.property_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'Apartment',
  property_method TEXT NOT NULL DEFAULT 'built-first-owner',
  
  -- Property Basics
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  weekly_rent NUMERIC NOT NULL DEFAULT 0,
  rental_growth_rate NUMERIC NOT NULL DEFAULT 5.0,
  vacancy_rate NUMERIC NOT NULL DEFAULT 2.0,
  location TEXT NOT NULL DEFAULT 'NSW',
  
  -- Construction Details
  construction_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  is_construction_project BOOLEAN NOT NULL DEFAULT false,
  land_value NUMERIC NOT NULL DEFAULT 0,
  construction_value NUMERIC NOT NULL DEFAULT 0,
  construction_period INTEGER NOT NULL DEFAULT 0,
  construction_interest_rate NUMERIC NOT NULL DEFAULT 7.0,
  building_value NUMERIC NOT NULL DEFAULT 0,
  plant_equipment_value NUMERIC NOT NULL DEFAULT 0,
  
  -- Transaction Costs
  stamp_duty NUMERIC NOT NULL DEFAULT 0,
  legal_fees NUMERIC NOT NULL DEFAULT 0,
  inspection_fees NUMERIC NOT NULL DEFAULT 0,
  council_fees NUMERIC NOT NULL DEFAULT 0,
  architect_fees NUMERIC NOT NULL DEFAULT 0,
  site_costs NUMERIC NOT NULL DEFAULT 0,
  
  -- Ongoing Expenses
  property_management NUMERIC NOT NULL DEFAULT 8.0,
  council_rates NUMERIC NOT NULL DEFAULT 0,
  insurance NUMERIC NOT NULL DEFAULT 0,
  repairs NUMERIC NOT NULL DEFAULT 0,
  
  -- Depreciation & Tax
  depreciation_method TEXT NOT NULL DEFAULT 'prime-cost',
  is_new_property BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_property_method CHECK (
    property_method IN ('house-land-construction', 'built-first-owner', 'built-second-owner')
  ),
  CONSTRAINT valid_property_type CHECK (
    property_type IN ('Apartment', 'House', 'Townhouse', 'Unit', 'Land', 'Commercial')
  ),
  CONSTRAINT valid_depreciation_method CHECK (
    depreciation_method IN ('prime-cost', 'diminishing-value')
  )
);

-- 3. Enable RLS on property_models
ALTER TABLE public.property_models ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own property models
CREATE POLICY "Users can CRUD their own property models" ON public.property_models
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 4. Create indexes for better performance
CREATE INDEX idx_property_models_owner ON public.property_models(owner_user_id);
CREATE INDEX idx_property_models_property_type ON public.property_models(property_type);
CREATE INDEX idx_property_models_property_method ON public.property_models(property_method);
CREATE INDEX idx_property_models_location ON public.property_models(location);

-- 5. Create trigger to auto-update updated_at
CREATE TRIGGER trg_property_models_updated
  BEFORE UPDATE ON public.property_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add comments to document the schema
COMMENT ON TABLE public.property_models IS 'Property template models for quick instance setup';
COMMENT ON COLUMN public.property_models.property_method IS 'House & Land Construction, Built Property First Owner, or Built Property Second Owner';
COMMENT ON COLUMN public.property_models.property_type IS 'Type of property (Apartment, House, etc.)';
COMMENT ON COLUMN public.property_models.depreciation_method IS 'Prime Cost or Diminishing Value depreciation method';

-- 7. Insert some default property models for demonstration
INSERT INTO public.property_models (
  owner_user_id,
  name,
  description,
  property_type,
  property_method,
  purchase_price,
  weekly_rent,
  rental_growth_rate,
  vacancy_rate,
  location,
  construction_year,
  is_construction_project,
  land_value,
  construction_value,
  construction_period,
  construction_interest_rate,
  building_value,
  plant_equipment_value,
  stamp_duty,
  legal_fees,
  inspection_fees,
  council_fees,
  architect_fees,
  site_costs,
  property_management,
  council_rates,
  insurance,
  repairs,
  depreciation_method,
  is_new_property
) VALUES 
-- Sydney CBD Apartment
(
  (SELECT id FROM auth.users LIMIT 1),
  'Sydney CBD Apartment',
  'High-yield CBD apartment for investment',
  'Apartment',
  'built-first-owner',
  850000,
  850,
  5.0,
  2.0,
  'NSW',
  2024,
  false,
  0,
  0,
  0,
  0,
  850000,
  0,
  34000,
  1500,
  600,
  0,
  0,
  0,
  8.0,
  2200,
  1200,
  1500,
  'prime-cost',
  true
),
-- Melbourne House & Land
(
  (SELECT id FROM auth.users LIMIT 1),
  'Melbourne House & Land',
  'New construction project in growth area',
  'House',
  'house-land-construction',
  1200000,
  1200,
  5.0,
  2.0,
  'VIC',
  2024,
  true,
  300000,
  900000,
  8,
  7.0,
  0,
  0,
  48000,
  2000,
  800,
  3000,
  8000,
  12000,
  8.0,
  2500,
  1500,
  2000,
  'prime-cost',
  true
),
-- Brisbane Established House
(
  (SELECT id FROM auth.users LIMIT 1),
  'Brisbane Established House',
  'Established property with good rental history',
  'House',
  'built-second-owner',
  750000,
  750,
  5.0,
  2.0,
  'QLD',
  2015,
  false,
  0,
  0,
  0,
  0,
  750000,
  0,
  30000,
  1500,
  600,
  0,
  0,
  0,
  7.5,
  2000,
  1000,
  1200,
  'diminishing-value',
  false
);

-- 8. Update the existing properties table to work with the new system
-- Add a reference to property_models if this property was created from a model
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS source_model_id UUID REFERENCES public.property_models(id),
ADD COLUMN IF NOT EXISTS is_from_template BOOLEAN NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.properties.source_model_id IS 'Reference to the property model this property was created from';
COMMENT ON COLUMN public.properties.is_from_template IS 'Whether this property was created from a property model template';
