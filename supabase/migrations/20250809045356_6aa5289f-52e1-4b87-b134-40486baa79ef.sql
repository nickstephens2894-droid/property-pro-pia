-- Add JSONB snapshot to scenarios to support app feature parity
ALTER TABLE public.scenarios
ADD COLUMN IF NOT EXISTS snapshot jsonb;

-- (Optional) Ensure updated_at is maintained if triggers are later added; no trigger changes now.
