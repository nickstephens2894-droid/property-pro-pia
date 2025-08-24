-- Fix critical security issue: Function search path vulnerabilities
-- This addresses the Supabase linter warnings about mutable function search paths

-- Update all functions to use secure search_path
-- Note: This is a security fix to prevent search path manipulation attacks

-- First, let's see what functions exist and fix their search paths
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Loop through all functions in the public schema that don't have search_path set
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- functions only, not procedures
    LOOP
        -- Attempt to set search_path for each function
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', 
                          func_record.schema_name, 
                          func_record.function_name, 
                          func_record.args);
            
            RAISE NOTICE 'Fixed search_path for function: %.%(%)', 
                         func_record.schema_name, 
                         func_record.function_name, 
                         func_record.args;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not fix search_path for function: %.%(%): %', 
                             func_record.schema_name, 
                             func_record.function_name, 
                             func_record.args,
                             SQLERRM;
        END;
    END LOOP;
END
$$;