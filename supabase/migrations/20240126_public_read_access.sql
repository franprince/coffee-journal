-- Allow public read access for recipes, coffees, and pours (Community Feed)

-- 1. Drop strict SELECT policies (which were restricted to owner_id)
DROP POLICY IF EXISTS "Coffees owner select" ON public.coffees;
DROP POLICY IF EXISTS "Recipes owner select" ON public.recipes;
DROP POLICY IF EXISTS "Pours owner select" ON public.pours;

-- 2. Create Public SELECT policies
-- We use USING (true) to allow anyone (authenticated or anon if they had access) to read.
-- Since the app is mostly authenticated, this effectively means "any logged in user"
-- unless anon role has usages granted. 
-- We'll just set it to TRUE for simplicity as requested "All recipes are public".

CREATE POLICY "Public coffees view"
ON public.coffees FOR SELECT
USING (true);

CREATE POLICY "Public recipes view"
ON public.recipes FOR SELECT
USING (true);

CREATE POLICY "Public pours view"
ON public.pours FOR SELECT
USING (true);

-- Note: INSERT, UPDATE, DELETE policies remain unchanged (strict owner check)
-- "Coffees owner insert", "Coffees owner update", etc. are still in effect.
