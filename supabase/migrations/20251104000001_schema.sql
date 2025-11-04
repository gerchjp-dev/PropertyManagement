/*
  物件管理システム - データベーススキーマ定義
  
  このファイルには以下が含まれます：
  - 全テーブル定義
  - インデックス
  - トリガー関数
  - RLS (Row Level Security) 設定
  - 外部キー制約
*/

-- =============================================================================
-- 1. ヘルパー関数の作成
-- =============================================================================

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 2. メインエンティティテーブル
-- =============================================================================

-- 物件テーブル
CREATE TABLE IF NOT EXISTS mansions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    photo_paths TEXT[] DEFAULT '{}',
    deed_pdf_path TEXT,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 部屋テーブル
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mansion_id UUID REFERENCES mansions(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    layout TEXT NOT NULL,
    size DECIMAL(6,2) NOT NULL,
    floor INTEGER NOT NULL,
    photo_paths TEXT[] DEFAULT '{}',
    condition_notes TEXT DEFAULT '',
    is_occupied BOOLEAN DEFAULT false,
    monthly_rent INTEGER NOT NULL DEFAULT 0,
    maintenance_fee INTEGER DEFAULT 0,
    parking_fee INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mansion_id, room_number)
);

-- 住民テーブル
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    move_in_date DATE NOT NULL,
    emergency_contact TEXT NOT NULL,
    user_id TEXT UNIQUE,
    password TEXT,
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 業者テーブル
CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    hourly_rate INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    last_work_date DATE,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. 管理・運用テーブル
-- =============================================================================

-- 契約テーブル
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent INTEGER NOT NULL,
    maintenance_fee INTEGER DEFAULT 0,
    deposit INTEGER DEFAULT 0,
    key_money INTEGER DEFAULT 0,
    guarantor TEXT NOT NULL,
    contract_pdf_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'renewal-due')),
    renewal_date DATE,
    renewal_fee INTEGER DEFAULT 0,
    notes TEXT,
    application_date DATE,
    approval_date DATE,
    signing_date DATE,
    move_in_date DATE,
    key_handover_date DATE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 修繕記録テーブル
CREATE TABLE IF NOT EXISTS repair_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    mansion_id UUID REFERENCES mansions(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    scope TEXT NOT NULL CHECK (scope IN ('room', 'building')),
    description TEXT NOT NULL,
    request_date DATE NOT NULL,
    start_date DATE,
    completion_date DATE,
    cost INTEGER DEFAULT 0,
    estimated_cost INTEGER DEFAULT 0,
    contractor_name TEXT NOT NULL,
    photo_paths TEXT[] DEFAULT '{}',
    report_pdf_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('plumbing', 'electrical', 'interior', 'exterior', 'equipment', 'other')),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 財務記録テーブル
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    subcategory TEXT,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
    invoice_pdf_path TEXT,
    receipt_pdf_path TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 支払い記録テーブル
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payee_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE,
    category TEXT NOT NULL CHECK (category IN ('contractor', 'utility', 'maintenance', 'insurance', 'tax', 'other')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    bank_name TEXT,
    branch_name TEXT,
    account_type TEXT CHECK (account_type IN ('checking', 'savings')),
    account_number TEXT,
    account_name TEXT,
    invoice_number TEXT,
    receipt_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. プロセス管理テーブル
-- =============================================================================

-- 契約手続きステップテーブル
CREATE TABLE IF NOT EXISTS contract_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    category TEXT NOT NULL CHECK (category IN ('application', 'screening', 'approval', 'contract', 'payment', 'move-in', 'other')),
    start_date DATE,
    completion_date DATE,
    due_date DATE,
    document_paths TEXT[] DEFAULT '{}',
    notes TEXT,
    assigned_to TEXT,
    reported_by TEXT,
    reported_date DATE,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 修繕進捗ステップテーブル
CREATE TABLE IF NOT EXISTS repair_progress_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_id UUID REFERENCES repair_records(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    start_date DATE,
    completion_date DATE,
    photo_paths TEXT[] DEFAULT '{}',
    notes TEXT,
    reported_by TEXT,
    reported_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 住民要望テーブル
CREATE TABLE IF NOT EXISTS resident_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('repair', 'complaint', 'suggestion', 'inquiry')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_paths TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'in-progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_date DATE,
    response TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. システム管理テーブル
-- =============================================================================

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('contract-renewal', 'payment-overdue', 'repair-request', 'maintenance-scheduled', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- コンテンツ管理テーブル
CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    locale TEXT NOT NULL,
    title TEXT,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_path, locale)
);

-- レポートテーブル
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pmc_id UUID NOT NULL,
    report_title TEXT NOT NULL,
    report_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. プロジェクト管理テーブル
-- =============================================================================

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    work_time_start TIME NOT NULL,
    work_time_end TIME NOT NULL,
    location TEXT NOT NULL,
    work_content TEXT DEFAULT '',
    required_members INTEGER NOT NULL DEFAULT 1,
    notes TEXT DEFAULT '',
    lead_member_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メンバーテーブル
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    qualifications TEXT[] DEFAULT '{}',
    available_hours_start TIME NOT NULL DEFAULT '08:00:00',
    available_hours_end TIME NOT NULL DEFAULT '18:00:00',
    available_areas TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 外部パートナーテーブル
CREATE TABLE IF NOT EXISTS external_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. 関連テーブル
-- =============================================================================

-- プロジェクト-メンバー割り当てテーブル
CREATE TABLE IF NOT EXISTS project_member_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, member_id)
);

