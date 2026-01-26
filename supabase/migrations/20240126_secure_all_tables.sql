-- Secure RLS for coffees, recipes, and pours (Using owner_id pattern)

-- 1. Ensure owner_id column exists (instead of user_id to match brew_logs pattern)
-- We check for user_id and rename if it exists from previous attempts, otherwise add owner_id
DO $$
BEGIN
    -- Handle COFFEES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coffees' AND column_name = 'user_id') THEN
        ALTER TABLE public.coffees RENAME COLUMN user_id TO owner_id;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coffees' AND column_name = 'owner_id') THEN
        ALTER TABLE public.coffees ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;

    -- Handle RECIPES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'user_id') THEN
        ALTER TABLE public.recipes RENAME COLUMN user_id TO owner_id;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'owner_id') THEN
        ALTER TABLE public.recipes ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pours ENABLE ROW LEVEL SECURITY;

-- 3. Drop OLD insecure or incorrect policies
DROP POLICY IF EXISTS "Public coffees access for ALL" ON public.coffees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable update for all users" ON public.coffees;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.coffees;
-- Drop previous user_id based policies if created
DROP POLICY IF EXISTS "Users can view their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can insert their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can update their own coffees" ON public.coffees;
DROP POLICY IF EXISTS "Users can delete their own coffees" ON public.coffees;

DROP POLICY IF EXISTS "Public recipes access for ALL" ON public.recipes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.recipes;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.recipes;
-- Drop previous user_id based policies
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;

DROP POLICY IF EXISTS "Public pours access for ALL" ON public.pours;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable update for all users" ON public.pours;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.pours;
-- Drop previous policies
DROP POLICY IF EXISTS "Users can view pours of their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can insert pours to their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can update pours of their recipes" ON public.pours;
DROP POLICY IF EXISTS "Users can delete pours of their recipes" ON public.pours;

-- Drop new policies if they exist (idempotency for this script)
DROP POLICY IF EXISTS "Coffees owner select" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner insert" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner update" ON public.coffees;
DROP POLICY IF EXISTS "Coffees owner delete" ON public.coffees;

DROP POLICY IF EXISTS "Recipes owner select" ON public.recipes;
DROP POLICY IF EXISTS "Recipes owner insert" ON public.recipes;
DROP POLICY IF EXISTS "Recipes owner update" ON public.recipes;
DROP POLICY IF EXISTS "Recipes owner delete" ON public.recipes;

DROP POLICY IF EXISTS "Pours owner select" ON public.pours;
DROP POLICY IF EXISTS "Pours owner insert" ON public.pours;
DROP POLICY IF EXISTS "Pours owner update" ON public.pours;
DROP POLICY IF EXISTS "Pours owner delete" ON public.pours;


-- 4. Create secure policies (Using owner_id pattern)

-- COFFEES
CREATE POLICY "Coffees owner select"
ON public.coffees FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Coffees owner insert"
ON public.coffees FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Coffees owner update"
ON public.coffees FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = owner_id)
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Coffees owner delete"
ON public.coffees FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = owner_id);

-- RECIPES
CREATE POLICY "Recipes owner select"
ON public.recipes FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Recipes owner insert"
ON public.recipes FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Recipes owner update"
ON public.recipes FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = owner_id)
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Recipes owner delete"
ON public.recipes FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = owner_id);

-- POURS (via recipe ownership)
-- Check if the associated recipe is owned by the user
CREATE POLICY "Pours owner select"
ON public.pours FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.owner_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Pours owner insert"
ON public.pours FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = recipe_id
        AND public.recipes.owner_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Pours owner update"
ON public.pours FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.owner_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = recipe_id
        AND public.recipes.owner_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Pours owner delete"
ON public.pours FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.owner_id = (SELECT auth.uid())
    )
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coffees_owner_id ON public.coffees(owner_id);
CREATE INDEX IF NOT EXISTS idx_recipes_owner_id ON public.recipes(owner_id);
-- Ensure index on foreign key for pours exists
CREATE INDEX IF NOT EXISTS idx_pours_recipe_id ON public.pours(recipe_id);
