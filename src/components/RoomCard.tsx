import React from 'react';
import { Home, User, Calendar, Pen as Yen, Camera } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="relative h-24">
        {room.photoPaths.length > 0 ? (
          <img
            src={room.photoPaths[0]}
            alt={`部屋 ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
          room.isOccupied ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {room.isOccupied ? '入居中' : '空室'}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
          <span className="text-sm font-bold text-gray-900">¥{room.monthlyRent.toLocaleString()}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-gray-600">
            <Home className="h-3 w-3" />
            <span className="text-xs">{room.layout} • {room.size}㎡</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-xs">階数: {room.floor}階</span>
          </div>
          
          {room.photoPaths.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Camera className="h-3 w-3" />
              <span className="text-xs">写真: {room.photoPaths.length}枚</span>
            </div>
          )}
        </div>
        
        {room.conditionNotes && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 line-clamp-2">{room.conditionNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;