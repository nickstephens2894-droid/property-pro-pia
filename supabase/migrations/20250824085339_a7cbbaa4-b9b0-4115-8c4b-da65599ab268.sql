-- Add post construction rate reduction field to instances table
ALTER TABLE public.instances 
ADD COLUMN post_construction_rate_reduction numeric NOT NULL DEFAULT 0.5;