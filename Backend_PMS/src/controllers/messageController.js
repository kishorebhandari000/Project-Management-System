import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import SendButton from '../../components/SendButton';

function initials(name = '') {
  if (!name) return '?';

  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function timeLabel(iso) {
  if (!iso) return '';

  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudentMessages() {
  const {
    contacts = [],
    loadingContacts,
    selectedId,
    selectContact,
    messages = [],
    loadingMessages,
    sendMessage,
    error,
  } = useMessages();

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const bottomRef = useRef(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const selected = contacts.find(
    (contact) => contact?.user?._id === selectedId
  );

  const filteredContacts = contacts.filter((contact) => {
    const name = contact?.user?.name || '';
    const role = contact?.user?.role || '';

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSend = async () => {
    const message = input.trim();

    if (!message || !selectedId) return;

    try {
      await sendMessage(message);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar role="student" />

      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Messages</h1>

              <p className="text-gray-600">
                Communicate with your supervisor
              </p>
            </div>

            <ProfileAvatar role="student" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex h-[calc(100vh-90px)]">
          {/* Contact Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2563a8]"
              />
            </div>

            {/* Contacts */}
            <div className="flex-1 overflow-y-auto">
              {loadingContacts ? (
                <p className="p-5 text-gray-500 text-sm">
                  Loading contacts...
                </p>
              ) : contacts.length === 0 ? (
                <p className="p-5 text-gray-500 text-sm">
                  No one to message yet. Once you have an approved project,
                  your supervisor will appear here.
                </p>
              ) : filteredContacts.length === 0 ? (
                <p className="p-5 text-gray-500 text-sm">
                  No contacts found.
                </p>
              ) : (
                filteredContacts.map((c) => {
                  if (!c?.user?._id) return null;

                  return (
                    <button
                      key={c.user._id}
                      type="button"
                      onClick={() => selectContact(c.user._id)}
                      className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 ${
                        selectedId === c.user._id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-sm shrink-0">
                          {initials(c.user.name)}
                        </div>

                        {/* Contact Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {c.user.name || 'Unknown User'}
                            </span>

                            {c.lastMessage?.createdAt && (
                              <span className="text-xs text-gray-500 ml-2 shrink-0">
                                {timeLabel(c.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 truncate">
                            {c.lastMessage
                              ? `${
                                  c.lastMessage.fromMe ? 'You: ' : ''
                                }${c.lastMessage.content || ''}`
                              : c.user.role || 'User'}
                          </p>
                        </div>

                        {/* Unread Messages */}
                        {Number(c.unreadCount) > 0 && (
                          <span className="bg-[#2563a8] text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a contact to start messaging
              </div>
            ) : (
              <>
                {/* Selected User Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white">
                    {initials(selected?.user?.name)}
                  </div>

                  <div>
                    <div className="font-medium">
                      {selected?.user?.name || 'Unknown User'}
                    </div>

                    <div className="text-sm text-gray-500 capitalize">
                      {selected?.user?.role || 'User'}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  {loadingMessages ? (
                    <p className="text-gray-400 text-sm">
                      Loading conversation...
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    messages.map((m, index) => {
                      const senderId =
                        typeof m.sender === 'string'
                          ? m.sender
                          : m.sender?._id;

                      const mine =
                        senderId &&
                        userId &&
                        String(senderId) === String(userId);

                      return (
                        <div
                          key={m._id || index}
                          className={`flex ${
                            mine
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-sm break-words px-4 py-3 rounded-lg text-sm ${
                              mine
                                ? 'bg-[#2563a8] text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <div>{m.content}</div>

                            <div
                              className={`text-xs mt-1 ${
                                mine
                                  ? 'text-blue-200'
                                  : 'text-gray-400'
                              }`}
                            >
                              {timeLabel(m.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  />

                  <SendButton
                    onSend={handleSend}
                    disabled={!input.trim()}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}