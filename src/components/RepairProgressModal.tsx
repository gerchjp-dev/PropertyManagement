import React, { useState } from 'react';
import { X, Plus, Camera, Calendar, User, CheckCircle, Clock, AlertTriangle, Edit, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { RepairRecord, RepairProgressStep } from '../types';

interface RepairProgressModalProps {
  repair: RepairRecord;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const RepairProgressModal: React.FC<RepairProgressModalProps> = ({ repair, onClose, userRole = 'admin' }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'photos' | 'reports'>('progress');
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState<Partial<RepairProgressStep>>({
    title: '',
    description: '',
    status: 'pending',
    photoPaths: [],
    notes: ''
  });
  const [stepPhotos, setStepPhotos] = useState<File[]>([]);
  const [expandedPhotos, setExpandedPhotos] = useState<{ [key: string]: boolean }>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in-progress':
        return '作業中';
      case 'pending':
        return '未開始';
      default:
        return '不明';
    }
  };

  const handleAddStep = () => {
    const step: RepairProgressStep = {
      id: `${repair.id}-${Date.now()}`,
      stepNumber: repair.progressSteps.length + 1,
      title: newStep.title || '',
      description: newStep.description || '',
      status: newStep.status || 'pending',
      photoPaths: [],
      notes: newStep.notes,
      reportedBy: userRole === 'manager' ? '管理会社' : '管理者',
      reportedDate: new Date().toISOString().split('T')[0]
    };

    console.log('Adding new step:', step, stepPhotos);
    
    // Reset form
    setNewStep({
      title: '',
      description: '',
      status: 'pending',
      photoPaths: [],
      notes: ''
    });
    setStepPhotos([]);
    setShowAddStep(false);
  };

  const handleStepPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setStepPhotos(selectedFiles);
    }
  };

  const removeStepPhoto = (index: number) => {
    setStepPhotos(stepPhotos.filter((_, i) => i !== index));
  };

  const togglePhotoExpansion = (stepId: string) => {
    setExpandedPhotos(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'in-progress' | 'completed') => {
    console.log('Updating step status:', stepId, status);
  };

  const getAllPhotos = () => {
    const allPhotos: string[] = [...repair.photoPaths];
    repair.progressSteps.forEach(step => {
      allPhotos.push(...step.photoPaths);
    });
    return allPhotos;
  };

  const getProgressPercentage = () => {
    if (repair.progressSteps.length === 0) return 0;
    const completedSteps = repair.progressSteps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / repair.progressSteps.length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{repair.description}</h3>
            <p className="text-gray-600 mt-1">修繕進捗管理</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">全体進捗</p>
              <p className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">総ステップ数</p>
              <p className="text-2xl font-bold text-gray-900">{repair.progressSteps.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">完了ステップ</p>
              <p className="text-2xl font-bold text-green-600">
                {repair.progressSteps.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">作業中</p>
              <p className="text-2xl font-bold text-blue-600">
                {repair.progressSteps.filter(s => s.status === 'in-progress').length}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">進捗状況</span>
              <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              進捗管理
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'photos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              写真一覧 ({getAllPhotos().length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              報告書
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Add Step Button */}
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">作業ステップ</h4>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>ステップ追加</span>
                </button>
              </div>

              {/* Add Step Form */}
              {showAddStep && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">新しいステップを追加</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ステップタイトル <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStep.title}
                        onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ステップのタイトルを入力"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        状態
                      </label>
                      <select
                        value={newStep.status}
                        onChange={(e) => setNewStep({ ...newStep, status: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">未開始</option>
                        <option value="in-progress">作業中</option>
                        <option value="completed">完了</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      詳細説明
                    </label>
                    <textarea
                      value={newStep.description}
                      onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ステップの詳細を入力"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      写真添付
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            写真をアップロード
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleStepPhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    {stepPhotos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">{stepPhotos.length}枚の写真が選択されています</p>
                        <div className="grid grid-cols-4 gap-2">
                          {stepPhotos.map((photo, index) => (
                            <div key={index} className="relative">
                              <div className="text-xs text-gray-500 p-2 bg-white rounded border">
                                {photo.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeStepPhoto(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メモ
                    </label>
                    <textarea
                      value={newStep.notes}
                      onChange={(e) => setNewStep({ ...newStep, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="メモや特記事項を入力"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => setShowAddStep(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleAddStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      disabled={!newStep.title}
                    >
                      追加
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              <div className="space-y-4">
                {repair.progressSteps.map((step, index) => (
                  <div key={step.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {step.stepNumber}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="text-lg font-medium text-gray-900">{step.title}</h5>
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                              {getStatusIcon(step.status)}
                              <span>{getStatusText(step.status)}</span>
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          
                          {/* Dates */}
                          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                            {step.startDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>開始: {step.startDate}</span>
                              </div>
                            )}
                            {step.completionDate && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>完了: {step.completionDate}</span>
                              </div>
                            )}
                            {step.reportedBy && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>報告者: {step.reportedBy}</span>
                              </div>
                            )}
                          </div>

                          {/* Photos */}
                          {step.photoPaths.length > 0 && (
                            <div className="mb-3">
                              <button
                                onClick={() => togglePhotoExpansion(step.id)}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Camera className="h-4 w-4" />
                                <span>{step.photoPaths.length}枚の写真</span>
                                {expandedPhotos[step.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              {expandedPhotos[step.id] && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {step.photoPaths.map((photo, photoIndex) => (
                                    <img
                                      key={photoIndex}
                                      src={photo}
                                      alt={`ステップ${step.stepNumber} 写真${photoIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {step.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{step.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Update Buttons */}
                      <div className="flex items-center space-x-2">
                        {step.status !== 'completed' && (
                          <select
                            value={step.status}
                            onChange={(e) => updateStepStatus(step.id, e.target.value as any)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">未開始</option>
                            <option value="in-progress">作業中</option>
                            <option value="completed">完了</option>
                          </select>
                        )}
                        <button
                          onClick={() => setEditingStep(step.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {repair.progressSteps.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">まだ作業ステップが登録されていません</p>
                  <button
                    onClick={() => setShowAddStep(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    最初のステップを追加
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">すべての写真</h4>
              {getAllPhotos().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getAllPhotos().map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`修繕写真 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">まだ写真が登録されていません</p>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">報告書・書類</h4>
              {repair.reportPdfPath ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">修繕報告書</h5>
                      <p className="text-sm text-gray-600">PDF形式の報告書</p>
                    </div>
                    <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      ダウンロード
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">まだ報告書が登録されていません</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairProgressModal;