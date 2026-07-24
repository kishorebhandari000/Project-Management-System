import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

interface NotificationBellProps {
  role: 'admin' | 'student' | 'supervisor';
}

export default function NotificationBell({ role }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications')
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});

    const handleNotification = () => setUnreadCount((prev) => prev + 1);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  return (
    <Link to={`/${role}/notifications`} className="relative">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
        <span className="text-xl">🔔</span>
      </div>
      {unreadCount > 0 && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full" />
      )}
    </Link>
  );
}