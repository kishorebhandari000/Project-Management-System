import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import { useState, useRef, useEffect } from 'react';
import { sendDirectMessage } from '../../utils/emailService';
import { useMessages } from '../../hooks/useMessages';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatPanel() {
  const { contacts, loadingContacts, selectedId, selectContact, messages, loadingMessages, sendMessage, error } = useMessages();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selected = contacts.find((c) => c.user._id === selectedId);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await sendMessage(input);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-80 border-r border-gray-200 overflow-y-auto">
        {error && (
          <div className="m-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        {loadingContacts ? (
          <p className="p-5 text-gray-500 text-sm">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">
            No one to message yet - students with an approved allocation on your projects will appear here.
          </p>
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
            Select a contact to start messaging
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
                <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
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
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
              >
                Send
              </button>
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
      await sendDirectMessage({
        recipientEmail,
        recipientName: 'Student',
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'Supervisor',
        subject,
        message,
        replyUrl: window.location.origin + '/student/messages',
      });

      setSuccessMessage('Email sent successfully to student!');
      setRecipientEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send email';

      if (errorMsg.includes('only send testing emails to your own email')) {
        setErrorMessage('⚠️ Resend free tier: You can only send emails to 20032573@students.koi.edu.au (your verified email). To send to others, verify a domain at resend.com/domains');
      } else {
        setErrorMessage('Failed to send email. Please try again.');
      }
      console.error('Email send error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
        <h2 className="text-xl mb-6">Send Email to Student</h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Student Email *</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              placeholder="student@university.edu"
              required
            />
            <p className="text-sm text-orange-600 mt-1">⚠️ Testing mode: Use 20032573@students.koi.edu.au to receive the email yourself</p>
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
              <li>Provide clear guidance and constructive feedback</li>
              <li>Include all relevant details and resources</li>
              <li>Your student will receive this email directly</li>
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
            <button
              type="submit"
              className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:bg-gray-400"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Messages() {
  const [tab, setTab] = useState<'chat' | 'email'>('chat');

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-gray-600">Chat with your students in real time, or send them an email</p>
            </div>
            <ProfileAvatar role="supervisor" />
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
