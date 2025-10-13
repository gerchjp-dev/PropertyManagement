import { createClient } from '@libsql/client';

// LibSQL Database接続設定
let client: any = null;

const getLibSQLConfig = () => {
  const url = import.meta.env.VITE_LIBSQL_URL;
  const authToken = import.meta.env.VITE_LIBSQL_AUTH_TOKEN;
  
  return { url, authToken };
};

// LibSQLクライアント初期化
export const initLibSQLDatabase = () => {
  try {
    const { url, authToken } = getLibSQLConfig();
    
    if (!url) {
      console.warn('VITE_LIBSQL_URL is not set - LibSQL client not initialized');
      return null;
    }

    const config: any = { url };
    
    // 認証トークンがある場合は追加
    if (authToken) {
      config.authToken = authToken;
    }
    
    client = createClient(config);
    
    console.log('✅ LibSQL database initialized:', url);
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize LibSQL database:', error);
    return null;
  }
};

// データベースインスタンスを取得
export const getLibSQLDatabase = () => {
  if (!client) {
    client = initLibSQLDatabase();
  }
  return client;
};

// LibSQLスキーマ作成
export const createLibSQLSchema = async () => {
  const database = getLibSQLDatabase();
  
  try {
    // 物件テーブル
    await database.execute(`
      CREATE TABLE IF NOT EXISTS mansions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        purchase_date TEXT NOT NULL,
        photo_paths TEXT DEFAULT '[]',
        deed_pdf_path TEXT,
        total_rooms INTEGER NOT NULL DEFAULT 0,
        occupancy_rate REAL DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        deleted_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 部屋テーブル
    await database.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        mansion_id TEXT NOT NULL,
        room_number TEXT NOT NULL,
        layout TEXT NOT NULL,
        size REAL NOT NULL,
        floor INTEGER NOT NULL,
        photo_paths TEXT DEFAULT '[]',
        condition_notes TEXT DEFAULT '',
        is_occupied INTEGER DEFAULT 0,
        monthly_rent INTEGER NOT NULL DEFAULT 0,
        maintenance_fee INTEGER DEFAULT 0,
        parking_fee INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        deleted_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (mansion_id) REFERENCES mansions(id) ON DELETE CASCADE
      )
    `);

    // 住民テーブル
    await database.execute(`
      CREATE TABLE IF NOT EXISTS residents (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        room_id TEXT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        move_in_date TEXT NOT NULL,
        emergency_contact TEXT NOT NULL,
        user_id TEXT UNIQUE,
        password TEXT,
        is_active INTEGER DEFAULT 1,
        is_deleted INTEGER DEFAULT 0,
        deleted_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      )
    `);

    // 業者テーブル
    await database.execute(`
      CREATE TABLE IF NOT EXISTS contractors (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        specialties TEXT DEFAULT '[]',
        hourly_rate INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 3,
        is_active INTEGER DEFAULT 1,
        last_work_date TEXT,
        notes TEXT,
        is_deleted INTEGER DEFAULT 0,
        deleted_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 修繕記録テーブル
    await database.execute(`
      CREATE TABLE IF NOT EXISTS repair_records (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        room_id TEXT,
        mansion_id TEXT NOT NULL,
        contractor_id TEXT,
        scope TEXT NOT NULL CHECK (scope IN ('room', 'building')),
        description TEXT NOT NULL,
        request_date TEXT NOT NULL,
        start_date TEXT,
        completion_date TEXT,
        cost INTEGER DEFAULT 0,
        estimated_cost INTEGER DEFAULT 0,
        contractor_name TEXT NOT NULL,
        photo_paths TEXT DEFAULT '[]',
        report_pdf_path TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('plumbing', 'electrical', 'interior', 'exterior', 'equipment', 'other')),
        notes TEXT,
        is_deleted INTEGER DEFAULT 0,
        deleted_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (mansion_id) REFERENCES mansions(id) ON DELETE CASCADE,
        FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
      )
    `);

    // インデックス作成
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_rooms_mansion_id ON rooms(mansion_id)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_repair_records_mansion_id ON repair_records(mansion_id)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_repair_records_room_id ON repair_records(room_id)`);

    console.log('✅ LibSQL schema created successfully');
  } catch (error) {
    console.error('❌ Failed to create LibSQL schema:', error);
    throw error;
  }
};

// データベース接続テスト
export const testSQLiteConnection = async () => {
  try {
    const database = getSQLiteDatabase();
    
    // テストクエリ実行
    const result = database.prepare('SELECT 1 as test').get();
    
    return {
      success: true,
      message: '接続に成功しました！',
      details: 'SQLiteデータベースに正常に接続できました'
    };
  } catch (error) {
    console.error('SQLite connection test failed:', error);
    
    return {
      success: false,
      message: '接続テストでエラーが発生しました',
      details: error instanceof Error ? error.message : '不明なエラー'
    };
  }
};

// データベースを閉じる
export const closeSQLiteDatabase = () => {
  if (db) {
    try {
      db.close();
      db = null;
      console.log('SQLite database closed');
    } catch (error) {
      console.error('Error closing SQLite database:', error);
    }
  }
};