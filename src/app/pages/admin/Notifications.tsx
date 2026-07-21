import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ApiNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function typeColor(type: string) {
  if (type.startsWith('allocation')) return 'bg-blue-100 text-blue-700';
  if (type.startsWith('assessment')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Notifications</h1>
              <p className="text-gray-600">You have {unreadCount} unread notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
                )}
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {loading && <p className="text-gray-500">Loading notifications...</p>}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {!loading && (
              <>
                <div className="mb-6 flex gap-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-[#2563a8] text-white px-5 py-2 rounded-md' : 'bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300'}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={filter === 'unread' ? 'bg-[#2563a8] text-white px-5 py-2 rounded-md' : 'bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300'}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                <div className="space-y-3">
                  {visibleNotifications.length === 0 && (
                    <p className="text-gray-500">No notifications to show.</p>
                  )}
                  {visibleNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`bg-white rounded-lg p-5 border border-gray-200 shadow-sm ${
                        !notification.read ? 'border-l-4 border-l-[#2563a8]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-md text-sm ${typeColor(notification.type)}`}>
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                          <h3 className={`text-lg ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500">{timeAgo(notification.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}