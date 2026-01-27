-- Add flavors column to coffees table
ALTER TABLE public.coffees 
ADD COLUMN flavors text[] DEFAULT '{}';

-- Update RLS policies to include new column if necessary (usually not needed for column additions if policy is on row)
-- but good to document.
