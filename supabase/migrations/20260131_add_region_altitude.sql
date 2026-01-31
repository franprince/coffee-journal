-- Migration: Add farm, altitude, and variety to coffees table
-- Description: Add farm/estate, altitude, and variety fields for better coffee origin tracking

ALTER TABLE public.coffees ADD COLUMN IF NOT EXISTS farm TEXT;
ALTER TABLE public.coffees ADD COLUMN IF NOT EXISTS altitude INTEGER;
ALTER TABLE public.coffees ADD COLUMN IF NOT EXISTS variety TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.coffees.origin IS 'Country and region of origin (e.g., Ethiopia, Yirgacheffe)';
COMMENT ON COLUMN public.coffees.farm IS 'Specific farm or estate name (e.g., Finca El Paraíso)';
COMMENT ON COLUMN public.coffees.altitude IS 'Growing altitude in meters above sea level';
COMMENT ON COLUMN public.coffees.process IS 'Processing method (e.g., Natural, Honey, Washed)';
COMMENT ON COLUMN public.coffees.variety IS 'Coffee variety (e.g., Geisha, Caturra, Bourbon)';
