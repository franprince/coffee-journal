-- Add is_public column to recipes table to distinguish between shared/original recipes and private/forked copies
ALTER TABLE public.recipes 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Update existing recipes to be public (optional since default is true, but good for clarity)
UPDATE public.recipes SET is_public = true WHERE is_public IS NULL;

-- Enable RLS for is_public if needed (existing policies cover SELECT/INSERT/UPDATE generally)
-- The public read policy "Public recipes view" handles SELECT using (true), so public recipes are visible.
-- We will filter by is_public=true in the application query for the Community feed.
