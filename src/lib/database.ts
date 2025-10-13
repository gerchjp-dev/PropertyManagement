import { supabase } from './supabase';
import { db as neonDb } from './neon';
import { getSQLiteDatabase, createSQLiteSchema } from './sqlite';
import { DatabaseProvider, DatabaseConfig } from '../types';

// データベース設定の管理
class DatabaseManager {
  private currentProvider: DatabaseProvider = 'mock';
  private config: DatabaseConfig = { provider: 'mock' };
  private isInitialized: boolean = false;

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    try {
      const remoteConfig = await this.loadFromSupabase();

      if (remoteConfig) {
        this.config = remoteConfig;
        this.currentProvider = remoteConfig.provider;
        this.isInitialized = true;
      } else {
        await this.autoDetectProvider();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to load database config from Supabase:', error);
      throw new Error('データベース接続が必要です。Supabaseに接続できません。');
    }
  }

  private async loadFromSupabase(): Promise<DatabaseConfig | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'database_config')
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase接続エラー: ${error.message}`);
    }

    if (data && data.value) {
      return data.value as DatabaseConfig;
    }

    return null;
  }

  private async saveToSupabase(config: DatabaseConfig): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'database_config',
        value: config,
        description: 'Database provider configuration'
      }, {
        onConflict: 'key'
      });

    if (error) {
      throw new Error(`設定の保存に失敗しました: ${error.message}`);
    }
  }

  private async autoDetectProvider() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const neonUrl = import.meta.env.VITE_DATABASE_URL;
    const sqliteFile = import.meta.env.VITE_SQLITE_FILENAME;

    if (supabaseUrl && supabaseKey &&
        !supabaseUrl.includes('your-project-id') &&
        !supabaseKey.includes('your-anon-key')) {
      await this.setProvider('supabase', {
        supabase: { url: supabaseUrl, anonKey: supabaseKey }
      });
      return;
    }

    if (neonUrl && !neonUrl.includes('your-database-url')) {
      await this.setProvider('neon', {
        neon: { connectionString: neonUrl }
      });
      return;
    }

    if (sqliteFile) {
      await this.setProvider('sqlite', {
        sqlite: { filename: sqliteFile }
      });
      return;
    }

    await this.setProvider('supabase', {
      supabase: { url: supabaseUrl, anonKey: supabaseKey }
    });
  }

  async setProvider(provider: DatabaseProvider, config?: Partial<DatabaseConfig>) {
    this.currentProvider = provider;
    this.config = {
      provider,
      ...config
    };

    await this.saveToSupabase(this.config);

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
export const setDatabaseProvider = async (provider: DatabaseProvider, config?: Partial<DatabaseConfig>) => {
  await databaseManager.setProvider(provider, config);
};

// データベース接続テスト
export const testDatabaseConnection = async () => {
  return await databaseManager.testConnection();
};

// データベース初期化
export const initializeDatabase = async () => {
  return await databaseManager.initializeDatabase();
};