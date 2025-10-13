import React, { useState } from 'react';
import { Search, Filter, Building2, Home, Users, Calendar, Pen as Yen, Camera, Edit, Plus, Trash2 } from 'lucide-react';
import { mockRooms, mockMansions, mockResidents } from '../data/mockData';
import { roomService } from '../services/database';
import { Room } from '../types';
import RoomModal from './RoomModal';
import { normalizeRoomNumber } from '../utils/textUtils';

interface RoomManagementProps {
  userRole?: 'admin' | 'manager';
}

const RoomManagement: React.FC<RoomManagementProps> = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMansion, setSelectedMansion] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant'>('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // 検索語の全角→半角変換
  const handleSearchChange = (value: string) => {
    const normalized = normalizeRoomNumber(value);
    setSearchTerm(normalized);
  };

  // 管理会社の場合は担当物件のみ表示
  const availableMansions = userRole === 'manager' 
    ? mockMansions.filter(m => m.name === 'グランドパレス六本木')
    : mockMansions;

  // 初期選択（最初の物件を自動選択）
  React.useEffect(() => {
    if (availableMansions.length > 0 && !selectedMansion) {
      setSelectedMansion(availableMansions[0].id);
    }
  }, [availableMansions, selectedMansion]);

  // 選択された物件の部屋データを取得
  React.useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedMansion) return;
      
      setLoading(true);
      try {
        const data = await roomService.getByMansionId(selectedMansion);
        // データベースの形式をRoom型に変換
        const convertedRooms: Room[] = data.map(room => ({
          id: room.id,
          mansionId: room.mansion_id,
          roomNumber: room.room_number,
          layout: room.layout,
          size: room.size,
          floor: room.floor,
          photoPaths: room.photo_paths || [],
          conditionNotes: room.condition_notes || '',
          isOccupied: room.is_occupied || false,
          monthlyRent: room.monthly_rent,
          maintenanceFee: room.maintenance_fee || 0,
          parkingFee: room.parking_fee || 0,
          bicycleParkingFee: room.bicycle_parking_fee || 0
        }));
        setRooms(convertedRooms);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedMansion]);
  const selectedMansionData = mockMansions.find(m => m.id === selectedMansion);

  // 選択された物件の部屋一覧を生成（総部屋数に基づく）
  const generateRoomList = () => {
    if (!selectedMansionData) return [];
    
    const roomList: (Room | null)[] = [];
    
    // 総部屋数分のスロットを作成
    for (let i = 1; i <= selectedMansionData.totalRooms; i++) {
      const roomNumber = i.toString().padStart(3, '0'); // 001, 002, 003...
      const existingRoom = rooms.find(r => 
        r && r.mansionId === selectedMansion && r.roomNumber === roomNumber
      );
      
      roomList.push(existingRoom || null);
    }
    
    return roomList;
  };

  const roomList = generateRoomList();

  // 検索とフィルタリング
  const filteredRoomList = roomList.map((room, index) => ({
    room,
    originalIndex: index,
    displayRoomNumber: (index + 1).toString().padStart(3, '0')
  })).filter(({ room, displayRoomNumber }) => {
    // 実際の部屋番号または表示用部屋番号で検索
    const actualRoomNumber = room?.roomNumber || displayRoomNumber;
    
    const matchesSearch = !searchTerm || 
      actualRoomNumber.includes(searchTerm) ||
      displayRoomNumber.includes(searchTerm) ||
      (room && (
        room.layout.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.conditionNotes.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'occupied' && room?.isOccupied) ||
      (filterStatus === 'vacant' && (!room || !room.isOccupied));
    
    return matchesSearch && matchesFilter;
  });

  const handleRoomClick = (room: Room | null, roomIndex: number) => {
    if (room) {
      setSelectedRoom(room);
    } else {
      // 新規部屋作成
      const roomNumber = (roomIndex + 1).toString().padStart(3, '0');
      const newRoom: Partial<Room> = {
        mansionId: selectedMansion,
        roomNumber: roomNumber,
        layout: '1R',
        size: 20,
        floor: Math.ceil((roomIndex + 1) / 10), // 10部屋ごとに階数を上げる
        photoPaths: [],
        conditionNotes: '',
        isOccupied: false,
        monthlyRent: 50000,
        maintenanceFee: 5000
      };
      setSelectedRoom(newRoom as Room);
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // モーダルが閉じられた時にデータを再取得
    const fetchRooms = async () => {
      if (!selectedMansion) return;
      
      try {
        const data = await roomService.getByMansionId(selectedMansion);
        const convertedRooms: Room[] = data.map(room => ({
          id: room.id,
          mansionId: room.mansion_id,
          roomNumber: room.room_number,
          layout: room.layout,
          size: room.size,
          floor: room.floor,
          photoPaths: room.photo_paths || [],
          conditionNotes: room.condition_notes || '',
          isOccupied: room.is_occupied || false,
          monthlyRent: room.monthly_rent,
          maintenanceFee: room.maintenance_fee || 0,
          parkingFee: room.parking_fee || 0,
          bicycleParkingFee: room.bicycle_parking_fee || 0
        }));
        setRooms(convertedRooms);
      } catch (error) {
        console.error('Failed to refresh rooms:', error);
      }
    };
    fetchRooms();
  };

  const getRoomResident = (room: Room | null) => {
    if (!room) return null;
    return mockResidents.find(r => r.roomId === room.id);
  };

  const getRoomStatusColor = (room: Room | null) => {
    if (!room) return 'bg-gray-100 border-gray-300 text-gray-500';
    if (room.isOccupied) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const getRoomStatusText = (room: Room | null) => {
    if (!room) return '未設定';
    if (room.isOccupied) return '入居中';
    return '空室';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">部屋管理</h2>
            <p className="text-gray-600">部屋のプロパティ設定と状態を管理します</p>
          </div>
        </div>

        {/* 物件選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            管理物件を選択
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedMansion}
              onChange={(e) => setSelectedMansion(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableMansions.map((mansion) => (
                <option key={mansion.id} value={mansion.id}>
                  {mansion.name} （総部屋数: {mansion.totalRooms}室）
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="部屋番号、間取り、メモで検索..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              全角文字は自動的に半角に変換されます
            </p>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'occupied' | 'vacant')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="occupied">入居中</option>
            <option value="vacant">空室</option>
            <option value="vacant">未設定</option>
          </select>
        </div>

        {/* 物件情報サマリー */}
        {selectedMansionData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">{selectedMansionData.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">総部屋数:</span>
                <span className="font-medium text-blue-900 ml-1">{selectedMansionData.totalRooms}室</span>
              </div>
              <div>
                <span className="text-blue-700">設定済み:</span>
                <span className="font-medium text-blue-900 ml-1">
                  {rooms.length}室
                </span>
              </div>
              <div>
                <span className="text-blue-700">入居中:</span>
                <span className="font-medium text-blue-900 ml-1">
                  {rooms.filter(r => r.isOccupied).length}室
                </span>
              </div>
              <div>
                <span className="text-blue-700">入居率:</span>
                <span className="font-medium text-blue-900 ml-1">{selectedMansionData.occupancyRate}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 部屋一覧グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredRoomList.map(({ room, originalIndex, displayRoomNumber }) => {
          // 実際の部屋番号を優先、なければ表示用番号を使用
          const roomNumber = room?.roomNumber || displayRoomNumber;
          const resident = getRoomResident(room);
          
          return (
            <div
              key={`room-${roomNumber}`}
              onClick={() => handleRoomClick(room, originalIndex)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getRoomStatusColor(room)}`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Home className="h-5 w-5 mr-1" />
                  <span className="font-bold text-lg">{roomNumber}</span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="font-medium">
                    {getRoomStatusText(room)}
                  </div>
                  
                  {room && (
                    <>
                      <div className="text-gray-600">
                        {room.layout} • {room.size}㎡
                      </div>
                      <div className="text-gray-600">
                        {room.floor}階
                      </div>
                      <div className="font-medium">
                        ¥{room.monthlyRent.toLocaleString()}
                      </div>
                      {resident && (
                        <div className="text-green-700 font-medium">
                          {resident.name}
                        </div>
                      )}
                      {room.photoPaths.length > 0 && (
                        <div className="flex items-center justify-center text-gray-500">
                          <Camera className="h-3 w-3 mr-1" />
                          <span>{room.photoPaths.length}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {!room && (
                    <div className="text-gray-500">
                      クリックして設定
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoomList.length === 0 && (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する部屋が見つかりません</p>
        </div>
      )}

      {/* 部屋設定モーダル */}
      {showModal && (
        <RoomModal
          room={selectedRoom}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default RoomManagement;