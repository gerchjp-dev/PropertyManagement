import React, { useState } from 'react';
import { Plus, Search, User, Phone, Mail, Calendar, AlertCircle, Key, Eye, EyeOff, Edit, Save, X, Shield, Trash2 } from 'lucide-react';
import { mockResidents, mockRooms, mockMansions, mockContracts } from '../data/mockData';
import { Resident } from '../types';
import ResidentModal from './ResidentModal';

interface ResidentManagementProps {
  userRole?: 'admin' | 'manager';
}

const ResidentManagement: React.FC<ResidentManagementProps> = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'login'>('info');
  const [editingResident, setEditingResident] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    userId: string;
    password: string;
    isActive: boolean;
  }>({ userId: '', password: '', isActive: true });
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [filterMansion, setFilterMansion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'mansion' | 'moveInDate' | 'contractStatus'>('name');
  const [showResidentModal, setShowResidentModal] = useState(false);

  // 管理会社の場合は担当物件の住民のみ表示
  const availableResidents = userRole === 'manager'
    ? mockResidents.filter(resident => {
        const room = mockRooms.find(r => r.id === resident.roomId);
        const mansion = mockMansions.find(m => m.id === room?.mansionId);
        return mansion?.name === 'グランドパレス六本木'; // 担当物件のみ
      })
    : mockResidents;

  // 管理会社の場合は担当物件のみ表示
  const availableMansions = userRole === 'manager' 
    ? mockMansions.filter(m => m.name === 'グランドパレス六本木')
    : mockMansions;

  const getResidentContractStatus = (residentId: string) => {
    const contract = mockContracts.find(c => c.residentId === residentId);
    if (!contract) return 'no-contract';
    
    const completedSteps = contract.contractSteps.filter(s => s.status === 'completed').length;
    const totalSteps = contract.contractSteps.length;
    
    if (totalSteps === 0) return 'pending';
    if (completedSteps === totalSteps) return 'completed';
    if (completedSteps > 0) return 'in-progress';
    return 'pending';
  };

  const filteredResidents = availableResidents.filter(resident => {
    const room = mockRooms.find(r => r.id === resident.roomId);
    const mansion = mockMansions.find(m => m.id === room?.mansionId);
    
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.phone.includes(searchTerm) ||
                         (resident.userId && resident.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         mansion?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMansion = filterMansion === 'all' || mansion?.id === filterMansion;
    
    return matchesSearch && matchesMansion;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'mansion':
        const roomA = mockRooms.find(r => r.id === a.roomId);
        const roomB = mockRooms.find(r => r.id === b.roomId);
        const mansionA = mockMansions.find(m => m.id === roomA?.mansionId);
        const mansionB = mockMansions.find(m => m.id === roomB?.mansionId);
        return (mansionA?.name || '').localeCompare(mansionB?.name || '');
      case 'moveInDate':
        return new Date(b.moveInDate).getTime() - new Date(a.moveInDate).getTime();
      case 'contractStatus':
        const statusA = getResidentContractStatus(a.id);
        const statusB = getResidentContractStatus(b.id);
        return statusA.localeCompare(statusB);
      default:
        return 0;
    }
  });

  const getRoomInfo = (roomId: string) => {
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) return { roomNumber: '不明', mansionName: '不明' };
    
    const mansion = mockMansions.find(m => m.id === room.mansionId);
    return {
      roomNumber: room.roomNumber,
      mansionName: mansion?.name || '不明'
    };
  };

  const handleAddResident = () => {
    setSelectedResident(null);
    setShowResidentModal(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setShowResidentModal(true);
  };

  const handleEditLogin = (resident: Resident) => {
    setEditingResident(resident.id);
    setEditForm({
      userId: resident.userId || '',
      password: resident.password || '',
      isActive: resident.isActive
    });
  };

  const handleSaveLogin = (residentId: string) => {
    console.log('Saving credentials for resident:', residentId, editForm);
    setEditingResident(null);
  };

  const handleCancelLogin = () => {
    setEditingResident(null);
    setEditForm({ userId: '', password: '', isActive: true });
  };

  const generateUserId = (resident: Resident) => {
    const room = mockRooms.find(r => r.id === resident.roomId);
    if (room) {
      return `${resident.name.split(' ')[0].toLowerCase()}${room.roomNumber}`;
    }
    return `user${resident.id}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'no-contract':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '契約完了';
      case 'in-progress':
        return '手続き中';
      case 'pending':
        return '申込済';
      case 'no-contract':
        return '未契約';
      default:
        return '不明';
    }
  };

  const togglePasswordVisibility = (residentId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [residentId]: !prev[residentId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">住人管理</h2>
            <p className="text-gray-600">住人の情報とログイン設定を管理します</p>
          </div>
          <button
            onClick={handleAddResident}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>新規住人登録</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="住人名、メールアドレス、電話番号、物件名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterMansion}
            onChange={(e) => setFilterMansion(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての物件</option>
            {availableMansions.map((mansion) => (
              <option key={mansion.id} value={mansion.id}>
                {mansion.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">氏名順</option>
            <option value="mansion">物件順</option>
            <option value="moveInDate">入居日順</option>
            <option value="contractStatus">契約状況順</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">住人情報</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">居住先</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">契約状況</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">連絡先</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">入居日</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">ログイン情報</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResidents.map((resident) => {
                const roomInfo = getRoomInfo(resident.roomId);
                const isEditingLogin = editingResident === resident.id;
                const contractStatus = getResidentContractStatus(resident.id);
                
                return (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{resident.name}</p>
                          <p className="text-sm text-gray-600">ID: {resident.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{roomInfo.mansionName}</p>
                        <p className="text-sm text-gray-600">部屋番号: {roomInfo.roomNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getContractStatusColor(contractStatus)}`}>
                        {getContractStatusText(contractStatus)}
                      </span>
                      {contractStatus === 'in-progress' && (
                        <p className="text-xs text-gray-500 mt-1">手続き進行中</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{resident.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{resident.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{resident.moveInDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditingLogin ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ユーザーID</label>
                            <input
                              type="text"
                              value={editForm.userId}
                              onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="ユーザーIDを入力"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">パスワード</label>
                            <div className="relative">
                              <input
                                type={showPassword[resident.id] ? 'text' : 'password'}
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="パスワードを入力"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(resident.id)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword[resident.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">有効</span>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm text-gray-900">
                              {resident.userId || '未設定'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-gray-900">
                              {resident.password ? '••••••••' : '未設定'}
                            </span>
                            {resident.password && (
                              <button
                                onClick={() => togglePasswordVisibility(resident.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showPassword[resident.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                          {showPassword[resident.id] && resident.password && (
                            <span className="font-mono text-sm text-gray-700">
                              {resident.password}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            resident.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {resident.isActive ? '有効' : '無効'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditingLogin ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveLogin(resident.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Save className="h-4 w-4" />
                            <span>保存</span>
                          </button>
                          <button
                            onClick={handleCancelLogin}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span>キャンセル</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditResident(resident)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleEditLogin(resident)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Key className="h-4 w-4" />
                            <span>ログイン</span>
                          </button>
                          {!resident.userId && (
                            <button
                              onClick={() => {
                                setEditingResident(resident.id);
                                setEditForm({
                                  userId: generateUserId(resident),
                                  password: generatePassword(),
                                  isActive: true
                                });
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <Plus className="h-4 w-4" />
                              <span>作成</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResidents.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する住人が見つかりません</p>
        </div>
      )}

      {/* Resident Modal */}
      {showResidentModal && (
        <ResidentModal
          resident={selectedResident}
          onClose={() => setShowResidentModal(false)}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ResidentManagement;