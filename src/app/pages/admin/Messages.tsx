import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';

const contacts = [
  { id: 1, name: 'Dr. Sarah Johnson', role: 'Supervisor', avatar: 'SJ', lastMessage: 'Please allocate a student to the new project.', time: '1h ago', unread: 1 },
  { id: 2, name: 'John Doe', role: 'Student', avatar: 'JD', lastMessage: 'I have a question about project allocation.', time: '3h ago', unread: 0 },
];

export default function AdminMessages() {
  const [selected, setSelected] = useState(contacts[0]);
  const [input, setInput] = useState('');

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-gray-600">Communicate with users</p>
            </div>
            <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
              AD
            </Link>
          </div>
        </div>

        <div className="flex h-[calc(100vh-90px)]">
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 ${selected.id === c.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-sm shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="bg-[#2563a8] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white">
                {selected.avatar}
              </div>
              <div>
                <div className="font-medium">{selected.name}</div>
                <div className="text-sm text-gray-500">{selected.role}</div>
              </div>
            </div>
            <div className="flex-1 p-6">
              <p className="text-gray-500 text-center mt-20">Select a conversation to start messaging.</p>
            </div>
            <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
              />
              <button onClick={() => setInput('')} className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
