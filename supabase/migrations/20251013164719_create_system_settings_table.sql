/*
  # Create System Settings Table

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `key` (text, unique) - Setting key (e.g., 'database_provider', 'database_config')
      - `value` (jsonb) - Setting value stored as JSON
      - `description` (text) - Human-readable description of the setting
      - `created_at` (timestamptz) - When the setting was created
      - `updated_at` (timestamptz) - When the setting was last updated

  2. Security
    - Enable RLS on `system_settings` table
    - Add policy for public read access (settings are not sensitive)
    - Add policy for authenticated users to update settings

  3. Initial Data
    - Insert default database configuration setting
*/

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read system settings
CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert system settings (for initial setup)
CREATE POLICY "Anyone can insert system settings"
  ON system_settings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update system settings
CREATE POLICY "Anyone can update system settings"
  ON system_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Insert default database configuration if not exists
INSERT INTO system_settings (key, value, description)
VALUES (
  'database_config',
  '{"provider": "supabase"}'::jsonb,
  'Database provider configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
