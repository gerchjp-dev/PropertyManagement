import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PropertyManagement from './components/PropertyManagement';
import RoomManagement from './components/RoomManagement';
import ResidentManagement from './components/ResidentManagement';
import ContractManagement from './components/ContractManagement';
import RepairManagement from './components/RepairManagement';
import FinancialManagement from './components/FinancialManagement';
import Reports from './components/Reports';
import ResidentRequests from './components/ResidentRequests';
import Notifications from './components/Notifications';
import ContractorManagement from './components/ContractorManagement';
import PaymentManagement from './components/PaymentManagement';
import ResidentPortal from './components/ResidentPortal';
import Settings from './components/Settings';
import AdminLogin from './components/AdminLogin';
import ManagerLogin from './components/ManagerLogin';
import ResidentLogin from './components/ResidentLogin';
import PortalSelection from './components/PortalSelection';
import { ViewMode } from './types';
import { mockResidents } from './data/mockData';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'resident' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // URLパラメータからログインタイプを判定
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginType = urlParams.get('type');
    
    if (loginType === 'admin' || loginType === 'manager' || loginType === 'resident') {
      setUserRole(loginType);
    }
    // パラメータがない場合はポータル選択画面を表示
  }, []);

  const handleAdminLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('ユーザー名またはパスワードが正しくありません');
    }
  };

  const handleManagerLogin = (username: string, password: string) => {
    if (username === 'manager' && password === 'manager123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('ユーザー名またはパスワードが正しくありません');
    }
  };

  const handleResidentLogin = (userId: string, password: string) => {
    const resident = mockResidents.find(r => r.userId === userId && r.password === password && r.isActive);
    
    if (resident) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('ユーザーIDまたはパスワードが正しくありません');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginError('');
    setCurrentView('dashboard');
    // ログアウト時はポータル選択画面に戻る
    setUserRole(null);
    window.history.pushState({}, '', '/');
  };

  const handlePortalSelect = (portalType: 'admin' | 'manager' | 'resident') => {
    setUserRole(portalType);
    // URLを変更してQRコード用のURLを生成
    const newUrl = `${window.location.origin}/?type=${portalType}`;
    window.history.pushState({}, '', newUrl);
  };

  const renderCurrentView = () => {
    // ポータル選択画面（userRoleがnullの場合）
    if (!userRole) {
      return <PortalSelection onPortalSelect={handlePortalSelect} />;
    }

    // 住民ポータル
    if (userRole === 'resident') {
      if (!isLoggedIn) {
        return <ResidentLogin onLogin={handleResidentLogin} error={loginError} />;
      }
      return <ResidentPortal onLogout={handleLogout} />;
    }

    // 管理者ログイン
    if (userRole === 'admin' && !isLoggedIn) {
      return <AdminLogin onLogin={handleAdminLogin} error={loginError} />;
    }

    // 管理会社ログイン
    if (userRole === 'manager' && !isLoggedIn) {
      return <ManagerLogin onLogin={handleManagerLogin} error={loginError} />;
    }

    // ログイン後のメイン画面
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'mansions':
        return userRole === 'admin' ? <PropertyManagement /> : <Dashboard />;
      case 'rooms':
        return <RoomManagement />;
      case 'residents':
        return <ResidentManagement />;
      case 'contracts':
        return <ContractManagement />;
      case 'repairs':
        return <RepairManagement />;
      case 'financial':
        return userRole === 'admin' ? <FinancialManagement /> : <Dashboard />;
      case 'reports':
        return userRole === 'admin' ? <Reports /> : <Dashboard />;
      case 'resident-requests':
        return <ResidentRequests />;
      case 'notifications':
        return <Notifications />;
      case 'contractors':
        return userRole === 'admin' ? <ContractorManagement /> : <Dashboard />;
      case 'payments':
        return userRole === 'admin' ? <PaymentManagement /> : <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && userRole !== 'resident' && (
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          userRole={userRole as 'admin' | 'manager'}
          onLogout={handleLogout}
        />
      )}
      
      <main className={isLoggedIn && userRole !== 'resident' ? 'pb-8' : ''}>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;