import React, { useState } from 'react';
import { X, Plus, FileText, Calendar, User, CheckCircle, Clock, AlertTriangle, Edit, Save, Trash2, Eye, EyeOff, Upload, Download } from 'lucide-react';
import { Contract, ContractStep } from '../types';

interface ContractProgressModalProps {
  contract: Contract;
  onClose: () => void;
  userRole?: 'admin' | 'manager';
}

const ContractProgressModal: React.FC<ContractProgressModalProps> = ({ contract, onClose, userRole = 'admin' }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'documents' | 'timeline'>('progress');
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState<Partial<ContractStep>>({
    title: '',
    description: '',
    status: 'pending',
    category: 'other',
    documentPaths: [],
    notes: '',
    isRequired: false
  });
  const [stepDocuments, setStepDocuments] = useState<File[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'application':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800';
      case 'approval':
        return 'bg-green-100 text-green-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-orange-100 text-orange-800';
      case 'move-in':
        return 'bg-indigo-100 text-indigo-800';
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
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in-progress':
        return '進行中';
      case 'pending':
        return '未開始';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '不明';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'application':
        return '申込';
      case 'screening':
        return '審査';
      case 'approval':
        return '承認';
      case 'contract':
        return '契約';
      case 'payment':
        return '支払い';
      case 'move-in':
        return '入居';
      default:
        return 'その他';
    }
  };

  const handleAddStep = () => {
    const step: ContractStep = {
      id: `${contract.id}-${Date.now()}`,
      stepNumber: contract.contractSteps.length + 1,
      title: newStep.title || '',
      description: newStep.description || '',
      status: newStep.status || 'pending',
      category: newStep.category || 'other',
      documentPaths: [],
      notes: newStep.notes,
      assignedTo: newStep.assignedTo,
      reportedBy: userRole === 'manager' ? '管理会社' : '管理者',
      reportedDate: new Date().toISOString().split('T')[0],
      isRequired: newStep.isRequired || false
    };

    console.log('Adding new contract step:', step, stepDocuments);
    
    // Reset form
    setNewStep({
      title: '',
      description: '',
      status: 'pending',
      category: 'other',
      documentPaths: [],
      notes: '',
      isRequired: false
    });
    setStepDocuments([]);
    setShowAddStep(false);
  };

  const handleStepDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setStepDocuments(selectedFiles);
    }
  };

  const removeStepDocument = (index: number) => {
    setStepDocuments(stepDocuments.filter((_, i) => i !== index));
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'in-progress' | 'completed' | 'cancelled') => {
    console.log('Updating contract step status:', stepId, status);
  };

  const getAllDocuments = () => {
    const allDocuments: string[] = contract.contractPdfPath ? [contract.contractPdfPath] : [];
    contract.contractSteps.forEach(step => {
      allDocuments.push(...step.documentPaths);
    });
    return allDocuments;
  };

  const getProgressPercentage = () => {
    if (contract.contractSteps.length === 0) return 0;
    const completedSteps = contract.contractSteps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / contract.contractSteps.length) * 100);
  };

  const getOverdueSteps = () => {
    const today = new Date();
    return contract.contractSteps.filter(step => {
      if (!step.dueDate || step.status === 'completed') return false;
      return new Date(step.dueDate) < today;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">契約手続き進捗管理</h3>
            <p className="text-gray-600 mt-1">契約者: {contract.residentId}</p>
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
              <p className="text-2xl font-bold text-gray-900">{contract.contractSteps.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">完了ステップ</p>
              <p className="text-2xl font-bold text-green-600">
                {contract.contractSteps.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">期限超過</p>
              <p className="text-2xl font-bold text-red-600">
                {getOverdueSteps().length}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">手続き進捗</span>
              <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Overdue Alert */}
          {getOverdueSteps().length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">
                  {getOverdueSteps().length}件のステップが期限を超過しています
                </p>
              </div>
            </div>
          )}
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
              手続き進捗
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              書類一覧 ({getAllDocuments().length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              タイムライン
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Add Step Button */}
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">契約手続きステップ</h4>
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
                        カテゴリ
                      </label>
                      <select
                        value={newStep.category}
                        onChange={(e) => setNewStep({ ...newStep, category: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="application">申込</option>
                        <option value="screening">審査</option>
                        <option value="approval">承認</option>
                        <option value="contract">契約</option>
                        <option value="payment">支払い</option>
                        <option value="move-in">入居</option>
                        <option value="other">その他</option>
                      </select>
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
                        <option value="in-progress">進行中</option>
                        <option value="completed">完了</option>
                        <option value="cancelled">キャンセル</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        担当者
                      </label>
                      <input
                        type="text"
                        value={newStep.assignedTo}
                        onChange={(e) => setNewStep({ ...newStep, assignedTo: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="担当者名を入力"
                      />
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
                      書類添付
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            書類をアップロード
                          </span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleStepDocumentUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    {stepDocuments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">{stepDocuments.length}件の書類が選択されています</p>
                        <div className="space-y-2">
                          {stepDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm text-gray-700">{doc.name}</span>
                              <button
                                type="button"
                                onClick={() => removeStepDocument(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStep.isRequired}
                        onChange={(e) => setNewStep({ ...newStep, isRequired: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">必須ステップ</span>
                    </label>
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

              {/* Contract Steps */}
              <div className="space-y-4">
                {contract.contractSteps.map((step, index) => {
                  const isOverdue = step.dueDate && new Date(step.dueDate) < new Date() && step.status !== 'completed';
                  
                  return (
                    <div key={step.id} className={`bg-white border rounded-lg p-6 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.status === 'completed' ? 'bg-green-100 text-green-800' :
                              step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              step.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(step.category)}`}>
                                {getCategoryText(step.category)}
                              </span>
                              {step.isRequired && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  必須
                                </span>
                              )}
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
                              {step.dueDate && (
                                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>期限: {step.dueDate}</span>
                                </div>
                              )}
                              {step.completionDate && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>完了: {step.completionDate}</span>
                                </div>
                              )}
                              {step.assignedTo && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>担当: {step.assignedTo}</span>
                                </div>
                              )}
                            </div>

                            {/* Documents */}
                            {step.documentPaths.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center space-x-2 text-blue-600 text-sm font-medium mb-2">
                                  <FileText className="h-4 w-4" />
                                  <span>{step.documentPaths.length}件の書類</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {step.documentPaths.map((doc, docIndex) => (
                                    <div key={docIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="text-sm text-gray-700 truncate">書類{docIndex + 1}</span>
                                      <button className="text-blue-600 hover:text-blue-700">
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
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
                          {step.status !== 'completed' && step.status !== 'cancelled' && (
                            <select
                              value={step.status}
                              onChange={(e) => updateStepStatus(step.id, e.target.value as any)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">未開始</option>
                              <option value="in-progress">進行中</option>
                              <option value="completed">完了</option>
                              <option value="cancelled">キャンセル</option>
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
                  );
                })}
              </div>

              {contract.contractSteps.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">まだ契約手続きステップが登録されていません</p>
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

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">すべての書類</h4>
              {getAllDocuments().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllDocuments().map((doc, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">書類 {index + 1}</h5>
                          <p className="text-sm text-gray-600">PDF形式</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">まだ書類が登録されていません</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">契約手続きタイムライン</h4>
              <div className="space-y-4">
                {contract.contractSteps
                  .filter(step => step.reportedDate)
                  .sort((a, b) => new Date(b.reportedDate!).getTime() - new Date(a.reportedDate!).getTime())
                  .map((step) => (
                    <div key={step.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${getStatusColor(step.status)}`}>
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900">{step.title}</h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(step.category)}`}>
                            {getCategoryText(step.category)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{step.reportedDate}</span>
                          {step.reportedBy && <span>報告者: {step.reportedBy}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractProgressModal;