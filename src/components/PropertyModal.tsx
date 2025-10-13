import React, { useState } from 'react';
import { X, Upload, FileText, Calendar, MapPin, Building2, Image, DollarSign, TrendingDown, Plus } from 'lucide-react';
import { Mansion, MansionExpense } from '../types';
import { mansionService } from '../services/database';
import { mockMansionExpenses } from '../data/mockData';

interface PropertyModalProps {
  property: Mansion | null;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, userRole = 'admin' }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'expenses'>('info');
  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.address || '',
    purchaseDate: property?.purchaseDate || '',
    totalRooms: property?.totalRooms || 0,
  });

  // 支出管理用の状態
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [expenseData, setExpenseData] = useState({
    management: 0,
    utilities: 0,
    maintenance: 0,
    repairs: 0,
    insurance: 0,
    cleaning: 0,
    security: 0,
    other: 0
  });
  const [expenseFiles, setExpenseFiles] = useState<File[]>([]);

  // 現在の物件の支出データを取得
  const currentExpenses = property ? mockMansionExpenses.filter(exp => 
    exp.mansionId === property.id && 
    exp.year === parseInt(selectedYear) && 
    exp.month === parseInt(selectedMonth)
  )[0] : null;

  React.useEffect(() => {
    if (currentExpenses) {
      setExpenseData(currentExpenses.expenses);
    } else {
      setExpenseData({
        management: 0,
        utilities: 0,
        maintenance: 0,
        repairs: 0,
        insurance: 0,
        cleaning: 0,
        security: 0,
        other: 0
      });
    }
  }, [currentExpenses]);

  const handleSubmitAsync = async () => {
    try {
      // 入力値検証
      if (!formData.name.trim()) {
        alert('❌ 物件名を入力してください');
        return;
      }
      if (!formData.address.trim()) {
        alert('❌ 住所を入力してください');
        return;
      }
      if (!formData.purchaseDate) {
        alert('❌ 購入日を入力してください');
        return;
      }
      if (formData.totalRooms <= 0) {
        alert('❌ 総部屋数は1以上で入力してください');
        return;
      }
      
      const mansionData = {
        name: formData.name,
        address: formData.address,
        purchaseDate: formData.purchaseDate,
        totalRooms: formData.totalRooms,
        photoPaths: property?.photoPaths || [],
        deedPdfPath: property?.deedPdfPath,
        occupancyRate: property?.occupancyRate || 0
      };
      
      if (property) {
        // 既存物件の更新
        await mansionService.update(property.id, mansionData);
        console.log(`✅ 物件「${formData.name}」を正常に更新しました`);
        alert(`✅ 物件「${formData.name}」を正常に更新しました`);
      } else {
        // 新規物件の追加
        await mansionService.create(mansionData);
        console.log(`✅ 物件「${formData.name}」を正常に追加しました`);
        alert(`✅ 物件「${formData.name}」を正常に追加しました`);
      }
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined,
        formData
      });
      if (property) {
        alert(`❌ 物件の更新に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
      } else {
        alert(`❌ 物件の追加に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}\n\n入力内容を確認してもう一度お試しください。`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAsync();
  };

  const handleExpenseSubmit = async () => {
    try {
      const totalExpense = Object.values(expenseData).reduce((sum, value) => sum + value, 0);
      
      console.log('Saving expense data:', {
        mansionId: property?.id,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        expenses: expenseData,
        totalExpense,
        files: expenseFiles
      });
      
      alert(`✅ ${property?.name}の${selectedYear}年${selectedMonth}月の支出データを保存しました\n\n総支出: ¥${totalExpense.toLocaleString()}`);
      setExpenseFiles([]);
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('❌ 支出データの保存に失敗しました');
    }
  };

  const handleFileUpload = (type: 'image' | 'pdf') => {
    console.log('File upload type:', type);
    alert(`${type === 'image' ? '画像' : 'PDF'}のアップロード機能は開発中です`);
  };

  const handleExpenseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setExpenseFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeExpenseFile = (index: number) => {
    setExpenseFiles(files => files.filter((_, i) => i !== index));
  };

  const getTotalExpense = () => {
    return Object.values(expenseData).reduce((sum, value) => sum + value, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {property ? '物件情報編集' : '新規物件追加'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              基本情報
            </button>
            {property && (
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                月次支出管理
              </button>
            )}
          </nav>
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件名
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="物件名を入力"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="住所を入力"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  購入日
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  総部屋数
                </label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="部屋数を入力"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件写真
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleFileUpload('image')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      写真をアップロード
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG形式対応
                    </p>
                  </div>
                </div>
                {property?.photoPaths && property.photoPaths.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {property.photoPaths.map((path, index) => (
                      <img
                        key={index}
                        src={path}
                        alt={`物件写真 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  謄本・書類
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleFileUpload('pdf')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      書類をアップロード
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF形式対応
                    </p>
                  </div>
                </div>
                {property?.deedPdfPath && (
                  <div className="mt-4 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">謄本書類.pdf</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                disabled={userRole !== 'admin'}
              >
                {property ? '更新' : '追加'}
              </button>
            </div>
          </form>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && property && (
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">月次支出管理</h4>
              <p className="text-gray-600 mb-4">{property.name}の月次支出データを管理します</p>
              
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

              {/* Current Expense Summary */}
              {currentExpenses && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-blue-900">
                        {selectedYear}年{selectedMonth}月の支出実績
                      </h5>
                      <p className="text-blue-700">
                        総支出: ¥{currentExpenses.totalExpense.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TrendingDown className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Expense Input Form */}
            <div className="space-y-6">
              <h5 className="text-lg font-medium text-gray-900">支出項目入力</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管理費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.management}
                      onChange={(e) => setExpenseData({ ...expenseData, management: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="管理費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    光熱費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.utilities}
                      onChange={(e) => setExpenseData({ ...expenseData, utilities: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="光熱費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メンテナンス費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.maintenance}
                      onChange={(e) => setExpenseData({ ...expenseData, maintenance: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="メンテナンス費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    修繕費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.repairs}
                      onChange={(e) => setExpenseData({ ...expenseData, repairs: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="修繕費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    保険料
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.insurance}
                      onChange={(e) => setExpenseData({ ...expenseData, insurance: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="保険料を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    清掃費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.cleaning}
                      onChange={(e) => setExpenseData({ ...expenseData, cleaning: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="清掃費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    セキュリティ費
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.security}
                      onChange={(e) => setExpenseData({ ...expenseData, security: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="セキュリティ費を入力"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    その他
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseData.other}
                      onChange={(e) => setExpenseData({ ...expenseData, other: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="その他費用を入力"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Total Expense Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">合計支出</span>
                  <span className="text-2xl font-bold text-red-600">¥{getTotalExpense().toLocaleString()}</span>
                </div>
              </div>

              {/* File Upload for Receipts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  請求書・領収書アップロード
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        書類をアップロード
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleExpenseFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, JPG, PNG形式対応
                    </p>
                  </div>
                </div>
                {expenseFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">{expenseFiles.length}件の書類が選択されています</p>
                    <div className="space-y-2">
                      {expenseFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExpenseFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Files Display */}
              {currentExpenses?.uploadedFiles && currentExpenses.uploadedFiles.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-3">既存の書類</h6>
                  <div className="space-y-2">
                    {currentExpenses.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">{file.name}</span>
                          <span className="text-xs text-green-600">({file.uploadDate})</span>
                        </div>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          ダウンロード
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Expense Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExpenseSubmit}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>支出データを保存</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyModal;