-- Migration: 20260126_06_secure_logs_coffees
-- Description: Ensure strict RLS for brew_logs and coffees.

-- 1. BREW LOGS
ALTER TABLE public.brew_logs ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies if any
DROP POLICY IF EXISTS "Public brew_logs access for ALL" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner select" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner insert" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner update" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner delete" ON public.brew_logs;

-- Create strict owner policies
CREATE POLICY "Brew logs owner all"
ON public.brew_logs
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());


-- 2. COFFEES (Re-affirming security)
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;

-- Drop potential old policies to be clean
DROP POLICY IF EXISTS "Coffees owner select" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner insert" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner update" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner delete" ON public.coffees;
DROP POLICY IF EXISTS "Public coffees access for ALL" ON public.coffees;

-- Create strict owner policies
CREATE POLICY "Coffees owner all"
ON public.coffees
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
