import React from 'react';
import { Building2, Home, Users, FileText, Wrench, BarChart3, DollarSign, MessageSquare, Bell, FileBarChart, HardHat, CreditCard, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  userRole?: 'admin' | 'manager';
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, userRole = 'admin', onLogout }) => {
  // 管理者用メニュー
  const adminNavItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
    { id: 'mansions', label: '物件管理', icon: Building2 },
    { id: 'rooms', label: '部屋管理', icon: Home },
    { id: 'residents', label: '住人管理', icon: Users },
    { id: 'contracts', label: '契約管理', icon: FileText },
    { id: 'repairs', label: '修繕管理', icon: Wrench },
    { id: 'contractors', label: '業者管理', icon: HardHat },
    { id: 'financial', label: '財務管理', icon: DollarSign },
    { id: 'reports', label: 'レポート', icon: FileBarChart },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'settings', label: '設定', icon: SettingsIcon },
  ];

  // 管理会社用メニュー（制限あり）
  const managerNavItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
    { id: 'residents', label: '住人管理', icon: Users },
    { id: 'contracts', label: '契約管理', icon: FileText },
    { id: 'repairs', label: '修繕管理', icon: Wrench },
    { id: 'resident-requests', label: '住民要望', icon: MessageSquare },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'settings', label: '設定', icon: SettingsIcon },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : managerNavItems;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                物件管理システム
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  {userRole === 'admin' ? '管理者モード' : '管理会社モード'}
                </p>
                {userRole === 'manager' && (
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">グランドパレス六本木</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 9).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewMode)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">ログアウト</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;