-- Secure RLS for brew_logs
-- Ensure owner_id column exists (rename from user_id if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brew_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.brew_logs RENAME COLUMN user_id TO owner_id;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brew_logs' AND column_name = 'owner_id') THEN
        ALTER TABLE public.brew_logs ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

ALTER TABLE public.brew_logs ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable update for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.brew_logs;
DROP POLICY IF EXISTS "Users can view their own brew logs" ON public.brew_logs;
DROP POLICY IF EXISTS "Users can insert their own brew logs" ON public.brew_logs;
DROP POLICY IF EXISTS "Users can update their own brew logs" ON public.brew_logs;
DROP POLICY IF EXISTS "Users can delete their own brew logs" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner select" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner insert" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner update" ON public.brew_logs;
DROP POLICY IF EXISTS "Brew logs owner delete" ON public.brew_logs;


-- Create new secure policies
CREATE POLICY "Brew logs owner select"
ON public.brew_logs FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Brew logs owner insert"
ON public.brew_logs FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Brew logs owner update"
ON public.brew_logs FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = owner_id)
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Brew logs owner delete"
ON public.brew_logs FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = owner_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_brew_logs_owner_id ON public.brew_logs(owner_id);
