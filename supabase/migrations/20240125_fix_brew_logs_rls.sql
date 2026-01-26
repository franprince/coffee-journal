-- Fix RLS Policy for brew_logs

-- 1. Ensure user_id column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brew_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.brew_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.brew_logs ENABLE ROW LEVEL SECURITY;

-- 3. Drop insecure policies
DROP POLICY IF EXISTS "Public brew_logs access for ALL" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable update for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.brew_logs;

-- 4. Create secure policies

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own brew_logs"
ON public.brew_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own logs
CREATE POLICY "Users can insert their own brew_logs"
ON public.brew_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own logs
CREATE POLICY "Users can update their own brew_logs"
ON public.brew_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own logs
CREATE POLICY "Users can delete their own brew_logs"
ON public.brew_logs
FOR DELETE
USING (auth.uid() = user_id);
