import { useEffect } from 'react';
import { toast } from 'sonner';
import { socket } from '../lib/socket';

export function useNotifications() {
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    socket.connect();
    socket.emit('register', userId);

    const handleNotification = (payload: { title: string; message: string }) => {
      toast(payload.title, { description: payload.message });
    };
    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
      socket.disconnect();
    };
  }, []);
}