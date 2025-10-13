import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Building2, Home, Key, Shield } from 'lucide-react';
import { Resident } from '../types';
import { mockMansions, mockRooms, mockContracts } from '../data/mockData';
import { normalizeRoomNumber } from '../utils/textUtils';

interface ResidentModalProps {
  resident: Resident | null;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const ResidentModal: React.FC<ResidentModalProps> = ({ resident, onClose, userRole = 'admin' }) => {
  const [formData, setFormData] = useState({
    mansionId: '',
    roomId: resident?.roomId || '',
    name: resident?.name || '',
    phone: resident?.phone || '',
    email: resident?.email || '',
    moveInDate: resident?.moveInDate || '',
    emergencyContact: resident?.emergencyContact || '',
    userId: resident?.userId || '',
    password: resident?.password || '',
    isActive: resident?.isActive ?? true
  });

  // 管理会社の場合は担当物件のみ
  const availableMansions = userRole === 'manager' 
    ? mockMansions.filter(m => m.name === 'パークサイド麻布')
    : mockMansions;

  // 選択された物件の部屋一覧
  const availableRooms = mockRooms.filter(room => 
    room.mansionId === formData.mansionId && !room.isOccupied
  );

  // 既存住民の場合は現在の部屋も含める
  if (resident) {
    const currentRoom = mockRooms.find(r => r.id === resident.roomId);
    if (currentRoom && !availableRooms.find(r => r.id === currentRoom.id)) {
      availableRooms.push(currentRoom);
    }
  }

  // 初期表示時に住民の物件を設定
  React.useEffect(() => {
    if (resident) {
      const room = mockRooms.find(r => r.id === resident.roomId);
      if (room) {
        setFormData(prev => ({ ...prev, mansionId: room.mansionId }));
      }
    }
  }, [resident]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力値検証
    if (!formData.mansionId) {
      alert('❌ 物件を選択してください');
      return;
    }
    if (!formData.roomId) {
      alert('❌ 部屋を選択してください');
      return;
    }
    if (!formData.name.trim()) {
      alert('❌ 氏名を入力してください');
      return;
    }
    if (!formData.phone.trim()) {
      alert('❌ 電話番号を入力してください');
      return;
    }
    if (!formData.email.trim()) {
      alert('❌ メールアドレスを入力してください');
      return;
    }
    if (!formData.moveInDate) {
      alert('❌ 入居日を入力してください');
      return;
    }
    if (!formData.emergencyContact.trim()) {
      alert('❌ 緊急連絡先を入力してください');
      return;
    }

    if (!resident) {
      // 新規住民の場合、自動でユーザーIDとパスワードを生成
      const room = mockRooms.find(r => r.id === formData.roomId);
      const generatedUserId = formData.userId || generateUserId(formData.name, room?.roomNumber || '');
      const generatedPassword = formData.password || generatePassword();
      
      const newResident = {
        id: `resident_${Date.now()}`,
        ...formData,
        userId: generatedUserId,
        password: generatedPassword
      };
      
      console.log('Creating new resident:', newResident);
      // TODO: 実際のデータ追加処理をここに実装
      alert(`✅ 住民「${formData.name}」を正常に登録しました\n\nログイン情報:\nユーザーID: ${generatedUserId}\nパスワード: ${generatedPassword}`);
      
      // 契約管理に自動追加
      const newContract = {
        id: `contract_${Date.now()}`,
        residentId: newResident.id,
        startDate: formData.moveInDate,
        endDate: calculateEndDate(formData.moveInDate),
        rent: room?.monthlyRent || 0,
        maintenanceFee: room?.maintenanceFee || 0,
        deposit: 0,
        keyMoney: 0,
        guarantor: '',
        status: 'pending' as const,
        contractSteps: [],
        applicationDate: new Date().toISOString().split('T')[0]
      };
      
      console.log('Creating new contract:', newContract);
      // TODO: 実際の契約データ追加処理をここに実装
    } else {
      // 既存住民の更新
      const updatedResident = {
        ...resident,
        ...formData
      };
      console.log('Updating resident:', updatedResident);
      // TODO: 実際のデータ更新処理をここに実装
      alert(`✅ 住民「${formData.name}」を正常に更新しました`);
    }
    
    onClose();
  };

  const generateUserId = (name: string, roomNumber: string) => {
    const nameKana = normalizeRoomNumber(name.split(' ')[0].toLowerCase());
    const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
    return `${nameKana}${normalizedRoomNumber}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const calculateEndDate = (startDate: string) => {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 2); // 2年契約
    return start.toISOString().split('T')[0];
  };

  const getMansionName = (mansionId: string) => {
    const mansion = mockMansions.find(m => m.id === mansionId);
    return mansion?.name || '';
  };

  const getRoomInfo = (roomId: string) => {
    const room = mockRooms.find(r => r.id === roomId);
    return room ? `${room.roomNumber}号室 (${room.layout}, ¥${room.monthlyRent.toLocaleString()})` : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {resident ? '住人情報編集' : '新規住人登録'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 物件・部屋選択 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  disabled={!!resident} // 既存住民の場合は変更不可
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
                  required
                  disabled={!formData.mansionId || !!resident} // 物件未選択または既存住民の場合は無効
                >
                  <option value="">部屋を選択</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber}号室 ({room.layout}, ¥{room.monthlyRent.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              {formData.mansionId && availableRooms.length === 0 && !resident && (
                <p className="text-sm text-red-600 mt-1">選択した物件に空室がありません</p>
              )}
            </div>
          </div>

          {/* 選択中の物件・部屋情報表示 */}
          {formData.mansionId && formData.roomId && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">選択中の物件・部屋</h4>
              <p className="text-blue-800">
                <strong>{getMansionName(formData.mansionId)}</strong> - {getRoomInfo(formData.roomId)}
              </p>
            </div>
          )}

          {/* 住人基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                氏名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="氏名を入力"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="電話番号を入力"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="メールアドレスを入力"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                入居日 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 緊急連絡先 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              緊急連絡先 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="緊急連絡先（氏名と電話番号）を入力"
              required
            />
          </div>

          {/* ログイン情報 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>住民ポータルログイン情報</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザーID
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="自動生成されます"
                />
                <p className="text-xs text-gray-500 mt-1">
                  空欄の場合、氏名と部屋番号から自動生成されます
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="自動生成されます"
                />
                <p className="text-xs text-gray-500 mt-1">
                  空欄の場合、ランダムなパスワードが自動生成されます
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>ログインを有効にする</span>
                </span>
              </label>
            </div>
          </div>

          {/* 新規住民の場合の注意事項 */}
          {!resident && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">新規住民登録について</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 住民登録と同時に契約管理にも自動で追加されます</li>
                <li>• 契約期間は入居日から2年間で設定されます</li>
                <li>• 契約の詳細は契約管理画面で編集できます</li>
                <li>• ログイン情報は住民に別途お知らせください</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-4">
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
              disabled={!formData.mansionId || !formData.roomId || !formData.name}
            >
              {resident ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentModal;