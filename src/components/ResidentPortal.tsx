import React, { useState } from 'react';
import { MessageSquare, Camera, Send, AlertTriangle, CheckCircle, Clock, User, Home, LogOut, X } from 'lucide-react';

interface ResidentPortalProps {
  onLogout: () => void;
}

const ResidentPortal: React.FC<ResidentPortalProps> = ({ onLogout }) => {
  const [requestType, setRequestType] = useState<'repair' | 'complaint' | 'suggestion' | 'inquiry'>('repair');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [photos, setPhotos] = useState<File[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting request:', {
      type: requestType,
      title,
      description,
      priority,
      photos
    });
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setPhotos([]);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3); // 最大3枚まで
      setPhotos(selectedFiles);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'repair':
        return '修繕依頼';
      case 'complaint':
        return '苦情・相談';
      case 'suggestion':
        return '提案・要望';
      case 'inquiry':
        return '問い合わせ';
      default:
        return '不明';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '緊急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '不明';
    }
  };

  // Mock data for current resident
  const currentResident = {
    name: '康井 宏益',
    roomNumber: '101',
    mansionName: 'パークサイド麻布'
  };

  // Mock data for resident's requests
  const myRequests = [
    {
      id: '1',
      type: 'repair',
      title: 'エアコンの効きが悪い',
      status: 'in-progress',
      submittedDate: '2024-12-01',
      response: '修理業者に連絡済みです。12月15日に訪問予定です。'
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'エントランスの照明改善',
      status: 'submitted',
      submittedDate: '2024-12-05'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">住民ポータル</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{currentResident.name}様</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Home className="h-4 w-4" />
                    <span>{currentResident.mansionName} {currentResident.roomNumber}号室</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>要望を送信しました</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">新しい要望・依頼</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  種別
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="repair">修繕依頼</option>
                  <option value="complaint">苦情・相談</option>
                  <option value="suggestion">提案・要望</option>
                  <option value="inquiry">問い合わせ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="要望のタイトルを入力してください"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細説明
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="詳細な内容を記入してください"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  優先度
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写真添付（最大3枚）
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
                      JPG, PNG形式対応（最大3枚まで）
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

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <Send className="h-5 w-5" />
                <span>送信</span>
              </button>
            </form>
          </div>

          {/* My Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">私の要望・依頼履歴</h3>
            
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">{getTypeText(request.type)}</p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'submitted' ? 'bg-gray-100 text-gray-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status === 'in-progress' ? <Clock className="h-3 w-3" /> :
                       request.status === 'submitted' ? <MessageSquare className="h-3 w-3" /> :
                       <CheckCircle className="h-3 w-3" />}
                      <span>
                        {request.status === 'in-progress' ? '対応中' :
                         request.status === 'submitted' ? '受付済' : '完了'}
                      </span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">提出日: {request.submittedDate}</p>
                  
                  {request.response && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>管理会社からの回答:</strong><br />
                        {request.response}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {myRequests.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">まだ要望・依頼はありません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentPortal;