import React, { useState } from 'react';
import { Plus, Search, FileText, Calendar, User, Pen as Yen, AlertTriangle, CheckCircle, Clock, Eye, Edit, BarChart3 } from 'lucide-react';
import { mockContracts, mockResidents, mockRooms, mockMansions } from '../data/mockData';
import { Contract } from '../types';
import ContractModal from './ContractModal';
import ContractProgressModal from './ContractProgressModal';

interface ContractManagementProps {
  userRole?: 'admin' | 'manager';
}

const ContractManagement: React.FC<ContractManagementProps> = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // 管理会社の場合は担当物件のみ表示
  const availableContracts = userRole === 'manager' 
    ? mockContracts.filter(contract => {
        const resident = mockResidents.find(r => r.id === contract.residentId);
        const room = mockRooms.find(r => r.id === resident?.roomId);
        const mansion = mockMansions.find(m => m.id === room?.mansionId);
        return mansion?.name === 'グランドパレス六本木';
      })
    : mockContracts;

  const filteredContracts = availableContracts.filter(contract => {
    const resident = mockResidents.find(r => r.id === contract.residentId);
    const matchesSearch = resident?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.guarantor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddContract = () => {
    setSelectedContract(null);
    setShowContractModal(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const handleViewProgress = (contract: Contract) => {
    setSelectedContract(contract);
    setShowProgressModal(true);
  };

  const getContractInfo = (contract: Contract) => {
    const resident = mockResidents.find(r => r.id === contract.residentId);
    const room = mockRooms.find(r => r.id === resident?.roomId);
    const mansion = mockMansions.find(m => m.id === room?.mansionId);
    
    return {
      residentName: resident?.name || '不明',
      roomNumber: room?.roomNumber || '不明',
      mansionName: mansion?.name || '不明'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'expired':
        return '期限切れ';
      case 'pending':
        return '保留中';
      default:
        return '不明';
    }
  };

  const getProgressPercentage = (contract: Contract) => {
    if (contract.contractSteps.length === 0) return 0;
    const completedSteps = contract.contractSteps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / contract.contractSteps.length) * 100);
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return end <= sixMonthsFromNow && end > new Date();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">契約管理</h2>
            <p className="text-gray-600">住人の契約情報を管理します</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="住人名または保証人名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'expired' | 'pending')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="active">有効</option>
            <option value="expired">期限切れ</option>
            <option value="pending">保留中</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総契約数</p>
              <p className="text-3xl font-bold text-gray-900">{filteredContracts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">有効契約</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredContracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">更新予定</p>
              <p className="text-3xl font-bold text-yellow-600">
                {filteredContracts.filter(c => c.status === 'renewal-due').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">手続き中</p>
              <p className="text-3xl font-bold text-blue-600">
                {filteredContracts.filter(c => c.contractSteps.some(s => s.status === 'in-progress')).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">契約者</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">物件・部屋</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">進捗</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">契約期間</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">家賃</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">保証人</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">状態</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => {
                const info = getContractInfo(contract);
                const expiringSoon = isExpiringSoon(contract.endDate);
                const progressPercentage = getProgressPercentage(contract);
                
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{info.residentName}</p>
                          <p className="text-sm text-gray-600">契約ID: {contract.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{info.mansionName}</p>
                        <p className="text-sm text-gray-600">部屋番号: {info.roomNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">手続き進捗</span>
                          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        {contract.contractSteps.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {contract.contractSteps.filter(s => s.status === 'completed').length}/{contract.contractSteps.length} ステップ完了
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{contract.startDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">～ {contract.endDate}</span>
                          {expiringSoon && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              期限間近
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Yen className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">¥{contract.rent.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{contract.guarantor}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span>{getStatusText(contract.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditContract(contract)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>編集</span>
                        </button>
                        <button 
                          onClick={() => handleViewProgress(contract)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>進捗</span>
                        </button>
                        {contract.contractPdfPath && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する契約が見つかりません</p>
        </div>
      )}

      {/* Modals */}
      {showContractModal && (
        <ContractModal
          contract={selectedContract}
          onClose={() => setShowContractModal(false)}
          userRole={userRole}
        />
      )}

      {showProgressModal && selectedContract && (
        <ContractProgressModal
          contract={selectedContract}
          onClose={() => setShowProgressModal(false)}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ContractManagement;