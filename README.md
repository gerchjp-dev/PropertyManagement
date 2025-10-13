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
3. `.env`ファイルを作成（`.env.example`をコピー）：
```bash
cp .env.example .env
```
4. `.env`ファイルに以下を設定：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Neon Database（Vercel推奨）
1. [Neon](https://neon.tech)でプロジェクト作成
2. PostgreSQL接続文字列を取得
3. `.env`ファイルを作成（`.env.example`をコピー）：
```bash
cp .env.example .env
```
4. `.env`ファイルに以下を設定：
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

#### Supabaseの場合
マイグレーションファイルは既に`supabase/migrations/`フォルダに用意されています。
テーブルは自動的に作成されているため、追加作業は不要です。

もし手動で確認したい場合は、Supabase Dashboardの「SQL Editor」で以下を実行：
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

#### Neonの場合
1. Neon Dashboardの「SQL Editor」にアクセス
2. `supabase/migrations/20251013160451_20250708130404_small_coast.sql`の内容をコピー＆実行
3. すべてのテーブル、インデックス、トリガーが作成されます

または、以下の短縮版SQLを実行：
```sql
-- 全テーブル確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

詳細なスキーマは`supabase/migrations/`フォルダを参照してください。

#### SQLite / LibSQL の場合
設定画面で「DB初期化」ボタンをクリックして自動作成

### 4. 開発サーバー起動
```bash
npm run dev
```

## Vercelデプロイ（埋め込み式）

### 前提条件
- SupabaseまたはNeonのデータベースを作成済み
- `.env`ファイルに接続情報を設定済み

### 1. Vercelプロジェクト作成
```bash
npx vercel
```

### 2. 環境変数の埋め込み設定
Vercelダッシュボード → Settings → Environment Variables で設定：

**Supabase の場合:**
| 変数名 | 値 | 例 |
|--------|-----|-----|
| `VITE_SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGc...` |

**Neon の場合:**
| 変数名 | 値 | 例 |
|--------|-----|-----|
| `VITE_DATABASE_URL` | Neon接続文字列 | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |

**重要:**
- すべての環境変数は **Production、Preview、Development** の3つすべてにチェックを入れる
- `VITE_`プレフィックスが付いた環境変数はビルド時にバンドルに埋め込まれます
- デプロイ後に環境変数を変更した場合は再デプロイが必要です

### 3. データベーススキーマの適用

#### Supabaseの場合
マイグレーションは既に適用済みなので追加作業は不要です。

#### Neonの場合
1. Neon Dashboardにログイン
2. SQL Editor を開く
3. `supabase/migrations/20251013160451_20250708130404_small_coast.sql` の内容を実行
4. テーブルが作成されたことを確認

### 4. デプロイ実行
```bash
npx vercel --prod
```

### 5. デプロイ確認
デプロイ後、以下を確認：
- アプリケーションが正常に起動する
- データベース接続が成功する（設定画面で接続テスト可能）
- ログイン機能が動作する

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

### .envファイルでの設定（推奨）
データベースの設定は`.env`ファイルを直接編集することで行います：

1. プロジェクトルートの`.env`ファイルを開く
2. 使用するデータベースの環境変数を設定
3. 不要な環境変数はコメントアウトまたは削除
4. ファイルを保存
5. 開発サーバーを再起動（`npm run dev`）

例：Supabaseを使用する場合
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 設定画面での確認
設定画面（`/settings`）では以下が可能です：
- 現在の設定の確認
- 接続テストの実行
- .envファイルの更新が必要な値の確認

**注意**: 設定画面で表示される値をコピーして、手動で`.env`ファイルに貼り付けてください。

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
1. `.env`ファイルで環境変数が正しく設定されているか確認
2. 環境変数名に`VITE_`プレフィックスが付いているか確認
3. 設定画面で接続テストを実行
4. データベースの稼働状況確認
5. 開発サーバーを再起動（環境変数の変更は再起動が必要）
6. Vercelの場合は環境変数設定後に再デプロイを実行

### 環境変数が反映されない（Vercel）
- 環境変数はビルド時に埋め込まれるため、変更後は必ず再デプロイが必要
- Vercel Dashboard → Deployments → 最新のデプロイ → Redeploy

### データベーステーブルが見つからない
**Supabase:** マイグレーションが自動適用されているか確認
**Neon:** SQL Editorでマイグレーションファイルを手動実行

### データ移行
異なるプロバイダー間でのデータ移行は手動で行う必要があります。

### パフォーマンス問題
- インデックスの確認
- クエリの最適化
- 接続プールの調整

## よくある質問（FAQ）

### Q: データベースはどこに保存されますか？
**A:** 選択したプロバイダーによります：
- **Supabase/Neon**: クラウド上のPostgreSQLデータベース
- **SQLite**: ブラウザのローカルストレージ（開発用のみ）
- **モック**: メモリ上（ページ更新でリセット）

### Q: 本番環境ではどのデータベースを使うべきですか？
**A:**
- **Vercelにデプロイ**: Neon Database（最適化済み、無料枠あり）
- **認証・ストレージも必要**: Supabase（オールインワン）
- **グローバル展開**: Turso（エッジ配信）

### Q: 環境変数は安全ですか？
**A:** `VITE_`プレフィックスの環境変数はクライアント側にバンドルされます。
- **Anon Key**: 公開OK（RLSで保護）
- **Service Role Key**: 絶対に使用しない
- データベース接続文字列は必要に応じてサーバー側で処理してください

### Q: 複数のデータベースを同時に使えますか？
**A:** いいえ。環境変数の優先順位に従って1つだけが選択されます：
1. Supabase → 2. Neon → 3. Turso → 4. SQLite → 5. モック