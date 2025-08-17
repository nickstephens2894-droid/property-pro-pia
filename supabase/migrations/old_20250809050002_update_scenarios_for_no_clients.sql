-- Migration: Update scenarios table to work without client dependencies
-- This migration removes client_id dependency and adds owner_user_id for direct user ownership

-- Add owner_user_id column to scenarios table
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add snapshot column for storing scenario configuration data
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS snapshot JSONB DEFAULT '{}';

-- Update existing scenarios to set owner_user_id based on their client ownership
UPDATE public.scenarios 
SET owner_user_id = (
  SELECT c.owner_user_id 
  FROM public.clients c 
  WHERE c.id = public.scenarios.client_id
)
WHERE owner_user_id IS NULL AND client_id IS NOT NULL;

-- Make owner_user_id NOT NULL after populating existing data
ALTER TABLE public.scenarios 
ALTER COLUMN owner_user_id SET NOT NULL;

-- Drop the client_id column and related constraints
ALTER TABLE public.scenarios 
DROP CONSTRAINT IF EXISTS scenarios_client_id_fkey;

ALTER TABLE public.scenarios 
DROP COLUMN IF EXISTS client_id;

-- Drop the unique index for core scenarios per client (no longer needed)
DROP INDEX IF EXISTS unique_core_scenario_per_client;

-- Create new unique index for core scenarios per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_core_scenario_per_user
ON public.scenarios (owner_user_id)
WHERE is_core;

-- Update RLS policies to work with owner_user_id instead of client ownership
DROP POLICY IF EXISTS "Owners can CRUD scenarios via client ownership" ON public.scenarios;

CREATE POLICY "Users can CRUD their own scenarios" ON public.scenarios
FOR ALL TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- Update the is_owner_scenario helper function
CREATE OR REPLACE FUNCTION public.is_owner_scenario(_scenario_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.scenarios s
    WHERE s.id = _scenario_id AND s.owner_user_id = auth.uid()
  );
$$;

-- Add comments to document the changes
COMMENT ON COLUMN public.scenarios.owner_user_id IS 'Direct ownership by user, no longer tied to clients';
COMMENT ON COLUMN public.scenarios.snapshot IS 'JSON data containing scenario configuration (financing, equity funding, property selection, etc.)';
