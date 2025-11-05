-- Migration: Fix the rating trigger function to use SECURITY DEFINER
-- This allows the function to update toilets table even when triggered by regular users

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS trigger_update_toilet_rating ON ratings;

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_toilet_average_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE toilets
  SET average_rating = (
    SELECT COALESCE(AVG(stars::DOUBLE PRECISION), 0)
    FROM ratings
    WHERE toilet_id = COALESCE(NEW.toilet_id, OLD.toilet_id)
  )
  WHERE id = COALESCE(NEW.toilet_id, OLD.toilet_id);
  
  RETURN NULL;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_toilet_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_toilet_average_rating();

