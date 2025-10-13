import React, { useState } from 'react';
import { FileBarChart, Download, Calendar, TrendingUp, TrendingDown, DollarSign, Home, Users } from 'lucide-react';
import { mockMonthlyReports, mockMansions, mockRooms, mockResidents } from '../data/mockData';

const Reports: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('3');

  const currentReport = mockMonthlyReports.find(
    report => report.year === parseInt(selectedYear) && report.month === parseInt(selectedMonth)
  );

  const generateReport = () => {
    console.log('Generating report for', selectedYear, selectedMonth);
  };

  const downloadReport = () => {
    console.log('Downloading report');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">レポート・分析</h2>
            <p className="text-gray-600">月次収支報告書と経営分析レポートを管理します</p>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button
              onClick={generateReport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <FileBarChart className="h-5 w-5" />
              <span>レポート生成</span>
            </button>
            {currentReport?.reportPdfPath && (
              <button
                onClick={downloadReport}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>PDF ダウンロード</span>
              </button>
            )}
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">対象期間:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2024">2024年</option>
            <option value="2023">2023年</option>
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}月
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentReport ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総収入</p>
                  <p className="text-3xl font-bold text-green-600">¥{currentReport.totalIncome.toLocaleString()}</p>
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
                  <p className="text-3xl font-bold text-red-600">¥{currentReport.totalExpense.toLocaleString()}</p>
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
                  <p className="text-3xl font-bold text-blue-600">¥{currentReport.netIncome.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">入居率</p>
                  <p className="text-3xl font-bold text-emerald-600">{currentReport.occupancyRate}%</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Home className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Income and Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">収入内訳</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">賃料</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">共益費</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.maintenanceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">敷金</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">礼金</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.keyMoney.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">駐車場代</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.parking.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">その他</span>
                  <span className="font-semibold text-green-600">¥{currentReport.incomeBreakdown.other.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-900">合計</span>
                    <span className="text-green-600">¥{currentReport.totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">支出内訳</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">管理費</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.management.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">保守・メンテナンス</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.maintenance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">光熱費</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.utilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">修繕費</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.repairs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">保険料</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">税金</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">その他</span>
                  <span className="font-semibold text-red-600">¥{currentReport.expenseBreakdown.other.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-900">合計</span>
                    <span className="text-red-600">¥{currentReport.totalExpense.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">物件概要</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockMansions.length}</p>
                <p className="text-sm text-gray-600">管理物件数</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockRooms.length}</p>
                <p className="text-sm text-gray-600">総部屋数</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockResidents.length}</p>
                <p className="text-sm text-gray-600">入居者数</p>
              </div>
            </div>
          </div>

          {/* Historical Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月次推移</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">月</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">総収入</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">総支出</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">純利益</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">入居率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockMonthlyReports.map((report) => (
                    <tr key={`${report.year}-${report.month}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {report.year}年{report.month}月
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        ¥{report.totalIncome.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        ¥{report.totalExpense.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                        ¥{report.netIncome.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {report.occupancyRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileBarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">選択された期間のレポートが見つかりません</p>
          <button
            onClick={generateReport}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            レポートを生成
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;