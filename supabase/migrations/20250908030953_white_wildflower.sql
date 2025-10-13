/*
  # Remove bicycle_parking_fee column from rooms table

  1. Changes
    - Remove `bicycle_parking_fee` column from `rooms` table
    - This column was causing schema cache errors in Supabase

  2. Notes
    - Only `parking_fee` will be used for parking-related charges
    - Existing data in this column will be lost
*/

-- Remove bicycle_parking_fee column from rooms table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'bicycle_parking_fee'
  ) THEN
    ALTER TABLE rooms DROP COLUMN bicycle_parking_fee;
  END IF;
END $$;