import React, { useState } from 'react';
import { X, HardHat, User, Phone, Mail, MapPin, Star, Pen as Yen, FileText } from 'lucide-react';
import { Contractor } from '../types';
import { contractorService } from '../services/database';

interface ContractorModalProps {
  contractor: Contractor | null;
  onClose: () => void;
}

const ContractorModal: React.FC<ContractorModalProps> = ({ contractor, onClose }) => {
  const [formData, setFormData] = useState({
    name: contractor?.name || '',
    contactPerson: contractor?.contactPerson || '',
    phone: contractor?.phone || '',
    email: contractor?.email || '',
    address: contractor?.address || '',
    specialties: contractor?.specialties || [],
    hourlyRate: contractor?.hourlyRate || 0,
    rating: contractor?.rating || 3,
    isActive: contractor?.isActive ?? true,
    notes: contractor?.notes || ''
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    contractor?.specialties || []
  );

  const availableSpecialties = [
    { value: 'plumbing', label: '配管・水道' },
    { value: 'electrical', label: '電気工事' },
    { value: 'interior', label: '内装工事' },
    { value: 'exterior', label: '外装工事' },
    { value: 'cleaning', label: '清掃' },
    { value: 'security', label: 'セキュリティ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    try {
        // 入力値検証
        if (!formData.name.trim()) {
          alert('❌ 業者名を入力してください');
          return;
        }
        if (!formData.contactPerson.trim()) {
          alert('❌ 担当者名を入力してください');
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
        if (!formData.address.trim()) {
          alert('❌ 住所を入力してください');
          return;
        }
        if (selectedSpecialties.length === 0) {
          alert('❌ 少なくとも1つの専門分野を選択してください');
          return;
        }
        if (contractor) {
          // 既存業者の更新
          await contractorService.update(contractor.id, {
            name: formData.name,
            contact_person: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            specialties: selectedSpecialties,
            hourly_rate: formData.hourlyRate,
            rating: formData.rating,
            is_active: formData.isActive,
            notes: formData.notes
          });
          console.log(`✅ 業者「${formData.name}」を正常に更新しました`);
          alert(`✅ 業者「${formData.name}」を正常に更新しました`);
        } else {
          // 新規業者の追加
          await contractorService.create({
            name: formData.name,
            contact_person: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            specialties: selectedSpecialties,
            hourly_rate: formData.hourlyRate,
            rating: formData.rating,
            is_active: formData.isActive,
            notes: formData.notes
          });
          console.log(`✅ 業者「${formData.name}」を正常に追加しました`);
          alert(`✅ 業者「${formData.name}」を正常に追加しました`);
        }
        onClose();
    } catch (error) {
      console.error('Error saving contractor:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined,
        formData,
        selectedSpecialties
      });
      if (contractor) {
        alert(`❌ 業者の更新に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
      } else {
        alert(`❌ 業者の追加に失敗しました。\n\n詳細: ${error instanceof Error ? error.message : '不明なエラー'}\n\n入力内容を確認してもう一度お試しください。`);
      }
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const getSpecialtyLabel = (value: string) => {
    const specialty = availableSpecialties.find(s => s.value === value);
    return specialty ? specialty.label : value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {contractor ? '業者情報編集' : '新規業者追加'}
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
            {/* 業者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業者名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HardHat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="業者名を入力"
                  required
                />
              </div>
            </div>

            {/* 担当者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="担当者名を入力"
                  required
                />
              </div>
            </div>

            {/* 電話番号 */}
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

            {/* メールアドレス */}
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

            {/* 住所 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住所 <span className="text-red-500">*</span>
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

            {/* 時間単価 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                時間単価
              </label>
              <div className="relative">
                <Yen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="時間単価を入力"
                  min="0"
                />
              </div>
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1つ星</option>
                  <option value={2}>2つ星</option>
                  <option value={3}>3つ星</option>
                  <option value={4}>4つ星</option>
                  <option value={5}>5つ星</option>
                </select>
              </div>
            </div>
          </div>

          {/* 専門分野 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              専門分野 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSpecialties.map((specialty) => (
                <label
                  key={specialty.value}
                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(specialty.value)}
                    onChange={() => toggleSpecialty(specialty.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{specialty.label}</span>
                </label>
              ))}
            </div>
            {selectedSpecialties.length === 0 && (
              <p className="text-sm text-red-600 mt-1">少なくとも1つの専門分野を選択してください</p>
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
              placeholder="業者に関するメモや特記事項を入力"
            />
          </div>

          {/* 有効/無効 */}
          <div className="mt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">この業者を有効にする</span>
            </label>
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
              disabled={selectedSpecialties.length === 0}
            >
              {contractor ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractorModal;