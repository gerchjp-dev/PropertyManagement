import React, { useState } from 'react';
import { X, Building2, Home, Calendar, Pen as Yen, User, AlertTriangle, Camera, FileText } from 'lucide-react';
import { RepairRecord } from '../types';
import { mockMansions, mockRooms, mockContractors } from '../data/mockData';

interface RepairModalProps {
  repair: RepairRecord | null;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const RepairModal: React.FC<RepairModalProps> = ({ repair, onClose, userRole = 'admin' }) => {
  const [formData, setFormData] = useState({
    mansionId: repair?.mansionId || '',
    roomId: repair?.roomId || '',
    scope: repair?.scope || 'room',
    description: repair?.description || '',
    priority: repair?.priority || 'medium',
    category: repair?.category || 'other',
    contractorId: repair?.contractorId || '',
    estimatedCost: repair?.estimatedCost || 0,
    requestDate: repair?.requestDate || new Date().toISOString().split('T')[0],
    startDate: repair?.startDate || '',
    notes: repair?.notes || ''
  });

  const [photos, setPhotos] = useState<File[]>([]);

  // 管理会社の場合は担当物件のみ
  const availableMansions = userRole === 'manager' 
    ? mockMansions.filter(m => m.name === 'グランドパレス六本木')
    : mockMansions;

  const availableRooms = mockRooms.filter(room => room.mansionId === formData.mansionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const handleSubmitAsync = async () => {
      try {
        if (repair) {
          // 既存修繕記録の更新
          await repairService.update(repair.id, {
            room_id: formData.roomId || null,
            mansion_id: formData.mansionId,
            contractor_id: formData.contractorId || null,
            scope: formData.scope as 'room' | 'building',
            description: formData.description,
            request_date: formData.requestDate,
            start_date: formData.startDate || null,
            estimated_cost: formData.estimatedCost,
            contractor_name: mockContractors.find(c => c.id === formData.contractorId)?.name || '未指定',
            priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
            category: formData.category as 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other',
            notes: formData.notes || null
          });
          alert(`✅ 修繕記録「${formData.description}」を正常に更新しました`);
        } else {
          // 新規修繕記録の追加
          if (!formData.description.trim()) {
            alert('❌ 修繕内容を入力してください');
            return;
          }
          if (!formData.mansionId) {
            alert('❌ 物件を選択してください');
            return;
          }
          if (formData.scope === 'room' && !formData.roomId) {
            alert('❌ 部屋個別修繕の場合は部屋を選択してください');
            return;
          }

          await repairService.create({
            room_id: formData.roomId || null,
            mansion_id: formData.mansionId,
            contractor_id: formData.contractorId || null,
            scope: formData.scope as 'room' | 'building',
            description: formData.description,
            request_date: formData.requestDate,
            start_date: formData.startDate || null,
            estimated_cost: formData.estimatedCost,
            contractor_name: mockContractors.find(c => c.id === formData.contractorId)?.name || '未指定',
            priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
            category: formData.category as 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other',
            notes: formData.notes || null
          });
          alert(`✅ 修繕記録「${formData.description}」を正常に追加しました`);
        }
        onClose();
      } catch (error) {
        console.error('Error saving repair:', error);
        if (repair) {
          alert(`❌ 修繕記録の更新に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
        } else {
          alert(`❌ 修繕記録の追加に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}\n\n入力内容を確認してもう一度お試しください。`);
        }
      }
    };
    
    handleSubmitAsync();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPhotos(selectedFiles);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {repair ? '修繕記録編集' : '新規修繕記録'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 物件選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                物件 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.mansionId}
                  onChange={(e) => setFormData({ ...formData, mansionId: e.target.value, roomId: '' })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">物件を選択</option>
                  {availableMansions.map((mansion) => (
                    <option key={mansion.id} value={mansion.id}>
                      {mansion.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 修繕範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修繕範囲 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as 'room' | 'building', roomId: e.target.value === 'building' ? '' : formData.roomId })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="room">部屋個別</option>
                <option value="building">建物全体</option>
              </select>
            </div>

            {/* 部屋選択（部屋個別の場合のみ） */}
            {formData.scope === 'room' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部屋 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.scope === 'room'}
                    disabled={!formData.mansionId}
                  >
                    <option value="">部屋を選択</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber}号室 ({room.layout})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 修繕内容 */}
            <div className={formData.scope === 'building' ? 'md:col-span-1' : 'md:col-span-1'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修繕内容 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="修繕内容を入力"
                required
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="plumbing">配管・水道</option>
                <option value="electrical">電気工事</option>
                <option value="interior">内装工事</option>
                <option value="exterior">外装工事</option>
                <option value="equipment">設備</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>

            {/* 業者選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                担当業者
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.contractorId}
                  onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">業者を選択</option>
                  {mockContractors.filter(c => c.isActive).map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name} ({contractor.contactPerson})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 見積金額 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                見積金額
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="見積金額を入力"
                  min="0"
                />
              </div>
            </div>

            {/* 依頼日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                依頼日 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* 開始予定日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始予定日
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
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
              placeholder="修繕に関するメモや特記事項を入力"
            />
          </div>

          {/* 写真アップロード */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真添付
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    写真をアップロード
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG形式対応
                </p>
              </div>
            </div>
            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{photos.length}枚の写真が選択されています</p>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border">
                        {photo.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {repair ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairModal;