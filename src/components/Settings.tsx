import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Key, Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle, Server, HardDrive, Cloud, Smartphone } from 'lucide-react';
import { 
  getCurrentDatabaseProvider, 
  setDatabaseProvider, 
  testDatabaseConnection,
  initializeDatabase,
  type DatabaseProvider 
} from '../lib/database';

const Settings: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<DatabaseProvider>('mock');
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [neonUrl, setNeonUrl] = useState(import.meta.env.VITE_DATABASE_URL || '');
  const [libsqlUrl, setLibsqlUrl] = useState(import.meta.env.VITE_LIBSQL_URL || '');
  const [libsqlToken, setLibsqlToken] = useState(import.meta.env.VITE_LIBSQL_AUTH_TOKEN || '');
  const [sqliteFilename, setSqliteFilename] = useState(import.meta.env.VITE_SQLITE_FILENAME || 'property_management.db');
  
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    setCurrentProvider(getCurrentDatabaseProvider());
  }, []);

  const databaseProviders = [
    {
      id: 'mock' as DatabaseProvider,
      name: 'モックデータ',
      description: 'テスト用のサンプルデータを使用',
      icon: Smartphone,
      color: 'gray',
      recommended: false
    },
    {
      id: 'supabase' as DatabaseProvider,
      name: 'Supabase',
      description: 'PostgreSQL + リアルタイム機能',
      icon: Cloud,
      color: 'green',
      recommended: true
    },
    {
      id: 'neon' as DatabaseProvider,
      name: 'Neon Database',
      description: 'サーバーレスPostgreSQL',
      icon: Database,
      color: 'blue',
      recommended: true
    },
    {
      id: 'libsql' as DatabaseProvider,
      name: 'Turso (LibSQL)',
      description: 'エッジ対応SQLite',
      icon: Server,
      color: 'purple',
      recommended: false
    },
    {
      id: 'sqlite' as DatabaseProvider,
      name: 'SQLite',
      description: 'ローカルファイルデータベース',
      icon: HardDrive,
      color: 'orange',
      recommended: false
    }
  ];

  const handleProviderChange = (provider: DatabaseProvider) => {
    setCurrentProvider(provider);
    setTestResult(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const config: any = { provider: currentProvider };
      
      switch (currentProvider) {
        case 'supabase':
          if (!supabaseUrl || !supabaseKey) {
            alert('❌ Supabase URLとAnon Keyの両方を入力してください');
            return;
          }
          config.supabase = { url: supabaseUrl, anonKey: supabaseKey };
          break;
        case 'neon':
          if (!neonUrl) {
            alert('❌ Neon Database URLを入力してください');
            return;
          }
          config.neon = { connectionString: neonUrl };
          break;
        case 'libsql':
          if (!libsqlUrl) {
            alert('❌ LibSQL URLを入力してください');
            return;
          }
          config.libsql = { url: libsqlUrl, authToken: libsqlToken };
          break;
        case 'sqlite':
          config.sqlite = { filename: sqliteFilename };
          break;
      }
      
      setDatabaseProvider(currentProvider, config);
      
      alert(`✅ データベースプロバイダーを「${databaseProviders.find(p => p.id === currentProvider)?.name}」に変更しました。\n\n変更を反映するにはページを再読み込みしてください。`);
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('❌ 設定の更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // 一時的に設定を変更してテスト
      const originalProvider = getCurrentDatabaseProvider();
      
      const config: any = { provider: currentProvider };
      
      switch (currentProvider) {
        case 'supabase':
          if (!supabaseUrl || !supabaseKey) {
            setTestResult({
              success: false,
              message: 'URLとキーの両方を入力してください',
              details: 'Supabase URLとAnon Keyが必要です'
            });
            return;
          }
          config.supabase = { url: supabaseUrl, anonKey: supabaseKey };
          break;
        case 'neon':
          if (!neonUrl) {
            setTestResult({
              success: false,
              message: 'Database URLを入力してください',
              details: 'Neon Database URLが必要です'
            });
            return;
          }
          config.neon = { connectionString: neonUrl };
          break;
        case 'libsql':
          if (!libsqlUrl) {
            setTestResult({
              success: false,
              message: 'LibSQL URLを入力してください',
              details: 'Turso Database URLが必要です'
            });
            return;
          }
          config.libsql = { url: libsqlUrl, authToken: libsqlToken };
          break;
        case 'sqlite':
          config.sqlite = { filename: sqliteFilename };
          break;
      }
      
      // 一時的に設定を変更
      setDatabaseProvider(currentProvider, config);
      
      // 接続テスト実行
      const result = await testDatabaseConnection();
      setTestResult(result);
      
      // 元の設定に戻す
      setDatabaseProvider(originalProvider);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        success: false,
        message: '接続テストでエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    
    try {
      await initializeDatabase();
      alert('✅ データベースの初期化が完了しました');
    } catch (error) {
      console.error('Database initialization failed:', error);
      alert('❌ データベースの初期化に失敗しました');
    } finally {
      setIsInitializing(false);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const getProviderColor = (providerId: DatabaseProvider) => {
    const provider = databaseProviders.find(p => p.id === providerId);
    return provider?.color || 'gray';
  };

  const renderProviderConfig = () => {
    switch (currentProvider) {
      case 'supabase':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://your-project-id.supabase.co"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Anon Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showKeys.supabase ? 'text' : 'password'}
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('supabase')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.supabase ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'neon':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Neon Database URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={neonUrl}
                onChange={(e) => setNeonUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Neon DatabaseのPostgreSQL接続文字列
            </p>
          </div>
        );
      
      case 'libsql':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turso Database URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={libsqlUrl}
                  onChange={(e) => setLibsqlUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="libsql://your-database.turso.io"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showKeys.libsql ? 'text' : 'password'}
                  value={libsqlToken}
                  onChange={(e) => setLibsqlToken(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="認証トークン（オプション）"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('libsql')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.libsql ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'sqlite':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQLite ファイル名
            </label>
            <div className="relative">
              <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={sqliteFilename}
                onChange={(e) => setSqliteFilename(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="property_management.db"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              SQLiteデータベースファイル名
            </p>
          </div>
        );
      
      case 'mock':
      default:
        return (
          <div className="text-center py-8">
            <Smartphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              モックデータを使用します。追加の設定は不要です。
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">システム設定</h2>
        <p className="text-gray-600">データベース接続設定とシステム設定を管理します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Database Provider Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">データベースプロバイダー</h3>
            <div className="space-y-3">
              {databaseProviders.map((provider) => {
                const Icon = provider.icon;
                const isSelected = currentProvider === provider.id;
                
                return (
                  <div
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? `border-${provider.color}-500 bg-${provider.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        isSelected ? `bg-${provider.color}-100` : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isSelected ? `text-${provider.color}-600` : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${
                            isSelected ? `text-${provider.color}-900` : 'text-gray-900'
                          }`}>
                            {provider.name}
                          </h4>
                          {provider.recommended && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              推奨
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isSelected ? `text-${provider.color}-700` : 'text-gray-600'
                        }`}>
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`bg-${getProviderColor(currentProvider)}-100 p-3 rounded-full`}>
                <Database className={`h-6 w-6 text-${getProviderColor(currentProvider)}-600`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {databaseProviders.find(p => p.id === currentProvider)?.name} 設定
                </h3>
                <p className="text-gray-600">
                  {databaseProviders.find(p => p.id === currentProvider)?.description}
                </p>
              </div>
            </div>

            {/* Provider-specific configuration */}
            <div className="mb-6">
              {renderProviderConfig()}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`mb-6 p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    testResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      testResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResult.message}
                    </h4>
                    {testResult.details && (
                      <p className={`text-sm mt-1 ${
                        testResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {testResult.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 bg-${getProviderColor(currentProvider)}-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-${getProviderColor(currentProvider)}-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>設定を保存</span>
                  </>
                )}
              </button>
              
              {currentProvider !== 'mock' && (
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>テスト中...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5" />
                      <span>接続テスト</span>
                    </>
                  )}
                </button>
              )}
              
              {(currentProvider === 'sqlite' || currentProvider === 'libsql') && (
                <button
                  onClick={handleInitialize}
                  disabled={isInitializing}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>初期化中...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5" />
                      <span>DB初期化</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-900 mb-3">現在の設定状況</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">現在のプロバイダー:</span>
                <span className="font-medium text-gray-900">
                  {databaseProviders.find(p => p.id === getCurrentDatabaseProvider())?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">接続状態:</span>
                <span className={`font-medium ${
                  testResult?.success ? 'text-green-600' : 
                  testResult?.success === false ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {testResult?.success ? '接続済み' : 
                   testResult?.success === false ? '接続失敗' : '未テスト'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">データベース設定ガイド</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Supabase:</strong> 最も簡単。リアルタイム機能付き</p>
              <p><strong>Neon:</strong> Vercelに最適化されたPostgreSQL</p>
              <p><strong>Turso:</strong> エッジ配信対応のSQLite</p>
              <p><strong>SQLite:</strong> ローカル開発用</p>
              <p><strong>モック:</strong> テスト・デモ用</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;