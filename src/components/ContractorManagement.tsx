import React, { useState } from 'react';
import { Plus, Search, HardHat, Phone, Mail, Star, Calendar, MapPin, Edit, Trash2, Users, Key, Eye, EyeOff, Save, X, Shield } from 'lucide-react';
import { mockContractors } from '../data/mockData';
import { Contractor } from '../types';
import ContractorModal from './ContractorModal';

const ContractorManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'cleaning' | 'security'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'managers'>('info');
  const [editingManager, setEditingManager] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    username: string;
    password: string;
    isActive: boolean;
  }>({ username: '', password: '', isActive: true });
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  // Mock data for contractor managers
  const mockContractorManagers = [
    {
      id: '1',
      contractorId: '1',
      name: '田中 修理工',
      username: 'tanaka_repair',
      password: 'repair123',
      isActive: true
    },
    {
      id: '2',
      contractorId: '2',
      name: '佐藤 太郎',
      username: 'sato_plumbing',
      password: 'plumb456',
      isActive: true
    }
  ];

  const filteredContractors = mockContractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || contractor.specialties.includes(filterCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleAddContractor = () => {
    setSelectedContractor(null);
    setShowModal(true);
    setActiveTab('info');
  };

  const handleEditContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setShowModal(true);
    setActiveTab('info');
  };

  const handleEditManager = (managerId: string) => {
    const manager = mockContractorManagers.find(m => m.id === managerId);
    if (manager) {
      setEditingManager(managerId);
      setEditForm({
        username: manager.username,
        password: manager.password,
        isActive: manager.isActive
      });
    }
  };

  const handleSaveManager = (managerId: string) => {
    console.log('Saving manager credentials:', managerId, editForm);
    setEditingManager(null);
  };

  const handleCancelManager = () => {
    setEditingManager(null);
    setEditForm({ username: '', password: '', isActive: true });
  };

  const generateUsername = (contractorName: string) => {
    return contractorName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_mgr';
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const togglePasswordVisibility = (managerId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [managerId]: !prev[managerId]
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plumbing':
        return 'bg-blue-100 text-blue-800';
      case 'electrical':
        return 'bg-yellow-100 text-yellow-800';
      case 'interior':
        return 'bg-green-100 text-green-800';
      case 'exterior':
        return 'bg-purple-100 text-purple-800';
      case 'cleaning':
        return 'bg-pink-100 text-pink-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'plumbing':
        return '配管・水道';
      case 'electrical':
        return '電気工事';
      case 'interior':
        return '内装工事';
      case 'exterior':
        return '外装工事';
      case 'cleaning':
        return '清掃';
      case 'security':
        return 'セキュリティ';
      default:
        return category;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">業者管理</h2>
            <p className="text-gray-600">修繕・メンテナンス業者と管理会社ログインを管理します</p>
          </div>
          <button
            onClick={handleAddContractor}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>新規業者追加</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="業者名、担当者名、専門分野で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての分野</option>
            <option value="plumbing">配管・水道</option>
            <option value="electrical">電気工事</option>
            <option value="interior">内装工事</option>
            <option value="exterior">外装工事</option>
            <option value="cleaning">清掃</option>
            <option value="security">セキュリティ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContractors.map((contractor) => {
          const contractorManagers = mockContractorManagers.filter(m => m.contractorId === contractor.id);
          
          return (
            <div key={contractor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <HardHat className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contractor.name}</h3>
                      <p className="text-sm text-gray-600">{contractor.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(contractor.rating)}
                    <span className="text-sm text-gray-600 ml-1">({contractor.rating})</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{contractor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{contractor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{contractor.address}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">専門分野</p>
                  <div className="flex flex-wrap gap-2">
                    {contractor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(specialty)}`}
                      >
                        {getCategoryText(specialty)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">料金目安</p>
                  <p className="text-lg font-bold text-green-600">¥{contractor.hourlyRate.toLocaleString()}/時間</p>
                </div>

                {contractor.lastWorkDate && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">最終作業: {contractor.lastWorkDate}</span>
                    </div>
                  </div>
                )}

                {/* Manager Login Info */}
                {contractorManagers.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">管理会社ログイン</span>
                    </div>
                    {contractorManagers.map((manager) => {
                      const isEditing = editingManager === manager.id;
                      
                      return (
                        <div key={manager.id} className="space-y-2">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="ユーザー名"
                              />
                              <div className="relative">
                                <input
                                  type={showPassword[manager.id] ? 'text' : 'password'}
                                  value={editForm.password}
                                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                  className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                  placeholder="パスワード"
                                />
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(manager.id)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                  {showPassword[manager.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-1">
                                  <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    className="h-3 w-3 text-blue-600"
                                  />
                                  <span className="text-xs text-gray-700">有効</span>
                                </label>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleSaveManager(manager.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={handleCancelManager}
                                    className="text-gray-600 hover:text-gray-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="text-xs">
                                <p className="font-medium text-gray-900">{manager.username}</p>
                                <p className="text-gray-600">
                                  {showPassword[manager.id] ? manager.password : '••••••••'}
                                </p>
                                <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs ${
                                  manager.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  <Shield className="h-2 w-2 mr-1" />
                                  {manager.isActive ? '有効' : '無効'}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => togglePasswordVisibility(manager.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword[manager.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => handleEditManager(manager.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    contractor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {contractor.isActive ? '利用可能' : '利用停止'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditContractor(contractor)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>編集</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-12">
          <HardHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する業者が見つかりません</p>
        </div>
      )}

      {/* Contractor Modal */}
      {showModal && (
        <ContractorModal
          contractor={selectedContractor}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ContractorManagement;