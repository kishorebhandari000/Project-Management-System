import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useMessages } from '../../hooks/useMessages';
import SendButton from '../../components/SendButton';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatPanel() {
  const { contacts, loadingContacts, selectedId, selectContact, messages, loadingMessages, sendMessage, error } = useMessages();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selected = contacts.find((c) => c.user._id === selectedId);

  const filteredContacts = contacts.filter((c) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      c.user.name.toLowerCase().includes(term) ||
      c.user.role.toLowerCase().includes(term) ||
      (c.lastMessage?.content.toLowerCase().includes(term) ?? false)
    );
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563a8]"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
        {loadingContacts ? (
          <p className="p-5 text-gray-500 text-sm">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">No users to message yet.</p>
        ) : filteredContacts.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">No contacts found.</p>
        ) : (
          filteredContacts.map((c, i) => (
            <motion.button
              key={c.user._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              onClick={() => selectContact(c.user._id)}
              className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 ${selectedId === c.user._id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-sm shrink-0">
                  {initials(c.user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{c.user.name}</span>
                    {c.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{timeLabel(c.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {c.lastMessage ? `${c.lastMessage.fromMe ? 'You: ' : ''}${c.lastMessage.content}` : c.user.role}
                  </p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="bg-[#2563a8] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </motion.button>
          ))
        )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging.
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white">
                {initials(selected.user.name)}
              </div>
              <div>
                <div className="font-medium">{selected.user.name}</div>
                <div className="text-sm text-gray-500 capitalize">{selected.user.role}</div>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {loadingMessages ? (
                <p className="text-gray-400 text-sm">Loading conversation...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-400 text-sm">No messages yet.</p>
              ) : (
                messages.map((m) => {
                  const mine = (typeof m.sender === 'string' ? m.sender : m.sender._id) === userId;
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm px-4 py-3 rounded-lg text-sm ${mine ? 'bg-[#2563a8] text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                        {m.content}
                        <div className={`text-xs mt-1 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>{timeLabel(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
              />
              <SendButton onSend={handleSend} disabled={!input.trim()} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmailPanel() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await api.post('/emails', { recipientEmail, subject, message });

      setSuccessMessage('Email sent successfully!');
      setRecipientEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
      console.error('Email send error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
        <h2 className="text-xl mb-6">Send Email</h2>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            >
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Recipient Email *</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              placeholder="user@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 h-48 focus:outline-none focus:border-[#2563a8]"
              placeholder="Write your message here..."
              required
            ></textarea>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm mb-2 text-blue-900">Email Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Provide clear guidance and relevant information</li>
              <li>Include all relevant details and resources</li>
              <li>The recipient will receive this email directly</li>
              <li>They can reply to your university email address</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setRecipientEmail('');
                setSubject('');
                setMessage('');
              }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
              disabled={sending}
            >
              Clear
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:bg-gray-400"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const [tab, setTab] = useState<'chat' | 'email'>('chat');

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-gray-600">Chat with users in real time, or send them an email</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="admin" />
              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setTab('chat')}
              className={`px-6 py-3 rounded-md ${tab === 'chat' ? 'bg-[#2563a8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setTab('email')}
              className={`px-6 py-3 rounded-md ${tab === 'email' ? 'bg-[#2563a8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Email
            </button>
          </div>

          {tab === 'chat' ? <ChatPanel /> : <EmailPanel />}
        </div>
      </div>
    </div>
  );
}
