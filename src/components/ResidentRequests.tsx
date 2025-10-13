import React, { useState } from 'react';
import { MessageSquare, Search, User, Calendar, AlertTriangle, CheckCircle, Clock, Camera, Filter } from 'lucide-react';
import { mockResidentRequests, mockResidents, mockRooms, mockMansions } from '../data/mockData';
import { ResidentRequest } from '../types';

const ResidentRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'repair' | 'complaint' | 'suggestion' | 'inquiry'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed'>('all');

  const filteredRequests = mockResidentRequests.filter(request => {
    const resident = mockResidents.find(r => r.id === request.residentId);
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getRequestInfo = (request: ResidentRequest) => {
    const resident = mockResidents.find(r => r.id === request.residentId);
    const room = mockRooms.find(r => r.id === request.roomId);
    const mansion = mockMansions.find(m => m.id === room?.mansionId);
    
    return {
      residentName: resident?.name || '不明',
      roomNumber: room?.roomNumber || '不明',
      mansionName: mansion?.name || '不明'
    };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'repair':
        return 'bg-red-100 text-red-800';
      case 'complaint':
        return 'bg-orange-100 text-orange-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'inquiry':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-gray-100 text-gray-600';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'reviewing':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'repair':
        return '修繕依頼';
      case 'complaint':
        return '苦情・相談';
      case 'suggestion':
        return '提案・要望';
      case 'inquiry':
        return '問い合わせ';
      default:
        return '不明';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return '受付済';
      case 'reviewing':
        return '確認中';
      case 'in-progress':
        return '対応中';
      case 'resolved':
        return '解決済';
      case 'closed':
        return '完了';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">住民要望管理</h2>
            <p className="text-gray-600">住民からの要望・意見・修繕依頼を管理します</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総件数</p>
                <p className="text-3xl font-bold text-gray-900">{mockResidentRequests.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">対応中</p>
                <p className="text-3xl font-bold text-blue-600">
                  {mockResidentRequests.filter(r => r.status === 'in-progress').length}
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
                  {mockResidentRequests.filter(r => r.priority === 'urgent').length}
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
                <p className="text-sm font-medium text-gray-600">解決済</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockResidentRequests.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
              placeholder="タイトル、内容、住民名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'repair' | 'complaint' | 'suggestion' | 'inquiry')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての種別</option>
            <option value="repair">修繕依頼</option>
            <option value="complaint">苦情・相談</option>
            <option value="suggestion">提案・要望</option>
            <option value="inquiry">問い合わせ</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての状態</option>
            <option value="submitted">受付済</option>
            <option value="reviewing">確認中</option>
            <option value="in-progress">対応中</option>
            <option value="resolved">解決済</option>
            <option value="closed">完了</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">要望内容</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">住民・部屋</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">種別</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">優先度</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">状態</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">提出日</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">担当者</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const info = getRequestInfo(request);
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full mt-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{request.title}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                          {request.photoPaths.length > 0 && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Camera className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{request.photoPaths.length}枚の写真</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{info.residentName}</p>
                          <p className="text-sm text-gray-600">{info.mansionName}</p>
                          <p className="text-sm text-gray-600">部屋: {info.roomNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                        {getTypeText(request.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{getStatusText(request.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{request.submittedDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {request.assignedTo || '未割当'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          詳細
                        </button>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          対応
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

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する要望が見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default ResidentRequests;