-- プロジェクト-外部パートナー割り当てテーブル
CREATE TABLE IF NOT EXISTS project_external_partner_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES external_partners(id) ON DELETE CASCADE,
    member_count INTEGER NOT NULL DEFAULT 1,
    representative_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, partner_id)
);

-- レポートファイルテーブル
CREATE TABLE IF NOT EXISTS report_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by_pmc_user_id UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. 外部キー制約の追加（循環参照回避）
-- =============================================================================

-- プロジェクトのリードメンバー外部キー
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'projects_lead_member_id_fkey'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_lead_member_id_fkey 
        FOREIGN KEY (lead_member_id) REFERENCES members(id);
    END IF;
END $$;

-- =============================================================================
-- 9. インデックス作成
-- =============================================================================

-- 物件関連インデックス
CREATE INDEX IF NOT EXISTS idx_mansions_name ON mansions(name);
CREATE INDEX IF NOT EXISTS idx_mansions_address ON mansions(address);
CREATE INDEX IF NOT EXISTS idx_mansions_deleted ON mansions(is_deleted);

-- 部屋関連インデックス
CREATE INDEX IF NOT EXISTS idx_rooms_mansion_id ON rooms(mansion_id);
CREATE INDEX IF NOT EXISTS idx_rooms_occupied ON rooms(is_occupied);
CREATE INDEX IF NOT EXISTS idx_rooms_rent ON rooms(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_rooms_deleted ON rooms(is_deleted);

-- 住民関連インデックス
CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id);
CREATE INDEX IF NOT EXISTS idx_residents_user_id ON residents(user_id);
CREATE INDEX IF NOT EXISTS idx_residents_active ON residents(is_active);
CREATE INDEX IF NOT EXISTS idx_residents_deleted ON residents(is_deleted);

