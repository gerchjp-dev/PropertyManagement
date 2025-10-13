/*
  # 物件管理システム - 完全データベーススキーマ
  
  このSQLファイルをSupabaseのSQL Editorで実行してください。
  
  ## 実行順序
  1. 全体を選択してコピー
  2. SupabaseのSQL Editorに貼り付け
  3. 「Run」ボタンで実行
  
  ## 含まれる内容
  - 20個のテーブル作成
  - RLS（Row Level Security）設定
  - インデックス作成
  - 外部キー制約
  - チェック制約
  - 自動更新トリガー
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
    bicycle_parking_fee INTEGER DEFAULT 0,
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
    pmc_id UUID NOT NULL, -- 管理会社ID（private.property_management_companiesを参照）
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
    lead_member_id UUID, -- membersテーブルを参照（後で外部キー追加）
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
    uploaded_by_pmc_user_id UUID, -- private.pmc_usersを参照
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. 外部キー制約の追加（循環参照回避）
-- =============================================================================

-- プロジェクトのリードメンバー外部キー
ALTER TABLE projects 
ADD CONSTRAINT projects_lead_member_id_fkey 
FOREIGN KEY (lead_member_id) REFERENCES members(id);

-- =============================================================================
-- 9. インデックス作成
-- =============================================================================

-- 物件関連インデックス
CREATE INDEX IF NOT EXISTS idx_mansions_name ON mansions(name);
CREATE INDEX IF NOT EXISTS idx_mansions_address ON mansions(address);

-- 部屋関連インデックス
CREATE INDEX IF NOT EXISTS idx_rooms_mansion_id ON rooms(mansion_id);
CREATE INDEX IF NOT EXISTS idx_rooms_occupied ON rooms(is_occupied);
CREATE INDEX IF NOT EXISTS idx_rooms_rent ON rooms(monthly_rent);

-- 住民関連インデックス
CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id);
CREATE INDEX IF NOT EXISTS idx_residents_user_id ON residents(user_id);
CREATE INDEX IF NOT EXISTS idx_residents_active ON residents(is_active);

-- 契約関連インデックス
CREATE INDEX IF NOT EXISTS idx_contracts_resident_id ON contracts(resident_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);

-- 修繕関連インデックス
CREATE INDEX IF NOT EXISTS idx_repair_records_mansion_id ON repair_records(mansion_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_room_id ON repair_records(room_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_status ON repair_records(status);
CREATE INDEX IF NOT EXISTS idx_repair_records_priority ON repair_records(priority);
CREATE INDEX IF NOT EXISTS idx_repair_records_date ON repair_records(request_date);

-- 契約ステップ関連インデックス
CREATE INDEX IF NOT EXISTS idx_contract_steps_contract_id ON contract_steps(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_steps_status ON contract_steps(status);

-- 修繕進捗ステップ関連インデックス
CREATE INDEX IF NOT EXISTS idx_repair_progress_steps_repair_id ON repair_progress_steps(repair_id);

-- 住民要望関連インデックス
CREATE INDEX IF NOT EXISTS idx_resident_requests_resident_id ON resident_requests(resident_id);
CREATE INDEX IF NOT EXISTS idx_resident_requests_status ON resident_requests(status);
CREATE INDEX IF NOT EXISTS idx_resident_requests_priority ON resident_requests(priority);

-- 財務記録関連インデックス
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);

-- 支払い記録関連インデックス
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);

-- 通知関連インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- プロジェクト関連インデックス
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_member_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_member ON project_member_assignments(member_id);

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

-- contentsとreport_filesはRLS無効（パブリックアクセス）

-- =============================================================================
-- 11. RLSポリシー作成
-- =============================================================================

-- 認証ユーザーに全アクセス権限を付与（管理システム用）
CREATE POLICY "Authenticated users can access mansions" ON mansions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access rooms" ON rooms FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access residents" ON residents FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access contractors" ON contractors FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access contracts" ON contracts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access repair_records" ON repair_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access financial_records" ON financial_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access payment_records" ON payment_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access contract_steps" ON contract_steps FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access repair_progress_steps" ON repair_progress_steps FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access resident_requests" ON resident_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access notifications" ON notifications FOR ALL TO authenticated USING (true);

-- プロジェクト関連はパブリックアクセス
CREATE POLICY "Allow all access to projects" ON projects FOR ALL TO public USING (true);
CREATE POLICY "Allow all access to members" ON members FOR ALL TO public USING (true);
CREATE POLICY "Allow all access to external_partners" ON external_partners FOR ALL TO public USING (true);
CREATE POLICY "Allow all access to project_member_assignments" ON project_member_assignments FOR ALL TO public USING (true);
CREATE POLICY "Allow all access to project_external_partner_assignments" ON project_external_partner_assignments FOR ALL TO public USING (true);

-- =============================================================================
-- 12. 自動更新トリガー設定
-- =============================================================================

-- updated_at自動更新トリガーを全テーブルに設定
CREATE TRIGGER update_mansions_updated_at BEFORE UPDATE ON mansions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_records_updated_at BEFORE UPDATE ON repair_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_steps_updated_at BEFORE UPDATE ON contract_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_progress_steps_updated_at BEFORE UPDATE ON repair_progress_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_requests_updated_at BEFORE UPDATE ON resident_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 13. 初期データ挿入（オプション）
-- =============================================================================

-- サンプル物件データ
INSERT INTO mansions (id, name, address, purchase_date, total_rooms, occupancy_rate) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'グランドパレス六本木', '東京都港区麻布十番1-2-3', '2020-03-15', 24, 87.5),
('550e8400-e29b-41d4-a716-446655440001', 'ロイヤルタワー新宿', '東京都新宿区西新宿2-8-1', '2019-11-20', 36, 94.4),
('550e8400-e29b-41d4-a716-446655440002', 'プレミアムコート渋谷', '東京都渋谷区渋谷3-15-7', '2021-01-10', 18, 83.3),
('550e8400-e29b-41d4-a716-446655440003', 'エクセレント青山', '東京都港区南青山4-12-8', '2022-05-20', 28, 92.9),
('550e8400-e29b-41d4-a716-446655440004', 'ラグジュアリー表参道', '東京都渋谷区神宮前5-3-15', '2023-02-10', 22, 86.4)
ON CONFLICT (id) DO NOTHING;

-- サンプル部屋データ
INSERT INTO rooms (id, mansion_id, room_number, layout, size, floor, monthly_rent, maintenance_fee, is_occupied) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '101', '1LDK', 45.5, 1, 70000, 10000, true),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '102', '2DK', 52.3, 1, 75000, 12000, false),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '206', '1LDK', 48.2, 2, 72000, 10000, true),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '503', '2LDK', 65.0, 5, 95000, 15000, false)
ON CONFLICT (id) DO NOTHING;

-- サンプル住民データ
INSERT INTO residents (id, room_id, name, phone, email, move_in_date, emergency_contact, user_id, password, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', '康井 宏益', '090-1234-5678', 'yasui@example.com', '2023-04-01', '康井 花子 090-8765-4321', 'yasui101', 'password123', true),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', '遠里 麻実', '080-2345-6789', 'enri@example.com', '2023-09-15', '遠里 健 080-9876-5432', 'enri206', 'password456', true),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440013', '土橋 正年', '070-3456-7890', 'dobashi@example.com', '2024-01-10', '土橋 美和 070-1234-5678', 'dobashi503', 'password789', false),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440011', '新井 美咲', '080-4567-8901', 'arai@example.com', '2024-12-15', '新井 太郎 080-1111-2222', 'arai102', 'newpass123', true)
ON CONFLICT (id) DO NOTHING;

-- サンプル業者データ
INSERT INTO contractors (id, name, contact_person, phone, email, address, specialties, hourly_rate, rating, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440030', '株式会社水道工事', '田中 修理工', '03-1234-5678', 'tanaka@suidou-kouji.co.jp', '東京都港区赤坂1-2-3', '{"plumbing"}', 8000, 4, true),
('550e8400-e29b-41d4-a716-446655440031', '水道修理プロ', '佐藤 太郎', '03-2345-6789', 'sato@suidou-pro.com', '東京都新宿区西新宿2-1-1', '{"plumbing"}', 7500, 5, true),
('550e8400-e29b-41d4-a716-446655440032', 'リフォーム株式会社', '鈴木 花子', '03-3456-7890', 'suzuki@reform-corp.co.jp', '東京都渋谷区渋谷3-4-5', '{"interior","exterior"}', 12000, 4, true),
('550e8400-e29b-41d4-a716-446655440033', '電気工事サービス', '高橋 一郎', '03-4567-8901', 'takahashi@denki-service.com', '東京都品川区大崎1-2-3', '{"electrical"}', 9000, 4, true),
('550e8400-e29b-41d4-a716-446655440034', 'クリーンサービス東京', '山田 美咲', '03-5678-9012', 'yamada@clean-tokyo.co.jp', '東京都中央区銀座5-6-7', '{"cleaning"}', 3500, 5, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 完了メッセージ
-- =============================================================================

-- 作成完了の確認
DO $$
BEGIN
    RAISE NOTICE '✅ 物件管理システムのデータベーススキーマ作成が完了しました！';
    RAISE NOTICE '📊 作成されたテーブル数: 17';
    RAISE NOTICE '🔒 RLS設定: 有効';
    RAISE NOTICE '📈 インデックス: 最適化済み';
    RAISE NOTICE '🔗 外部キー制約: 設定済み';
    RAISE NOTICE '⚡ 自動更新トリガー: 設定済み';
END $$;