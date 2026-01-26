-- Secure RLS for coffees, recipes, and pours (Optimized & Strict)

-- 1. Ensure user_id column exists (without DEFAULT auth.uid() to avoid context issues in DDL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coffees' AND column_name = 'user_id') THEN
        ALTER TABLE public.coffees ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'user_id') THEN
        ALTER TABLE public.recipes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pours ENABLE ROW LEVEL SECURITY;

-- 3. Drop insecure policies
DROP POLICY IF EXISTS "Public coffees access for ALL" ON public.coffees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable update for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.coffees;

DROP POLICY IF EXISTS "Public recipes access for ALL" ON public.recipes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.recipes;

DROP POLICY IF EXISTS "Public pours access for ALL" ON public.pours;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable update for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.pours;

-- Drop secure policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Users can view their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can insert their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can update their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can delete their own coffees" ON public.coffees;

DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;

DROP POLICY IF EXISTS "Users can view pours of their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can insert pours to their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can update pours of their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can delete pours of their recipes" ON public.pours;

-- 4. Create secure policies (Authenticated only, optimized UID check)

-- COFFEES
CREATE POLICY "Users can view their own coffees"
ON public.coffees FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own coffees"
ON public.coffees FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own coffees"
ON public.coffees FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own coffees"
ON public.coffees FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- RECIPES
CREATE POLICY "Users can view their own recipes"
ON public.recipes FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own recipes"
ON public.recipes FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own recipes"
ON public.recipes FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own recipes"
ON public.recipes FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- POURS (via recipe ownership)
CREATE POLICY "Users can view pours of their recipes"
ON public.pours FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Users can insert pours to their recipes"
ON public.pours FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = recipe_id
        AND public.recipes.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Users can update pours of their recipes"
ON public.pours FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = recipe_id
        AND public.recipes.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Users can delete pours of their recipes"
ON public.pours FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.user_id = (SELECT auth.uid())
    )
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coffees_user_id ON public.coffees(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_pours_recipe_id ON public.pours(recipe_id);