-- 契約関連インデックス
CREATE INDEX IF NOT EXISTS idx_contracts_resident_id ON contracts(resident_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_deleted ON contracts(is_deleted);

-- 修繕関連インデックス
CREATE INDEX IF NOT EXISTS idx_repair_records_mansion_id ON repair_records(mansion_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_room_id ON repair_records(room_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_contractor_id ON repair_records(contractor_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_status ON repair_records(status);
CREATE INDEX IF NOT EXISTS idx_repair_records_priority ON repair_records(priority);
CREATE INDEX IF NOT EXISTS idx_repair_records_date ON repair_records(request_date);
CREATE INDEX IF NOT EXISTS idx_repair_records_category ON repair_records(category);
CREATE INDEX IF NOT EXISTS idx_repair_records_deleted ON repair_records(is_deleted);

-- 契約ステップ関連インデックス
CREATE INDEX IF NOT EXISTS idx_contract_steps_contract_id ON contract_steps(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_steps_status ON contract_steps(status);
CREATE INDEX IF NOT EXISTS idx_contract_steps_category ON contract_steps(category);

-- 修繕進捗ステップ関連インデックス
CREATE INDEX IF NOT EXISTS idx_repair_progress_steps_repair_id ON repair_progress_steps(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_progress_steps_status ON repair_progress_steps(status);

-- 住民要望関連インデックス
CREATE INDEX IF NOT EXISTS idx_resident_requests_resident_id ON resident_requests(resident_id);
CREATE INDEX IF NOT EXISTS idx_resident_requests_room_id ON resident_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_resident_requests_status ON resident_requests(status);
CREATE INDEX IF NOT EXISTS idx_resident_requests_priority ON resident_requests(priority);
CREATE INDEX IF NOT EXISTS idx_resident_requests_type ON resident_requests(type);

-- 財務記録関連インデックス
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_category ON financial_records(category);
CREATE INDEX IF NOT EXISTS idx_financial_records_room_id ON financial_records(room_id);

-- 支払い記録関連インデックス
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_due_date ON payment_records(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_category ON payment_records(category);

-- 通知関連インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 業者関連インデックス
CREATE INDEX IF NOT EXISTS idx_contractors_active ON contractors(is_active);
CREATE INDEX IF NOT EXISTS idx_contractors_rating ON contractors(rating);
CREATE INDEX IF NOT EXISTS idx_contractors_deleted ON contractors(is_deleted);

-- プロジェクト関連インデックス
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_lead_member ON projects(lead_member_id);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_team ON members(team);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_member_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_member ON project_member_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_project_partner_assignments_project ON project_external_partner_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_partner_assignments_partner ON project_external_partner_assignments(partner_id);

-- レポート関連インデックス
CREATE INDEX IF NOT EXISTS idx_reports_pmc_id ON reports(pmc_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_report_files_report_id ON report_files(report_id);

-- =============================================================================
-- 10. Row Level Security (RLS) 設定
-- =============================================================================

-- 全テーブルでRLSを有効化
ALTER TABLE mansions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_progress_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_member_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_external_partner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_files ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 11. RLSポリシー作成
-- =============================================================================

-- パブリックアクセスポリシー（内部管理システム用）
DO $$
BEGIN
    -- Mansions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mansions' AND policyname = 'Public access to mansions') THEN
        CREATE POLICY "Public access to mansions" ON mansions FOR ALL TO public USING (true);
    END IF;
    
    -- Rooms
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Public access to rooms') THEN
        CREATE POLICY "Public access to rooms" ON rooms FOR ALL TO public USING (true);
    END IF;
    
    -- Residents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residents' AND policyname = 'Public access to residents') THEN
        CREATE POLICY "Public access to residents" ON residents FOR ALL TO public USING (true);
    END IF;
    
    -- Contractors
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contractors' AND policyname = 'Public access to contractors') THEN
        CREATE POLICY "Public access to contractors" ON contractors FOR ALL TO public USING (true);
    END IF;
    
    -- Contracts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Public access to contracts') THEN
        CREATE POLICY "Public access to contracts" ON contracts FOR ALL TO public USING (true);
    END IF;
    
    -- Repair Records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repair_records' AND policyname = 'Public access to repair_records') THEN
        CREATE POLICY "Public access to repair_records" ON repair_records FOR ALL TO public USING (true);
    END IF;
    
    -- Financial Records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_records' AND policyname = 'Public access to financial_records') THEN
        CREATE POLICY "Public access to financial_records" ON financial_records FOR ALL TO public USING (true);
    END IF;
    
    -- Payment Records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Public access to payment_records') THEN
        CREATE POLICY "Public access to payment_records" ON payment_records FOR ALL TO public USING (true);
    END IF;
    
    -- Contract Steps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contract_steps' AND policyname = 'Public access to contract_steps') THEN
        CREATE POLICY "Public access to contract_steps" ON contract_steps FOR ALL TO public USING (true);
    END IF;
    
    -- Repair Progress Steps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repair_progress_steps' AND policyname = 'Public access to repair_progress_steps') THEN
        CREATE POLICY "Public access to repair_progress_steps" ON repair_progress_steps FOR ALL TO public USING (true);
    END IF;
    
    -- Resident Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resident_requests' AND policyname = 'Public access to resident_requests') THEN
        CREATE POLICY "Public access to resident_requests" ON resident_requests FOR ALL TO public USING (true);
    END IF;
    
    -- Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Public access to notifications') THEN
        CREATE POLICY "Public access to notifications" ON notifications FOR ALL TO public USING (true);
    END IF;
    
    -- Projects
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Public access to projects') THEN
        CREATE POLICY "Public access to projects" ON projects FOR ALL TO public USING (true);
    END IF;
    
    -- Members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Public access to members') THEN
        CREATE POLICY "Public access to members" ON members FOR ALL TO public USING (true);
    END IF;
    
    -- External Partners
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_partners' AND policyname = 'Public access to external_partners') THEN
        CREATE POLICY "Public access to external_partners" ON external_partners FOR ALL TO public USING (true);
    END IF;
    
    -- Project Member Assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_member_assignments' AND policyname = 'Public access to project_member_assignments') THEN
        CREATE POLICY "Public access to project_member_assignments" ON project_member_assignments FOR ALL TO public USING (true);
    END IF;
    
    -- Project External Partner Assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_external_partner_assignments' AND policyname = 'Public access to project_external_partner_assignments') THEN
        CREATE POLICY "Public access to project_external_partner_assignments" ON project_external_partner_assignments FOR ALL TO public USING (true);
    END IF;
    
    -- Reports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Public access to reports') THEN
        CREATE POLICY "Public access to reports" ON reports FOR ALL TO public USING (true);
    END IF;
    
    -- Report Files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'report_files' AND policyname = 'Public access to report_files') THEN
        CREATE POLICY "Public access to report_files" ON report_files FOR ALL TO public USING (true);
    END IF;
END $$;

-- =============================================================================
-- 12. 自動更新トリガー設定
-- =============================================================================

-- updated_at自動更新トリガーを全テーブルに設定
DO $$
BEGIN
    -- Mansions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mansions_updated_at') THEN
        CREATE TRIGGER update_mansions_updated_at BEFORE UPDATE ON mansions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Rooms
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
        CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Residents
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_residents_updated_at') THEN
        CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Contractors
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contractors_updated_at') THEN
        CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Contracts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contracts_updated_at') THEN
        CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Repair Records
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_repair_records_updated_at') THEN
        CREATE TRIGGER update_repair_records_updated_at BEFORE UPDATE ON repair_records 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Financial Records
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_records_updated_at') THEN
        CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Payment Records
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_records_updated_at') THEN
        CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Contract Steps
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contract_steps_updated_at') THEN
        CREATE TRIGGER update_contract_steps_updated_at BEFORE UPDATE ON contract_steps 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Repair Progress Steps
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_repair_progress_steps_updated_at') THEN
        CREATE TRIGGER update_repair_progress_steps_updated_at BEFORE UPDATE ON repair_progress_steps 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Resident Requests
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resident_requests_updated_at') THEN
        CREATE TRIGGER update_resident_requests_updated_at BEFORE UPDATE ON resident_requests 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Projects
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Members
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_members_updated_at') THEN
        CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- External Partners
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_external_partners_updated_at') THEN
        CREATE TRIGGER update_external_partners_updated_at BEFORE UPDATE ON external_partners 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Reports
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reports_updated_at') THEN
        CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Contents
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contents_updated_at') THEN
        CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- スキーマ作成完了
-- =============================================================================
