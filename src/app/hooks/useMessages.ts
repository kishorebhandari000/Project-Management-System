import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

export interface Contact {
  user: { _id: string; name: string; email: string; role: string };
  lastMessage: { content: string; createdAt: string; fromMe: boolean } | null;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  sender: string | { _id: string; name: string; email: string; role: string };
  recipient: string;
  content: string;
  createdAt: string;
}

function senderId(msg: ChatMessage): string {
  return typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
}

// Real contact list + conversation, backed by /api/messages, with live
// delivery over the existing notification socket (event: 'message').
export function useMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const bumpContact = useCallback((contactId: string, preview: Contact['lastMessage'], unreadDelta: number) => {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.user._id === contactId);
      if (idx === -1) return prev;
      const updated = [...prev];
      const current = updated[idx];
      updated[idx] = {
        ...current,
        lastMessage: preview,
        unreadCount: Math.max(0, current.unreadCount + unreadDelta),
      };
      const [item] = updated.splice(idx, 1);
      return [item, ...updated];
    });
  }, []);

  const loadContacts = useCallback(async () => {
    setLoadingContacts(true);
    setError('');
    try {
      const data = await api.get('/messages/contacts');
      setContacts(data.contacts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const selectContact = useCallback(async (contactId: string) => {
    setSelectedId(contactId);
    setLoadingMessages(true);
    setError('');
    try {
      const data = await api.get(`/messages/${contactId}`);
      setMessages(data.messages);
      setContacts((prev) => prev.map((c) => (c.user._id === contactId ? { ...c, unreadCount: 0 } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversation');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedId || !content.trim()) return;
    const data = await api.post('/messages', { recipientId: selectedId, content });
    setMessages((prev) => [...prev, data.message]);
    bumpContact(selectedId, { content, createdAt: data.message.createdAt, fromMe: true }, 0);
  }, [selectedId, bumpContact]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!userId) return;
    socket.connect();
    socket.emit('register', userId);

    const handleIncoming = (msg: ChatMessage) => {
      const from = senderId(msg);
      const isOpenConversation = selectedIdRef.current === from;

      if (isOpenConversation) {
        setMessages((prev) => [...prev, msg]);
      }
      bumpContact(from, { content: msg.content, createdAt: msg.createdAt, fromMe: false }, isOpenConversation ? 0 : 1);
    };

    socket.on('message', handleIncoming);
    return () => {
      socket.off('message', handleIncoming);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { contacts, loadingContacts, selectedId, selectContact, messages, loadingMessages, sendMessage, error, reload: loadContacts };
}
