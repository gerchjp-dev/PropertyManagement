import React, { useState } from 'react';
import { X, User, Building2, Home, Calendar, Pen as Yen, FileText, AlertTriangle } from 'lucide-react';
import { Contract } from '../types';
import { mockMansions, mockRooms, mockResidents } from '../data/mockData';

interface ContractModalProps {
  contract: Contract | null;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const ContractModal: React.FC<ContractModalProps> = ({ contract, onClose, userRole = 'admin' }) => {
  const [formData, setFormData] = useState({
    residentId: contract?.residentId || '',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    rent: contract?.rent || 0,
    maintenanceFee: contract?.maintenanceFee || 0,
    deposit: contract?.deposit || 0,
    keyMoney: contract?.keyMoney || 0,
    guarantor: contract?.guarantor || '',
    applicationDate: contract?.applicationDate || '',
    approvalDate: contract?.approvalDate || '',
    signingDate: contract?.signingDate || '',
    moveInDate: contract?.moveInDate || '',
    keyHandoverDate: contract?.keyHandoverDate || '',
    renewalDate: contract?.renewalDate || '',
    renewalFee: contract?.renewalFee || 0,
    notes: contract?.notes || ''
  });

  // 管理会社の場合は担当物件の住民のみ
  const availableResidents = userRole === 'manager' 
    ? mockResidents.filter(resident => {
        const room = mockRooms.find(r => r.id === resident.roomId);
        const mansion = mockMansions.find(m => m.id === room?.mansionId);
        return mansion?.name === 'グランドパレス六本木';
      })
    : mockResidents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contract form submitted:', formData);
    onClose();
  };

  const getResidentInfo = (residentId: string) => {
    const resident = mockResidents.find(r => r.id === residentId);
    if (!resident) return { name: '', roomNumber: '', mansionName: '' };
    
    const room = mockRooms.find(r => r.id === resident.roomId);
    const mansion = mockMansions.find(m => m.id === room?.mansionId);
    
    return {
      name: resident.name,
      roomNumber: room?.roomNumber || '',
      mansionName: mansion?.name || ''
    };
  };

  const selectedResidentInfo = getResidentInfo(formData.residentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {contract ? '契約情報編集' : '新規契約追加'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 住民選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              契約者 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.residentId}
                onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">住民を選択</option>
                {availableResidents.map((resident) => {
                  const info = getResidentInfo(resident.id);
                  return (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} ({info.mansionName} {info.roomNumber}号室)
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedResidentInfo.name && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>選択中:</strong> {selectedResidentInfo.name} - {selectedResidentInfo.mansionName} {selectedResidentInfo.roomNumber}号室
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 契約期間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約開始日 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約終了日 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* 金額設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月額家賃 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="月額家賃を入力"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                共益費
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.maintenanceFee}
                  onChange={(e) => setFormData({ ...formData, maintenanceFee: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="共益費を入力"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                敷金
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="敷金を入力"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                礼金
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.keyMoney}
                  onChange={(e) => setFormData({ ...formData, keyMoney: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="礼金を入力"
                  min="0"
                />
              </div>
            </div>

            {/* 保証人 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                保証人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.guarantor}
                onChange={(e) => setFormData({ ...formData, guarantor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="保証人名を入力"
                required
              />
            </div>

            {/* 重要日程 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                申込日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                承認日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.approvalDate}
                  onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約締結日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.signingDate}
                  onChange={(e) => setFormData({ ...formData, signingDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                入居日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                鍵渡し日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.keyHandoverDate}
                  onChange={(e) => setFormData({ ...formData, keyHandoverDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 更新関連（既存契約の場合） */}
            {contract && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    更新予定日
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.renewalDate}
                      onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    更新料
                  </label>
                  <div className="relative">
                    <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.renewalFee}
                      onChange={(e) => setFormData({ ...formData, renewalFee: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="更新料を入力"
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* メモ */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ・特記事項
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="契約に関するメモや特記事項を入力"
            />
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
            >
              {contract ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractModal;