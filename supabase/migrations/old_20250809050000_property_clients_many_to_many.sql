-- Migration: Implement many-to-many relationship between properties and clients
-- Allow up to 4 clients per property while maintaining unlimited properties per client

-- 1. Create the property_clients junction table
CREATE TABLE IF NOT EXISTS public.property_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, client_id)
);

-- 2. Enable RLS on property_clients
ALTER TABLE public.property_clients ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for property_clients
DROP POLICY IF EXISTS "Owners can CRUD property_clients via client ownership" ON public.property_clients;

CREATE POLICY "Owners can CRUD property_clients via client ownership" ON public.property_clients
  FOR ALL TO authenticated
  USING (public.is_owner_client(client_id))
  WITH CHECK (public.is_owner_client(client_id));

-- 4. Create function to enforce maximum 4 clients per property
CREATE OR REPLACE FUNCTION public.check_max_clients_per_property()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.property_clients WHERE property_id = NEW.property_id) > 4 THEN
    RAISE EXCEPTION 'Maximum 4 clients allowed per property';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to enforce the constraint
CREATE TRIGGER trg_max_clients_per_property
  BEFORE INSERT OR UPDATE ON public.property_clients
  FOR EACH ROW EXECUTE FUNCTION public.check_max_clients_per_property();

-- 6. Update properties table RLS policy to work with junction table
DROP POLICY IF EXISTS "Owners can CRUD properties via client ownership" ON public.properties;

CREATE POLICY "Owners can CRUD properties via client ownership" ON public.properties
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_clients pc
      JOIN public.clients c ON c.id = pc.client_id
      WHERE pc.property_id = properties.id AND c.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_clients pc
      JOIN public.clients c ON c.id = pc.client_id
      WHERE pc.property_id = properties.id AND c.owner_user_id = auth.uid()
    )
  );

-- 7. Remove client_id column from properties table (if it exists)
-- Note: This will fail if there are existing properties with client_id
-- You may need to migrate existing data first
ALTER TABLE public.properties DROP COLUMN IF EXISTS client_id; 