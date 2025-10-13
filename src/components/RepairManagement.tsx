import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, Calendar, Pen as Yen, AlertTriangle, CheckCircle, Clock, User, Building2, Home, Camera, Eye, Edit, FileText, Trash2 } from 'lucide-react';
import { mockRooms, mockMansions, mockContractors } from '../data/mockData';
import { repairService } from '../services/database';
import { RepairRecord } from '../types';
import RepairModal from './RepairModal';
import RepairProgressModal from './RepairProgressModal';

interface RepairManagementProps {
  userRole?: 'admin' | 'manager';
}

const RepairManagement: React.FC<RepairManagementProps> = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'room' | 'building'>('all');
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [repairRecords, setRepairRecords] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // データベースから修繕記録を取得
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const data = await repairService.getAll();
        // データベースの形式をRepairRecord型に変換
        const convertedRepairs: RepairRecord[] = data.map(repair => ({
          id: repair.id,
          roomId: repair.room_id,
          mansionId: repair.mansion_id,
          contractorId: repair.contractor_id,
          scope: repair.scope,
          description: repair.description,
          requestDate: repair.request_date,
          startDate: repair.start_date,
          completionDate: repair.completion_date,
          cost: repair.cost,
          estimatedCost: repair.estimated_cost,
          contractor: repair.contractor_name,
          photoPaths: repair.photo_paths || [],
          reportPdfPath: repair.report_pdf_path,
          status: repair.status,
          priority: repair.priority,
          category: repair.category,
          notes: repair.notes,
          progressSteps: [] // TODO: 進捗ステップの実装
        }));
        setRepairRecords(convertedRepairs);
      } catch (error) {
        console.error('Failed to fetch repair records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  // 管理会社の場合は担当物件のみ表示
  const availableRepairs = userRole === 'manager'
    ? repairRecords.filter(record => {
        const mansion = mockMansions.find(m => m.id === record.mansionId);
        return mansion?.name === 'グランドパレス六本木';
      })
    : repairRecords;

  const filteredRecords = availableRepairs.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || record.priority === filterPriority;
    const matchesScope = filterScope === 'all' || record.scope === filterScope;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesScope;
  });

  const getRecordInfo = (record: RepairRecord) => {
    const mansion = mockMansions.find(m => m.id === record.mansionId);
    const room = record.roomId ? mockRooms.find(r => r.id === record.roomId) : null;
    
    return {
      roomNumber: room?.roomNumber || '-',
      mansionName: mansion?.name || '不明',
      location: record.scope === 'building' ? '建物全体' : `${room?.roomNumber}号室`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'building':
        return 'bg-purple-100 text-purple-800';
      case 'room':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in-progress':
        return '作業中';
      case 'pending':
        return '未対応';
      default:
        return '不明';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '緊急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '不明';
    }
  };

  const getScopeText = (scope: string) => {
    switch (scope) {
      case 'building':
        return '建物全体';
      case 'room':
        return '部屋個別';
      default:
        return '不明';
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'building':
        return <Building2 className="h-4 w-4" />;
      case 'room':
        return <Home className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const handleAddRepair = () => {
    setSelectedRepair(null);
    setShowRepairModal(true);
  };

  const handleEditRepair = (repair: RepairRecord) => {
    setSelectedRepair(repair);
    setShowRepairModal(true);
  };

  const handleViewProgress = (repair: RepairRecord) => {
    setSelectedRepair(repair);
    setShowProgressModal(true);
  };

  const handleModalClose = () => {
    setShowRepairModal(false);
    setShowProgressModal(false);
    // モーダルが閉じられた時にデータを再取得
    const fetchRepairs = async () => {
      try {
        const data = await repairService.getAll();
        const convertedRepairs: RepairRecord[] = data.map(repair => ({
          id: repair.id,
          roomId: repair.room_id,
          mansionId: repair.mansion_id,
          contractorId: repair.contractor_id,
          scope: repair.scope,
          description: repair.description,
          requestDate: repair.request_date,
          startDate: repair.start_date,
          completionDate: repair.completion_date,
          cost: repair.cost,
          estimatedCost: repair.estimated_cost,
          contractor: repair.contractor_name,
          photoPaths: repair.photo_paths || [],
          reportPdfPath: repair.report_pdf_path,
          status: repair.status,
          priority: repair.priority,
          category: repair.category,
          notes: repair.notes,
          progressSteps: []
        }));
        setRepairRecords(convertedRepairs);
      } catch (error) {
        console.error('Failed to refresh repair records:', error);
      }
    };
    fetchRepairs();
  };

  const getProgressPercentage = (repair: RepairRecord) => {
    if (repair.progressSteps.length === 0) return 0;
    const completedSteps = repair.progressSteps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / repair.progressSteps.length) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">修繕履歴管理</h2>
            <p className="text-gray-600">修繕作業の記録と進捗を管理します</p>
          </div>
          <button 
            onClick={handleAddRepair}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>新規修繕記録</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総件数</p>
                <p className="text-3xl font-bold text-gray-900">{filteredRecords.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">作業中</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredRecords.filter(r => r.status === 'in-progress').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">緊急案件</p>
                <p className="text-3xl font-bold text-red-600">
                  {filteredRecords.filter(r => r.priority === 'urgent').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">建物全体</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredRecords.filter(r => r.scope === 'building').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="修繕内容または業者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value as 'all' | 'room' | 'building')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="building">建物全体</option>
            <option value="room">部屋個別</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'in-progress' | 'completed')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="pending">未対応</option>
            <option value="in-progress">作業中</option>
            <option value="completed">完了</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'urgent')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="urgent">緊急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">修繕内容</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">対象・場所</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">範囲</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">進捗</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">期間</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">費用</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">業者</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">優先度</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">状態</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const info = getRecordInfo(record);
                const progressPercentage = getProgressPercentage(record);
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {record.photoPaths.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Camera className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{record.photoPaths.length}枚</span>
                              </div>
                            )}
                            {record.reportPdfPath && (
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">報告書</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{info.mansionName}</p>
                        <p className="text-sm text-gray-600">{info.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getScopeColor(record.scope)}`}>
                        {getScopeIcon(record.scope)}
                        <span>{getScopeText(record.scope)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">進捗</span>
                          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        {record.progressSteps.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {record.progressSteps.filter(s => s.status === 'completed').length}/{record.progressSteps.length} ステップ完了
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{record.requestDate}</span>
                        </div>
                        {record.startDate && (
                          <p className="text-xs text-gray-600">開始: {record.startDate}</p>
                        )}
                        {record.completionDate && (
                          <p className="text-xs text-gray-600">完了: {record.completionDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Yen className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            ¥{(record.cost || record.estimatedCost || 0).toLocaleString()}
                          </span>
                        </div>
                        {record.estimatedCost && record.cost !== record.estimatedCost && (
                          <p className="text-xs text-gray-600">
                            見積: ¥{record.estimatedCost.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{record.contractor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                        {getPriorityText(record.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span>{getStatusText(record.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditRepair(record)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>編集</span>
                        </button>
                        <button 
                          onClick={() => handleViewProgress(record)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>進捗</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する修繕記録が見つかりません</p>
        </div>
      )}

      {/* Modals */}
      {showRepairModal && (
        <RepairModal
          repair={selectedRepair}
          onClose={handleModalClose}
          userRole={userRole}
        />
      )}

      {showProgressModal && selectedRepair && (
        <RepairProgressModal
          repair={selectedRepair}
          onClose={handleModalClose}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default RepairManagement;