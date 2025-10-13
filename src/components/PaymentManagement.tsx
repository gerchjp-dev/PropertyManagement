import React, { useState } from 'react';
import { Plus, Search, CreditCard, Calendar, Building2, User, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { mockPaymentRecords } from '../data/mockData';
import { PaymentRecord } from '../types';

const PaymentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>('all');
  const [filterType, setFilterType] = useState<'all' | 'contractor' | 'utility' | 'maintenance' | 'insurance' | 'tax' | 'other'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');

  const filteredRecords = mockPaymentRecords.filter(record => {
    const matchesSearch = record.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.bankAccount?.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesType = filterType === 'all' || record.category === filterType;
    const matchesPeriod = record.paymentDate.startsWith(selectedPeriod);
    
    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });

  const totalPending = filteredRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalCompleted = filteredRecords
    .filter(record => record.status === 'completed')
    .reduce((sum, record) => sum + record.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '未払い';
      case 'failed':
        return '失敗';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '不明';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'contractor':
        return '業者支払い';
      case 'utility':
        return '光熱費';
      case 'maintenance':
        return 'メンテナンス';
      case 'insurance':
        return '保険料';
      case 'tax':
        return '税金';
      case 'other':
        return 'その他';
      default:
        return category;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return '銀行振込';
      case 'credit_card':
        return 'クレジットカード';
      case 'cash':
        return '現金';
      case 'check':
        return '小切手';
      default:
        return method;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">支払い管理</h2>
            <p className="text-gray-600">業者への支払いと口座情報を管理します</p>
          </div>
          <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>新規支払い追加</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">未払い金額</p>
                <p className="text-3xl font-bold text-yellow-600">¥{totalPending.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">支払い完了</p>
                <p className="text-3xl font-bold text-green-600">¥{totalCompleted.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総支払い件数</p>
                <p className="text-3xl font-bold text-gray-900">{filteredRecords.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
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
              placeholder="支払い先、説明、口座名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2024-12">2024年12月</option>
            <option value="2024-11">2024年11月</option>
            <option value="2024-10">2024年10月</option>
            <option value="2024-09">2024年9月</option>
            <option value="2024-08">2024年8月</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="pending">未払い</option>
            <option value="completed">完了</option>
            <option value="failed">失敗</option>
            <option value="cancelled">キャンセル</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="contractor">業者支払い</option>
            <option value="utility">光熱費</option>
            <option value="maintenance">メンテナンス</option>
            <option value="insurance">保険料</option>
            <option value="tax">税金</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">支払い先</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">金額・説明</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">支払い日</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">支払い方法</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">口座情報</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">状態</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.payeeName}</p>
                        <p className="text-sm text-gray-600">{getCategoryText(record.category)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">¥{record.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{record.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{record.paymentDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {getPaymentMethodText(record.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.bankAccount ? (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{record.bankAccount.bankName}</p>
                        <p className="text-gray-600">{record.bankAccount.accountName}</p>
                        <p className="text-gray-600">{record.bankAccount.accountNumber}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span>{getStatusText(record.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        編集
                      </button>
                      {record.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          支払い
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する支払い記録が見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;