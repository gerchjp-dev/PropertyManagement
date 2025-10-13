import React, { useState } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Filter } from 'lucide-react';
import { mockFinancialRecords } from '../data/mockData';
import { FinancialRecord } from '../types';

const FinancialManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');

  const filteredRecords = mockFinancialRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
    const matchesPeriod = record.date.startsWith(selectedPeriod);
    
    return matchesSearch && matchesType && matchesCategory && matchesPeriod;
  });

  const totalIncome = filteredRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpense = filteredRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);

  const netIncome = totalIncome - totalExpense;

  const incomeCategories = [...new Set(mockFinancialRecords.filter(r => r.type === 'income').map(r => r.category))];
  const expenseCategories = [...new Set(mockFinancialRecords.filter(r => r.type === 'expense').map(r => r.category))];
  const allCategories = [...incomeCategories, ...expenseCategories];

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTypeText = (type: string) => {
    return type === 'income' ? '収入' : '支出';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">財務管理</h2>
            <p className="text-gray-600">収支記録と財務分析を管理します</p>
          </div>
          <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>新規記録追加</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総収入</p>
                <p className="text-3xl font-bold text-green-600">¥{totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総支出</p>
                <p className="text-3xl font-bold text-red-600">¥{totalExpense.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">純利益</p>
                <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ¥{netIncome.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
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
              placeholder="説明またはカテゴリで検索..."
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
            <option value="2024-07">2024年7月</option>
            <option value="2024-06">2024年6月</option>
            <option value="2024-05">2024年5月</option>
            <option value="2024-04">2024年4月</option>
            <option value="2024-03">2024年3月</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="income">収入</option>
            <option value="expense">支出</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべてのカテゴリ</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">日付</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">種別</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">カテゴリ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">説明</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">金額</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">定期</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">書類</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{record.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {getTypeIcon(record.type)}
                      <span>{getTypeText(record.type)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{record.category}</p>
                      {record.subcategory && (
                        <p className="text-sm text-gray-600">{record.subcategory}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{record.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className={`font-medium ${getTypeColor(record.type)}`}>
                        ¥{record.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.isRecurring ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.recurringFrequency === 'monthly' ? '月次' : 
                         record.recurringFrequency === 'quarterly' ? '四半期' : '年次'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">単発</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {record.invoicePdfPath && (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                      {record.receiptPdfPath && (
                        <FileText className="h-4 w-4 text-green-600" />
                      )}
                      {!record.invoicePdfPath && !record.receiptPdfPath && (
                        <span className="text-sm text-gray-400">なし</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する財務記録が見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;