-- Migration: Add deposit_amount column to property_models table
-- This migration adds the missing deposit_amount field for new properties

-- Add deposit amount field (for new properties)
ALTER TABLE property_models 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;

-- Add comment to document the new field
COMMENT ON COLUMN property_models.deposit_amount IS 'Cash deposit amount for new properties';



