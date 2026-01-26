-- Secure RLS for coffees, recipes, and pours

-- 1. Ensure user_id column exists on coffees
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coffees' AND column_name = 'user_id') THEN
        ALTER TABLE public.coffees ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- 2. Ensure user_id column exists on recipes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_id') THEN
        ALTER TABLE public.recipes ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- 3. Enable RLS on all tables
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pours ENABLE ROW LEVEL SECURITY;

-- 4. Drop insecure policies (if any exist)
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

-- 5. Create secure policies for COFFEES
CREATE POLICY "Users can view their own coffees"
ON public.coffees FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coffees"
ON public.coffees FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coffees"
ON public.coffees FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coffees"
ON public.coffees FOR DELETE
USING (auth.uid() = user_id);

-- 6. Create secure policies for RECIPES
CREATE POLICY "Users can view their own recipes"
ON public.recipes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
ON public.recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
ON public.recipes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
ON public.recipes FOR DELETE
USING (auth.uid() = user_id);

-- 7. Create secure policies for POURS (via recipe ownership)
-- Users can see pours if they own the recipe
CREATE POLICY "Users can view pours of their recipes"
ON public.pours FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE recipes.id = pours.recipe_id
        AND recipes.user_id = auth.uid()
    )
);

-- Users can insert pours into their own recipes
CREATE POLICY "Users can insert pours to their recipes"
ON public.pours FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE recipes.id = recipe_id
        AND recipes.user_id = auth.uid()
    )
);

-- Users can update pours of their recipes
CREATE POLICY "Users can update pours of their recipes"
ON public.pours FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE recipes.id = pours.recipe_id
        AND recipes.user_id = auth.uid()
    )
);

-- Users can delete pours of their recipes
CREATE POLICY "Users can delete pours of their recipes"
ON public.pours FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE recipes.id = pours.recipe_id
        AND recipes.user_id = auth.uid()
    )
);
