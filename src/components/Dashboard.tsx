import React from 'react';
import { Building2, Home, Users, FileText, Wrench, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { relationService } from '../services/database';

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await relationService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // フォールバック用の基本統計
        setStats({
          totalProperties: 0,
          totalRooms: 0,
          occupiedRooms: 0,
          totalResidents: 0,
          activeContracts: 0,
          pendingRepairs: 0,
          urgentRepairs: 0,
          unreadRequests: 0,
          totalMonthlyRevenue: 0,
          averageOccupancy: 0,
          completedRepairs: 0,
          inProgressRepairs: 0,
          recentRepairs: [],
          expiringContracts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">データの読み込みに失敗しました</p>
        </div>
      </div>
    );
  }
  
  const {
    totalProperties,
    totalRooms,
    occupiedRooms,
    totalResidents,
    activeContracts,
    pendingRepairs,
    urgentRepairs,
    unreadRequests,
    totalMonthlyRevenue,
    averageOccupancy
  } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
        <p className="text-gray-600">物件管理システムの概要</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総物件数</p>
              <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">入居率</p>
              <p className="text-3xl font-bold text-gray-900">{averageOccupancy}%</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">月間収益</p>
              <p className="text-3xl font-bold text-gray-900">¥{totalMonthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">修繕待ち</p>
              <p className="text-3xl font-bold text-gray-900">{pendingRepairs}</p>
            </div>
            <div className={`p-3 rounded-full ${pendingRepairs > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Wrench className={`h-6 w-6 ${pendingRepairs > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">部屋状況</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">総部屋数</span>
              <span className="font-semibold">{totalRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">入居中</span>
              <span className="font-semibold text-green-600">{occupiedRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">空室</span>
              <span className="font-semibold text-red-600">{totalRooms - occupiedRooms}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">契約状況</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">有効契約</span>
              <span className="font-semibold text-green-600">{activeContracts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">総住人数</span>
              <span className="font-semibold">{totalResidents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">未読要望</span>
              <span className="font-semibold text-amber-600">{unreadRequests}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">修繕状況</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">完了済み</span>
              <span className="font-semibold text-green-600">
                {stats.completedRepairs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">進行中</span>
              <span className="font-semibold text-blue-600">
                {stats.inProgressRepairs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">緊急</span>
              <span className="font-semibold text-red-600">{urgentRepairs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の修繕履歴</h3>
          <div className="space-y-4">
            {stats.recentRepairs && stats.recentRepairs.length > 0 ? (
              stats.recentRepairs.map((repair: any) => (
                <div key={repair.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    repair.status === 'completed' ? 'bg-green-100' : 
                    repair.status === 'in-progress' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    <Wrench className={`h-4 w-4 ${
                      repair.status === 'completed' ? 'text-green-600' : 
                      repair.status === 'in-progress' ? 'text-blue-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{repair.description}</p>
                    <p className="text-sm text-gray-600">{repair.requestDate} • ¥{repair.cost.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">最近の修繕履歴はありません</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">注意事項</h3>
          <div className="space-y-4">
            {stats.expiringContracts > 0 && (
              <div className="flex items-center space-x-4 p-3 bg-amber-50 rounded-lg">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">契約期限接近</p>
                  <p className="text-sm text-amber-700">{stats.expiringContracts}件の契約が6ヶ月以内に期限切れ</p>
                </div>
              </div>
            )}
            
            {pendingRepairs > 0 && (
              <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">修繕待ち</p>
                  <p className="text-sm text-red-700">{pendingRepairs}件の修繕が未完了</p>
                </div>
              </div>
            )}
            
            {urgentRepairs > 0 && (
              <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">緊急修繕</p>
                  <p className="text-sm text-red-700">{urgentRepairs}件の緊急修繕が必要</p>
                </div>
              </div>
            )}
            
            {(stats.expiringContracts || 0) === 0 && pendingRepairs === 0 && urgentRepairs === 0 && (
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">すべて正常</p>
                  <p className="text-sm text-green-700">現在、注意すべき事項はありません</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;