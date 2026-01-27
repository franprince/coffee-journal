-- Migration: 20260126_05_update_rls_public
-- Description: Update RLS policies to strictly enforce public/private visibility for recipes and pours.

-- 1. DROP existing insecure or conflicting policies on recipes
DROP POLICY IF EXISTS "Public recipes view" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes access for ALL" ON public.recipes;
DROP POLICY IF EXISTS "Recipes owner select" ON public.recipes; -- Re-defining this to be cleaner or combined

-- 2. Create correct policies for RECIPES

-- Policy: Owners can do everything on their own recipes
CREATE POLICY "Recipes owner all"
ON public.recipes
FOR ALL -- SELECT, INSERT, UPDATE, DELETE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Everyone (inclusive of anonymous) can view public recipes
CREATE POLICY "Public recipes select"
ON public.recipes
FOR SELECT
TO public
USING (is_public = true);


-- 3. DROP existing policies on POURS to align with new recipe visibility
DROP POLICY IF EXISTS "Pours owner select" ON public.pours;
DROP POLICY IF EXISTS "Pours owner insert" ON public.pours;
DROP POLICY IF EXISTS "Pours owner update" ON public.pours;
DROP POLICY IF EXISTS "Pours owner delete" ON public.pours;
DROP POLICY IF EXISTS "Public pours access for ALL" ON public.pours;

-- 4. Create correct policies for POURS

-- Policy: Owners can do everything on pours of their own recipes
CREATE POLICY "Pours owner all"
ON public.pours
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = recipe_id
        AND public.recipes.owner_id = auth.uid()
    )
);

-- Policy: Everyone can view pours of public recipes
CREATE POLICY "Public pours select"
ON public.pours
FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.recipes
        WHERE public.recipes.id = public.pours.recipe_id
        AND public.recipes.is_public = true
    )
);
