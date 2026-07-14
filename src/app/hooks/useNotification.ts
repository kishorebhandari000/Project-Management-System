import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner'; // you already have sonner installed

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL, { autoConnect: false });

export function useNotifications() {
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return; // not logged in yet

    socket.connect();
    socket.emit('register', userId);

    socket.on('notification', (payload) => {
      toast(payload.title, { description: payload.message });
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, []);
}