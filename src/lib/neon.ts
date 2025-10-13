import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Neon Database接続設定
const databaseUrl = import.meta.env.VITE_DATABASE_URL;

// デバッグ用（開発時のみ）
if (import.meta.env.DEV) {
  console.log('Database URL:', databaseUrl ? 'Set' : 'Not set');
}

// プレースホルダーURLをチェック
const isPlaceholderUrl = !databaseUrl || 
  databaseUrl.includes('your-database-url') || 
  databaseUrl === 'postgresql://username:password@localhost:5432/dbname';

let db: any;

if (!databaseUrl || isPlaceholderUrl) {
  console.warn('⚠️ Neon Database設定が未完了です。モックデータを使用します。');
  console.warn('環境変数でVITE_DATABASE_URLを設定してください。');
  
  // プレースホルダー値でクライアントを作成（実際には使用されない）
  const sql = neon('postgresql://placeholder:placeholder@localhost:5432/placeholder');
  db = drizzle(sql);
} else {
  const sql = neon(databaseUrl);
  db = drizzle(sql);
}

export { db };

// Database connection test function
export const testDatabaseConnection = async () => {
  try {
    if (!databaseUrl || isPlaceholderUrl) {
      return {
        success: false,
        message: 'データベースURLが設定されていません',
        details: 'VITE_DATABASE_URLを設定してください'
      };
    }

    // Simple connection test
    const sql = neon(databaseUrl);
    const result = await sql`SELECT 1 as test`;
    
    return {
      success: true,
      message: '接続に成功しました！',
      details: `データベースに正常に接続できました`
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    let errorMessage = '接続テストでエラーが発生しました';
    let errorDetails = 'データベース接続に問題があります';
    
    if (error instanceof Error) {
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        errorMessage = 'データベースサーバーが見つかりません';
        errorDetails = 'URLが正しいか確認してください';
      } else if (error.message.includes('authentication failed')) {
        errorMessage = '認証に失敗しました';
        errorDetails = 'ユーザー名とパスワードを確認してください';
      } else {
        errorDetails = error.message;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      details: errorDetails
    };
  }
};