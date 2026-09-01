import Sidebar from '../../components/Sidebar';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationCategoryTabs from '../../components/NotificationCategoryTabs';
import {
  categoryForType,
  notificationTypeColor,
  type NotificationCategoryFilter,
} from '../../lib/notificationCategories';

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

export default function Notifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  // Snapshot of which notifications were unread when this page was opened - used purely
  // for this visit's highlighting, since opening the list marks everything read right away.
  const [unreadIdsThisVisit, setUnreadIdsThisVisit] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryFilter>('all');

  useEffect(() => {
    const loadAndMarkRead = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/notifications');
        const fetched: ApiNotification[] = data.notifications;
        const unreadIds = new Set(fetched.filter((n) => !n.read).map((n) => n._id));
        setNotifications(fetched);
        setUnreadIdsThisVisit(unreadIds);

        if (unreadIds.size > 0) {
          // Facebook-style: opening the list marks everything read. Fire this in the
          // background so the bell badge clears instantly without blocking the page.
          api
            .put('/notifications/read-all', {})
            .then(() => window.dispatchEvent(new Event('notificationsRead')))
            .catch(() => {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadAndMarkRead();
  }, []);

  const unreadCount = unreadIdsThisVisit.size;
  const visibleNotifications =
    categoryFilter === 'all' ? notifications : notifications.filter((n) => categoryForType(n.type) === categoryFilter);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Notifications</h1>
              <p className="text-gray-600">You have {unreadCount} unread notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="student" />
              <ProfileAvatar role="student" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {loading && <p className="text-gray-500">Loading notifications...</p>}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && (
              <>
                <NotificationCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />

                <div className="space-y-3">
                  {visibleNotifications.length === 0 && (
                    <p className="text-gray-500">No notifications to show.</p>
                  )}
                  {visibleNotifications.map((notification, i) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                      className={`bg-white rounded-lg p-5 border border-gray-200 shadow-sm ${
                        unreadIdsThisVisit.has(notification._id) ? 'border-l-4 border-l-[#2563a8]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-md text-sm ${notificationTypeColor(notification.type)}`}>
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                          <h3 className={`text-lg ${unreadIdsThisVisit.has(notification._id) ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500">{timeAgo(notification.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                    </motion.div>
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
