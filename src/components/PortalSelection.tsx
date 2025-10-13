import React, { useState } from 'react';
import { Shield, Building2, Home, Copy, Check } from 'lucide-react';

interface PortalSelectionProps {
  onPortalSelect: (portalType: 'admin' | 'manager' | 'resident') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ onPortalSelect }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const portals = [
    {
      type: 'admin' as const,
      title: '管理者ポータル',
      description: '全物件の管理・設定を行えます',
      icon: Shield,
      color: 'purple',
      bgGradient: 'from-purple-50 to-indigo-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      url: `${window.location.origin}/?type=admin`
    },
    {
      type: 'manager' as const,
      title: '管理会社ポータル',
      description: '担当物件の管理業務を行えます',
      icon: Building2,
      color: 'blue',
      bgGradient: 'from-blue-50 to-cyan-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      url: `${window.location.origin}/?type=manager`
    },
    {
      type: 'resident' as const,
      title: '住民ポータル',
      description: '要望・意見を投稿できます',
      icon: Home,
      color: 'green',
      bgGradient: 'from-green-50 to-emerald-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      url: `${window.location.origin}/?type=resident`
    }
  ];

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">物件管理システム</h1>
          <p className="text-xl text-gray-600">ご利用になるポータルを選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.type}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                <div className={`h-32 bg-gradient-to-br ${portal.bgGradient} flex items-center justify-center`}>
                  <div className={`p-4 rounded-full ${portal.iconBg}`}>
                    <Icon className={`h-12 w-12 ${portal.iconColor}`} />
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{portal.title}</h3>
                  <p className="text-gray-600 mb-6">{portal.description}</p>
                  
                  <button
                    onClick={() => onPortalSelect(portal.type)}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 transform hover:scale-105 ${portal.buttonColor}`}
                  >
                    ログインページへ
                  </button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">QRコード用URL</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-mono break-all">{portal.url}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(portal.url, portal.type)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        title="URLをコピー"
                      >
                        {copiedUrl === portal.type ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    {copiedUrl === portal.type && (
                      <p className="text-xs text-green-600 mt-2">URLをコピーしました</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">QRコード配布について</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              各ポータルのURLをQRコードに変換して配布することで、ユーザーは直接該当するログイン画面にアクセスできます。
              セキュリティ上、他のポータルの存在は表示されません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;