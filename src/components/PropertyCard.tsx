import React from 'react';
import { Building2, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { Mansion } from '../types';

interface PropertyCardProps {
  mansion: Mansion;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ mansion, onClick }) => {
  const occupancyColor = mansion.occupancyRate >= 90 ? 'text-green-600' : 
                        mansion.occupancyRate >= 70 ? 'text-yellow-600' : 'text-red-600';
  
  const occupancyBgColor = mansion.occupancyRate >= 90 ? 'bg-green-100' : 
                          mansion.occupancyRate >= 70 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
    >
      <div className="relative h-48">
        {mansion.photoPaths.length > 0 ? (
          <img
            src={mansion.photoPaths[0]}
            alt={mansion.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${occupancyBgColor} ${occupancyColor}`}>
          {mansion.occupancyRate}%
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{mansion.name}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{mansion.address}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">購入日: {mansion.purchaseDate}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">総部屋数: {mansion.totalRooms}室</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">入居率: </span>
            <span className={`text-sm font-medium ${occupancyColor}`}>
              {mansion.occupancyRate}%
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>写真: {mansion.photoPaths.length}枚</span>
            <span>書類: {mansion.deedPdfPath ? '有' : '無'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;