import React, { useState } from 'react';
import { X, Upload, FileText, Home, Image, Pen as Yen } from 'lucide-react';
import { Room } from '../types';
import { mockMansions } from '../data/mockData';
import { roomService, mansionService } from '../services/database';
import { normalizeRoomNumber, formatRoomNumber } from '../utils/textUtils';

interface RoomModalProps {
  room: Room | null;
  onClose: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose }) => {
  const [formData, setFormData] = useState({
    mansionId: room?.mansionId || '',
    roomNumber: room?.roomNumber || '',
    layout: room?.layout || '',
    size: room?.size || 0,
    floor: room?.floor || 1,
    monthlyRent: room?.monthlyRent || 0,
    maintenanceFee: room?.maintenanceFee || 0,
    parkingFee: room?.parkingFee || 0,
    conditionNotes: room?.conditionNotes || '',
    isOccupied: room?.isOccupied || false,
  });

  // 部屋番号の変更時に全角→半角変換を適用
  const handleRoomNumberChange = (value: string) => {
    const normalized = normalizeRoomNumber(value);
    setFormData({ ...formData, roomNumber: normalized });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    try {
        // 部屋番号を最終的にフォーマット（3桁ゼロパディング）
        const finalRoomNumber = formatRoomNumber(formData.roomNumber);
        
        // 入力値検証
        if (!formData.mansionId) {
          alert('❌ 物件を選択してください');
          return;
        }
        if (!finalRoomNumber) {
          alert('❌ 部屋番号を入力してください');
          return;
        }
        if (!formData.layout) {
          alert('❌ 間取りを選択してください');
          return;
        }
        if (formData.size <= 0) {
          alert('❌ 面積は0より大きい値を入力してください');
          return;
        }
        
        const roomData = {
          mansionId: formData.mansionId,
          roomNumber: finalRoomNumber,
          layout: formData.layout,
          size: formData.size,
          floor: formData.floor,
          monthlyRent: formData.monthlyRent,
          maintenanceFee: formData.maintenanceFee || 0,
          parkingFee: formData.parkingFee || 0,
          conditionNotes: formData.conditionNotes || '',
          isOccupied: formData.isOccupied,
          photoPaths: []
        };
        
        if (room?.id) {
          // 既存部屋の更新
          await roomService.update(room.id, roomData);
          console.log(`✅ 部屋「${finalRoomNumber}」を正常に更新しました`);
          alert(`✅ 部屋「${finalRoomNumber}」を正常に更新しました`);
        } else {
          // 新規部屋の追加
          await roomService.create(roomData);
          console.log(`✅ 部屋「${finalRoomNumber}」を正常に追加しました`);
          alert(`✅ 部屋「${finalRoomNumber}」を正常に追加しました`);
        }
        onClose();
    } catch (error) {
      console.error('Room save error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined,
        formData,
        roomId: room?.id
      });
      if (room?.id) {
        alert(`❌ 部屋の更新に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
      } else {
        alert(`❌ 部屋の追加に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}\n\n入力内容を確認してもう一度お試しください。`);
      }
    }
  };

  const handleDelete = async () => {
    if (!room?.id) return;
    
    if (window.confirm(`部屋「${room.roomNumber}」を削除しますか？\n\n※ 関連する住民や修繕記録がある場合は削除できません。`)) {
      try {
        await roomService.delete(room.id);
        alert(`✅ 部屋「${room.roomNumber}」を削除しました`);
        onClose();
      } catch (error) {
        console.error('Room delete error:', error);
        if (room?.id) {
          alert(`❌ 部屋の削除に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      }
    }
  };

  const handleFileUpload = (type: 'image' | 'pdf') => {
    console.log('File upload type:', type);
    // TODO: ファイルアップロード処理を実装
    alert(`${type === 'image' ? '画像' : 'PDF'}のアップロード機能は開発中です`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {room ? '部屋情報編集' : '新規部屋追加'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                物件
              </label>
              <select
                value={formData.mansionId}
                onChange={(e) => setFormData({ ...formData, mansionId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">物件を選択</option>
                {mockMansions.map((mansion) => (
                  <option key={mansion.id} value={mansion.id}>
                    {mansion.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部屋番号
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleRoomNumberChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="部屋番号を入力（例: １０１ → 101）"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                全角文字は自動的に半角に変換されます（例: １０１ → 101）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                間取り
              </label>
              <select
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">間取りを選択</option>
                <option value="1R">1R</option>
                <option value="1K">1K</option>
                <option value="1DK">1DK</option>
                <option value="1LDK">1LDK</option>
                <option value="2K">2K</option>
                <option value="2DK">2DK</option>
                <option value="2LDK">2LDK</option>
                <option value="3K">3K</option>
                <option value="3DK">3DK</option>
                <option value="3LDK">3LDK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                面積（㎡）
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="面積を入力"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                階数
              </label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="階数を入力"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月額家賃
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="月額家賃を入力"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状態メモ
            </label>
            <textarea
              value={formData.conditionNotes}
              onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="部屋の状態や特記事項を入力"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isOccupied}
                onChange={(e) => setFormData({ ...formData, isOccupied: e.target.checked })}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">入居中</span>
            </label>
            
            {room && (
              <div className="mt-4 space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">部屋管理</h4>
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                    >
                      住民履歴を表示
                    </button>
                    <button
                      type="button"
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      修繕履歴を表示
                    </button>
                    <button
                      type="button"
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                      onClick={handleDelete}
                    >
                      部屋を削除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              部屋写真
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
            {room?.photoPaths && room.photoPaths.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {room.photoPaths.map((path, index) => (
                  <img
                    key={index}
                    src={path}
                    alt={`部屋写真 ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ))}
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
              {room ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;