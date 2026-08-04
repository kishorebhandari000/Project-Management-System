import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import SendButton from '../../components/SendButton';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminMessages() {
  const { contacts, loadingContacts, selectedId, selectContact, messages, loadingMessages, sendMessage, error } = useMessages();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selected = contacts.find((c) => c.user._id === selectedId);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-gray-600">Communicate with users</p>
            </div>
            <ProfileAvatar role="admin" />
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex h-[calc(100vh-90px)]">
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            {loadingContacts ? (
              <p className="p-5 text-gray-500 text-sm">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="p-5 text-gray-500 text-sm">No users to message yet.</p>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.user._id}
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
                </button>
              ))
            )}
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
      </div>
    </div>
  );
}
