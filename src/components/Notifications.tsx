import React, { useState } from 'react';
import { Bell, Search, Calendar, AlertTriangle, CheckCircle, Clock, MessageSquare, FileText, User } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { Notification } from '../types';

const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contract-renewal' | 'payment-overdue' | 'repair-request' | 'maintenance-scheduled' | 'general'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.isRead) ||
                       (filterRead === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract-renewal':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment-overdue':
        return 'bg-red-100 text-red-800';
      case 'repair-request':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance-scheduled':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract-renewal':
        return <FileText className="h-4 w-4" />;
      case 'payment-overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'repair-request':
        return <MessageSquare className="h-4 w-4" />;
      case 'maintenance-scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'general':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'contract-renewal':
        return '契約更新';
      case 'payment-overdue':
        return '支払遅延';
      case 'repair-request':
        return '修繕依頼';
      case 'maintenance-scheduled':
        return 'メンテナンス';
      case 'general':
        return '一般';
      default:
        return '不明';
    }
  };

  const markAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  };

  const markAllAsRead = () => {
    console.log('Mark all as read');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">通知管理</h2>
            <p className="text-gray-600">システム通知とアラートを管理します</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>すべて既読にする</span>
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総通知数</p>
                <p className="text-3xl font-bold text-gray-900">{mockNotifications.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">未読</p>
                <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">既読</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockNotifications.length - unreadCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="タイトルまたは内容で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての種別</option>
            <option value="contract-renewal">契約更新</option>
            <option value="payment-overdue">支払遅延</option>
            <option value="repair-request">修繕依頼</option>
            <option value="maintenance-scheduled">メンテナンス</option>
            <option value="general">一般</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="unread">未読</option>
            <option value="read">既読</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md ${
              !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-2 rounded-full ${
                  !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {getTypeText(notification.type)}
                    </span>
                    {!notification.isRead && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        未読
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-3 ${
                    !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(notification.createdDate)}</span>
                    </div>
                    {notification.actionUrl && (
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        詳細を見る
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    既読にする
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">該当する通知が見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;