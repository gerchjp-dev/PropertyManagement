/*
  # Property Management System Database Schema

  1. New Tables
    - `mansions` - Property information
    - `rooms` - Room information
    - `residents` - Resident information
    - `contracts` - Contract information
    - `contract_steps` - Contract process steps
    - `repair_records` - Repair records
    - `repair_progress_steps` - Repair progress steps
    - `resident_requests` - Resident requests
    - `financial_records` - Financial records
    - `contractors` - Contractor information
    - `payment_records` - Payment records
    - `notifications` - Notifications

  2. Security
    - Enable RLS on all tables
    - Add public access policies for unauthenticated users (management app)
    - Data is accessible to all users since this is an internal management system
*/

-- Properties table
CREATE TABLE IF NOT EXISTS mansions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  purchase_date date NOT NULL,
  photo_paths text[] DEFAULT '{}',
  deed_pdf_path text,
  total_rooms integer NOT NULL DEFAULT 0,
  occupancy_rate decimal(5,2) DEFAULT 0,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mansion_id uuid REFERENCES mansions(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  layout text NOT NULL,
  size decimal(6,2) NOT NULL,
  floor integer NOT NULL,
  photo_paths text[] DEFAULT '{}',
  condition_notes text DEFAULT '',
  is_occupied boolean DEFAULT false,
  monthly_rent integer NOT NULL DEFAULT 0,
  maintenance_fee integer DEFAULT 0,
  parking_fee integer DEFAULT 0,
  bicycle_parking_fee integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mansion_id, room_number)
);

-- Residents table
CREATE TABLE IF NOT EXISTS residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  move_in_date date NOT NULL,
  emergency_contact text NOT NULL,
  user_id text UNIQUE,
  password text,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid REFERENCES residents(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  rent integer NOT NULL,
  maintenance_fee integer DEFAULT 0,
  deposit integer DEFAULT 0,
  key_money integer DEFAULT 0,
  guarantor text NOT NULL,
  contract_pdf_path text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'renewal-due')),
  renewal_date date,
  renewal_fee integer DEFAULT 0,
  notes text,
  application_date date,
  approval_date date,
  signing_date date,
  move_in_date date,
  key_handover_date date,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contract steps table
CREATE TABLE IF NOT EXISTS contract_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  category text NOT NULL CHECK (category IN ('application', 'screening', 'approval', 'contract', 'payment', 'move-in', 'other')),
  start_date date,
  completion_date date,
  due_date date,
  document_paths text[] DEFAULT '{}',
  notes text,
  assigned_to text,
  reported_by text,
  reported_date date,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contractors table
CREATE TABLE IF NOT EXISTS contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  specialties text[] DEFAULT '{}',
  hourly_rate integer DEFAULT 0,
  rating integer DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  is_active boolean DEFAULT true,
  last_work_date date,
  notes text,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Repair records table
CREATE TABLE IF NOT EXISTS repair_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  mansion_id uuid REFERENCES mansions(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES contractors(id) ON DELETE SET NULL,
  scope text NOT NULL CHECK (scope IN ('room', 'building')),
  description text NOT NULL,
  request_date date NOT NULL,
  start_date date,
  completion_date date,
  cost integer DEFAULT 0,
  estimated_cost integer DEFAULT 0,
  contractor_name text NOT NULL,
  photo_paths text[] DEFAULT '{}',
  report_pdf_path text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('plumbing', 'electrical', 'interior', 'exterior', 'equipment', 'other')),
  notes text,
  is_deleted boolean DEFAULT false,
  deleted_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Repair progress steps table
CREATE TABLE IF NOT EXISTS repair_progress_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id uuid REFERENCES repair_records(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  start_date date,
  completion_date date,
  photo_paths text[] DEFAULT '{}',
  notes text,
  reported_by text,
  reported_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resident requests table
CREATE TABLE IF NOT EXISTS resident_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid REFERENCES residents(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('repair', 'complaint', 'suggestion', 'inquiry')),
  title text NOT NULL,
  description text NOT NULL,
  photo_paths text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'in-progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  submitted_date date NOT NULL DEFAULT CURRENT_DATE,
  response_date date,
  response text,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Financial records table
CREATE TABLE IF NOT EXISTS financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  subcategory text,
  amount integer NOT NULL,
  description text NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  resident_id uuid REFERENCES residents(id) ON DELETE SET NULL,
  invoice_pdf_path text,
  receipt_pdf_path text,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payee_name text NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL,
  payment_date date NOT NULL,
  due_date date,
  category text NOT NULL CHECK (category IN ('contractor', 'utility', 'maintenance', 'insurance', 'tax', 'other')),
  payment_method text NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  bank_name text,
  branch_name text,
  account_type text CHECK (account_type IN ('checking', 'savings')),
  account_number text,
  account_name text,
  invoice_number text,
  receipt_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('contract-renewal', 'payment-overdue', 'repair-request', 'maintenance-scheduled', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mansions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_progress_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal management system without Supabase auth)
CREATE POLICY "Public access to mansions" ON mansions FOR ALL USING (true);
CREATE POLICY "Public access to rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Public access to residents" ON residents FOR ALL USING (true);
CREATE POLICY "Public access to contracts" ON contracts FOR ALL USING (true);
CREATE POLICY "Public access to contract_steps" ON contract_steps FOR ALL USING (true);
CREATE POLICY "Public access to contractors" ON contractors FOR ALL USING (true);
CREATE POLICY "Public access to repair_records" ON repair_records FOR ALL USING (true);
CREATE POLICY "Public access to repair_progress_steps" ON repair_progress_steps FOR ALL USING (true);
CREATE POLICY "Public access to resident_requests" ON resident_requests FOR ALL USING (true);
CREATE POLICY "Public access to financial_records" ON financial_records FOR ALL USING (true);
CREATE POLICY "Public access to payment_records" ON payment_records FOR ALL USING (true);
CREATE POLICY "Public access to notifications" ON notifications FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_mansion_id ON rooms(mansion_id);
CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id);
CREATE INDEX IF NOT EXISTS idx_contracts_resident_id ON contracts(resident_id);
CREATE INDEX IF NOT EXISTS idx_contract_steps_contract_id ON contract_steps(contract_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_mansion_id ON repair_records(mansion_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_room_id ON repair_records(room_id);
CREATE INDEX IF NOT EXISTS idx_repair_progress_steps_repair_id ON repair_progress_steps(repair_id);
CREATE INDEX IF NOT EXISTS idx_resident_requests_resident_id ON resident_requests(resident_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-update updated_at triggers
CREATE TRIGGER update_mansions_updated_at BEFORE UPDATE ON mansions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_steps_updated_at BEFORE UPDATE ON contract_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_records_updated_at BEFORE UPDATE ON repair_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_progress_steps_updated_at BEFORE UPDATE ON repair_progress_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_requests_updated_at BEFORE UPDATE ON resident_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();