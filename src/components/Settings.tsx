import React from 'react';
import { Database, Server, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '未設定';
  const isConfigured = supabaseUrl && !supabaseUrl.includes('your-project-id');



  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">システム設定</h2>
        <p className="text-gray-600">データベース接続状態を確認します</p>
      </div>

      {/* Supabase接続状態 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Supabase データベース</h3>
            <p className="text-gray-600">PostgreSQL + リアルタイム機能</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative">
                {isConfigured && (
                  <>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                  </>
                )}
                {!isConfigured && (
                  <div className="relative w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <h4 className="font-bold text-gray-900">接続状態</h4>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700 font-medium">データベース:</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    isConfigured 
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {isConfigured ? '● Supabase' : '● 未設定'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 ${isConfigured ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-700 font-medium">接続URL:</span>
                  </div>
                  <span className="text-xs font-mono text-gray-600 truncate max-w-xs">
                    {isConfigured ? new URL(supabaseUrl).hostname : '未設定'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700 font-medium">設定方法:</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    バックエンド管理者が設定
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 設定ガイド */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 データベース設定について</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>このシステムはSupabaseを使用しています。</strong>
              </p>
              <p>
                データベースの設定は、バックエンドプログラマが環境変数（.env）で管理しています。
              </p>
              <p className="mt-3 text-xs text-blue-700">
                設定が必要な場合は、システム管理者にお問い合わせください。
              </p>
            </div>
          </div>

          {!isConfigured && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ 設定が必要です</h4>
              <p className="text-sm text-yellow-800">
                Supabaseの接続情報が設定されていません。システム管理者に連絡して、
                環境変数を設定してください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* システム情報 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">バージョン:</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">環境:</span>
            <span className="font-medium text-gray-900">{import.meta.env.MODE}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">データベースプロバイダー:</span>
            <span className="font-medium text-gray-900">Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;