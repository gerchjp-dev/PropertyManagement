# 物件管理システム

## 概要
物件管理システムは、不動産管理会社向けの包括的な管理ツールです。物件、部屋、住民、契約、修繕などを一元管理できます。

## 技術スタック
- **フロントエンド**: React + TypeScript + Tailwind CSS
- **データベース**: マルチプロバイダー対応
  - Supabase (PostgreSQL + リアルタイム)
  - Neon Database (サーバーレスPostgreSQL)
  - Turso/LibSQL (エッジ対応SQLite)
  - SQLite (ローカル開発)
  - モックデータ (テスト・デモ)
- **デプロイ**: Vercel
- **ORM**: Drizzle ORM (PostgreSQL) / 生SQL (SQLite系)

## データベースプロバイダー比較

| プロバイダー | 特徴 | 推奨用途 | 設定難易度 |
|------------|------|----------|-----------|
| **Supabase** | リアルタイム機能、認証、ストレージ | フル機能アプリ | ⭐⭐ |
| **Neon** | サーバーレス、Vercel最適化 | 本番環境 | ⭐⭐ |
| **Turso** | エッジ配信、低レイテンシ | グローバル展開 | ⭐⭐⭐ |
| **SQLite** | ローカルファイル | 開発・テスト | ⭐ |
| **モック** | サンプルデータ | デモ・プロトタイプ | - |

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. データベース選択・設定

#### Option A: Supabase（推奨）
1. [Supabase](https://supabase.com)でプロジェクト作成
2. 「Settings」→「API」からURLとAnon keyを取得
3. 環境変数設定：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Neon Database（Vercel推奨）
1. [Neon](https://neon.tech)でプロジェクト作成
2. PostgreSQL接続文字列を取得
3. 環境変数設定：
```env
VITE_DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require
```

#### Option C: Turso (LibSQL)
1. [Turso](https://turso.tech)でデータベース作成
2. URLと認証トークンを取得
3. 環境変数設定：
```env
VITE_LIBSQL_URL=libsql://your-database.turso.io
VITE_LIBSQL_AUTH_TOKEN=your-auth-token-here
```

#### Option D: SQLite（開発用）
```env
VITE_SQLITE_FILENAME=property_management.db
```

#### Option E: モックデータ（設定不要）
環境変数なしでモックデータを使用

### 3. データベーススキーマ作成

#### Supabase / Neon の場合
以下のSQLを実行してテーブルを作成：

```sql
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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_rooms_mansion_id ON rooms(mansion_id);
CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_mansion_id ON repair_records(mansion_id);
CREATE INDEX IF NOT EXISTS idx_repair_records_room_id ON repair_records(room_id);
```

#### SQLite / LibSQL の場合
設定画面で「DB初期化」ボタンをクリックして自動作成

### 4. 開発サーバー起動
```bash
npm run dev
```

## Vercelデプロイ

### 1. Vercelプロジェクト作成
```bash
npx vercel
```

### 2. 環境変数設定
Vercelダッシュボードで選択したデータベースの環境変数を設定：

**Supabase の場合:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Neon の場合:**
- `VITE_DATABASE_URL`

**Turso の場合:**
- `VITE_LIBSQL_URL`
- `VITE_LIBSQL_AUTH_TOKEN`

### 3. デプロイ
```bash
npx vercel --prod
```

## 機能

### 管理者機能
- 物件管理（追加・編集・削除）
- 部屋管理（設定・状態管理）
- 住民管理（登録・編集・ログイン設定）
- 契約管理（契約情報・進捗管理）
- 修繕管理（記録・進捗追跡）
- 業者管理（業者情報・評価）
- 財務管理（収支記録）
- レポート生成
- 支払い管理
- **データベース設定**（プロバイダー選択・接続テスト）

### 管理会社機能
- 担当物件の管理（制限あり）
- 住民管理
- 契約管理
- 修繕管理
- 住民要望対応

### 住民機能
- 要望・修繕依頼の投稿
- 写真添付
- 進捗確認

## データベース切り替え

### 設定画面での切り替え
1. 設定画面（`/settings`）にアクセス
2. 使用したいデータベースプロバイダーを選択
3. 必要な接続情報を入力
4. 「接続テスト」で確認
5. 「設定を保存」で適用
6. ページ再読み込みで反映

### 自動検出
環境変数が設定されている場合、以下の優先順位で自動選択：
1. Supabase（URL + Anon Key）
2. Neon（Database URL）
3. Turso（LibSQL URL）
4. SQLite（ファイル名）
5. モックデータ（デフォルト）

## ログイン情報（デモ用）

### 管理者
- URL: `/?type=admin`
- ユーザー名: `admin`
- パスワード: `admin123`

### 管理会社
- URL: `/?type=manager`
- ユーザー名: `manager`
- パスワード: `manager123`

### 住民
- URL: `/?type=resident`
- ユーザーID: `yasui101`
- パスワード: `password123`

## 開発

### データベース接続テスト
設定画面（`/settings`）で各プロバイダーの接続テストを実行できます。

### プロバイダー切り替え
開発中に異なるデータベースプロバイダーを試すことができます。

### モックデータ
データベース未設定時は自動的にモックデータを使用します。

## 本番運用

### 推奨構成
- **Vercel**: フロントエンドホスティング
- **Neon**: データベース（Vercel最適化）
- **Supabase**: フル機能が必要な場合

### セキュリティ
- 本番環境では強固なパスワードを設定
- HTTPS必須
- 定期的なバックアップ

### パフォーマンス
- 接続プール設定
- 画像最適化
- CDN使用推奨

## トラブルシューティング

### 接続エラー
1. 設定画面で接続テストを実行
2. 環境変数の確認
3. データベースの稼働状況確認

### データ移行
異なるプロバイダー間でのデータ移行は手動で行う必要があります。

### パフォーマンス問題
- インデックスの確認
- クエリの最適化
- 接続プールの調整