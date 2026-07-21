import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';

const discussions = [
  { id: 1, title: 'Best resources for learning React hooks?', author: 'John Doe', authorRole: 'Student', category: 'Technical', replies: 5, lastReply: 'May 2, 2026', lastReplyBy: 'Dr. Sarah Johnson', isNew: true },
  { id: 2, title: 'How to structure a literature review?', author: 'Jane Smith', authorRole: 'Student', category: 'General', replies: 8, lastReply: 'May 1, 2026', lastReplyBy: 'Prof. Brown', isNew: false },
  { id: 3, title: 'Project proposal tips', author: 'Dr. Sarah Johnson', authorRole: 'Supervisor', category: 'Resources', replies: 12, lastReply: 'April 30, 2026', lastReplyBy: 'Mike Johnson', isNew: false },
];

export default function StudentDiscussions() {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const display = activeTab === 'my' ? discussions.filter(d => d.author === 'John Doe') : discussions;

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Discussions</h1>
              <p className="text-gray-600">Engage with peers and supervisors</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/discussions/new" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                New Discussion
              </Link>
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                JD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 flex gap-3">
            {(['all', 'my'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-3 rounded-md capitalize ${activeTab === t ? 'bg-[#2563a8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t === 'all' ? 'All Discussions' : 'My Discussions'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {display.map((d) => (
              <Link key={d.id} to={`/student/discussions/${d.id}`} className="block">
                <div className={`bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${d.isNew ? 'border-l-4 border-l-[#2563a8]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg">{d.title}</h3>
                        {d.isNew && <span className="bg-[#2563a8] text-white text-xs px-2 py-1 rounded">New</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>By <span className="text-gray-800">{d.author}</span></span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">{d.category}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600 mb-1">{d.replies} replies</div>
                      <div className="text-gray-500 text-xs">Last: {d.lastReply}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {display.length === 0 && (
              <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-gray-500">
                No discussions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
