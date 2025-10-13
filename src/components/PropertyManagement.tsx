import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { mansionService } from '../services/database';
import { mockMansions } from '../data/mockData';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import { Mansion } from '../types';

interface PropertyManagementProps {
  userRole?: 'admin' | 'manager';
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Mansion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mansions, setMansions] = useState<Mansion[]>([]);
  const [loading, setLoading] = useState(true);

  // データベースから物件データを取得
  useEffect(() => {
    const fetchMansions = async () => {
      try {
        // Supabase設定チェック
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const isPlaceholderUrl = !supabaseUrl || 
          supabaseUrl.includes('your-project-id') || 
          supabaseUrl === 'https://your-project-id.supabase.co';
        
        const isPlaceholderKey = !supabaseKey || 
          supabaseKey.includes('your-anon-key') || 
          supabaseKey === 'your-anon-key-here';

        if (!supabaseUrl || !supabaseKey || isPlaceholderUrl || isPlaceholderKey) {
          console.warn('⚠️ Supabase設定が未完了です。モックデータを使用します。');
          console.warn('設定画面でSupabase URLとAnon Keyを設定してください。');
          setMansions(mockMansions);
          return;
        }

        // Supabaseからデータ取得
        const data = await mansionService.getAll();
        const convertedMansions: Mansion[] = data.map(mansion => ({
          id: mansion.id,
          name: mansion.name,
          address: mansion.address,
          purchaseDate: mansion.purchase_date,
          photoPaths: mansion.photo_paths || [],
          deedPdfPath: mansion.deed_pdf_path,
          totalRooms: mansion.total_rooms,
          occupancyRate: mansion.occupancy_rate
        }));
        setMansions(convertedMansions);
      } catch (error) {
        console.warn('Supabase接続に失敗しました。モックデータを使用します。', error);
        setMansions(mockMansions);
      } finally {
        setLoading(false);
      }
    };

    fetchMansions();
  }, []);

  const filteredMansions = mansions.filter(mansion =>
    mansion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mansion.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePropertyClick = (mansion: Mansion) => {
    setSelectedProperty(mansion);
    setShowModal(true);
  };

  const handleAddProperty = () => {
    if (userRole !== 'admin') return; // 管理会社は追加不可
    setSelectedProperty(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // モーダルが閉じられた時にデータを再取得
    const fetchMansions = async () => {
      try {
        const data = await mansionService.getAll();
        const convertedMansions: Mansion[] = data.map(mansion => ({
          id: mansion.id,
          name: mansion.name,
          address: mansion.address,
          purchaseDate: mansion.purchase_date,
          photoPaths: mansion.photo_paths || [],
          deedPdfPath: mansion.deed_pdf_path,
          totalRooms: mansion.total_rooms,
          occupancyRate: mansion.occupancy_rate
        }));
        setMansions(convertedMansions);
      } catch (error) {
        console.error('Failed to refresh mansions:', error);
      }
    };
    fetchMansions();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">物件管理</h2>
            <p className="text-gray-600">マンションの情報を管理します</p>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={handleAddProperty}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>新規物件追加</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="物件名または住所で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>フィルター</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMansions.map((mansion) => (
          <PropertyCard
            key={mansion.id}
            mansion={mansion}
            onClick={() => handlePropertyClick(mansion)}
          />
        ))}
      </div>

      {filteredMansions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">該当する物件が見つかりません</p>
        </div>
      )}

      {showModal && (
        <PropertyModal
          property={selectedProperty}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default PropertyManagement;