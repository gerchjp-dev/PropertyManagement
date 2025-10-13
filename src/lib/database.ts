import { supabase } from './supabase';
import { db as neonDb } from './neon';
import { getSQLiteDatabase, createSQLiteSchema } from './sqlite';
import { DatabaseProvider, DatabaseConfig } from '../types';

// データベース設定の管理
class DatabaseManager {
  private currentProvider: DatabaseProvider = 'mock';
  private config: DatabaseConfig = { provider: 'mock' };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('database-config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.currentProvider = this.config.provider;
      } else {
        // 環境変数から自動検出
        this.autoDetectProvider();
      }
    } catch (error) {
      console.warn('Failed to load database config:', error);
      this.currentProvider = 'mock';
    }
  }

  private autoDetectProvider() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const neonUrl = import.meta.env.VITE_DATABASE_URL;
    const sqliteFile = import.meta.env.VITE_SQLITE_FILENAME;

    // Supabaseの設定チェック
    if (supabaseUrl && supabaseKey && 
        !supabaseUrl.includes('your-project-id') && 
        !supabaseKey.includes('your-anon-key')) {
      this.setProvider('supabase', {
        supabase: { url: supabaseUrl, anonKey: supabaseKey }
      });
      return;
    }

    // Neonの設定チェック
    if (neonUrl && !neonUrl.includes('your-database-url')) {
      this.setProvider('neon', {
        neon: { connectionString: neonUrl }
      });
      return;
    }

    // SQLiteの設定チェック
    if (sqliteFile) {
      this.setProvider('sqlite', {
        sqlite: { filename: sqliteFile }
      });
      return;
    }

    // デフォルトはモック
    this.setProvider('mock');
  }

  setProvider(provider: DatabaseProvider, config?: Partial<DatabaseConfig>) {
    this.currentProvider = provider;
    this.config = {
      provider,
      ...config
    };
    
    // 設定を保存
    localStorage.setItem('database-config', JSON.stringify(this.config));
    
    console.log(`Database provider set to: ${provider}`);
  }

  getProvider(): DatabaseProvider {
    return this.currentProvider;
  }

  getConfig(): DatabaseConfig {
    return this.config;
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: string }> {
    try {
      switch (this.currentProvider) {
        case 'supabase':
          return await this.testSupabaseConnection();
        case 'neon':
          return await this.testNeonConnection();
        case 'sqlite':
          return await this.testSQLiteConnection();
        case 'mock':
          return {
            success: true,
            message: 'モックデータを使用中',
            details: 'データベース接続は不要です'
          };
        default:
          return {
            success: false,
            message: '不明なデータベースプロバイダー',
            details: `Provider: ${this.currentProvider}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: '接続テストでエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  private async testSupabaseConnection() {
    if (!this.config.supabase) {
      throw new Error('Supabase設定が見つかりません');
    }

    const { data, error } = await supabase
      .from('mansions')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      throw new Error(`Supabase接続エラー: ${error.message}`);
    }

    return {
      success: true,
      message: 'Supabase接続成功',
      details: 'データベースに正常に接続できました'
    };
  }

  private async testNeonConnection() {
    if (!this.config.neon) {
      throw new Error('Neon設定が見つかりません');
    }

    // Neon接続テスト（実装は neon.ts の testDatabaseConnection を使用）
    const { testDatabaseConnection } = await import('./neon');
    return await testDatabaseConnection();
  }

  private async testSQLiteConnection() {
    const { testSQLiteConnection } = await import('./sqlite');
    return await testSQLiteConnection();
  }

  async initializeDatabase() {
    switch (this.currentProvider) {
      case 'sqlite':
        const { createSQLiteSchema } = await import('./sqlite');
        createSQLiteSchema();
        break;
      case 'neon':
        console.log('Neon database schema should be created manually');
        break;
      case 'supabase':
        console.log('Supabase schema should be created via migrations');
        break;
      case 'mock':
        console.log('Mock data - no initialization needed');
        break;
    }
  }
}

// シングルトンインスタンス
export const databaseManager = new DatabaseManager();

// データベースプロバイダー取得
export const getCurrentDatabaseProvider = (): DatabaseProvider => {
  return databaseManager.getProvider();
};

// データベース設定取得
export const getDatabaseConfig = (): DatabaseConfig => {
  return databaseManager.getConfig();
};

// データベースプロバイダー設定
export const setDatabaseProvider = (provider: DatabaseProvider, config?: Partial<DatabaseConfig>) => {
  databaseManager.setProvider(provider, config);
};

// データベース接続テスト
export const testDatabaseConnection = async () => {
  return await databaseManager.testConnection();
};

// データベース初期化
export const initializeDatabase = async () => {
  return await databaseManager.initializeDatabase();
};