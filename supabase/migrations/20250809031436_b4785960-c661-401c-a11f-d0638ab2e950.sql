-- Enable required extensions if not already present (gen_random_uuid is typically available)
-- Note: Avoid altering reserved schemas; using public schema only

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('individual', 'advisor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.property_status AS ENUM ('current', 'new');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Common updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Profiles table (one row per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role public.user_role NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: user can view and update their own profile
DO $$ BEGIN
  CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger to auto-update updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Clients (owned by a user; advisors own many, individuals own exactly one in app logic)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Owners can CRUD their clients" ON public.clients
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_clients_updated
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper function: check client ownership
CREATE OR REPLACE FUNCTION public.is_owner_client(_client_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = _client_id AND c.owner_user_id = auth.uid()
  );
$$;

-- 5) Investors (up to 4 per client)
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  annual_income NUMERIC NOT NULL DEFAULT 0,
  other_income NUMERIC NOT NULL DEFAULT 0,
  has_medicare_levy BOOLEAN NOT NULL DEFAULT false,
  ownership_percentage NUMERIC,
  loan_share_percentage NUMERIC,
  cash_contribution NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Owners can CRUD investors via client ownership" ON public.investors
  FOR ALL TO authenticated
  USING (public.is_owner_client(client_id))
  WITH CHECK (public.is_owner_client(client_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_investors_updated
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6) Properties (current vs new)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  weekly_rent NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  notes TEXT,
  status public.property_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Owners can CRUD properties via client ownership" ON public.properties
  FOR ALL TO authenticated
  USING (public.is_owner_client(client_id))
  WITH CHECK (public.is_owner_client(client_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_properties_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) Scenarios (single core per client + multiple hypothetical)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_core BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Owners can CRUD scenarios via client ownership" ON public.scenarios
  FOR ALL TO authenticated
  USING (public.is_owner_client(client_id))
  WITH CHECK (public.is_owner_client(client_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enforce at most one core scenario per client
DO $$ BEGIN
  CREATE UNIQUE INDEX unique_core_scenario_per_client
  ON public.scenarios (client_id)
  WHERE is_core;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_scenarios_updated
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: check scenario ownership
CREATE OR REPLACE FUNCTION public.is_owner_scenario(_scenario_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.scenarios s
    JOIN public.clients c ON c.id = s.client_id
    WHERE s.id = _scenario_id AND c.owner_user_id = auth.uid()
  );
$$;

-- 8) Scenario-Properties join (portfolio modeling)
CREATE TABLE IF NOT EXISTS public.scenario_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, property_id)
);

ALTER TABLE public.scenario_properties ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Owners can CRUD scenario_properties via scenario ownership" ON public.scenario_properties
  FOR ALL TO authenticated
  USING (public.is_owner_scenario(scenario_id))
  WITH CHECK (public.is_owner_scenario(scenario_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;