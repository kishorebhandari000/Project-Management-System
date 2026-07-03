import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';

export default function Discussions() {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  const discussions: any[] = [];

  const myDiscussions = discussions.filter(d => d.author === 'John Doe' || d.lastReplyBy === 'John Doe');

  const displayDiscussions = activeTab === 'all' ? discussions : myDiscussions;

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Discussion Forum</h1>
              <p className="text-gray-600">Discuss with supervisors and peers</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/student/discussions/new"
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]"
              >
                New Discussion
              </Link>
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                JD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Filter Tabs */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'all'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Discussions
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'my'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Discussions
            </button>
          </div>

          {/* Category Filters */}
          <div className="mb-6 flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              All Categories
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              General
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              Technical
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              Assessments
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              Resources
            </button>
          </div>

          {/* Discussions List */}
          {displayDiscussions.length === 0 ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl text-gray-600 mb-3">No discussions yet</h3>
                <p className="text-gray-500 mb-6">
                  Be the first to start a discussion! Ask questions, share ideas, or connect with your supervisors and peers.
                </p>
                <Link
                  to="/student/discussions/new"
                  className="inline-block bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                >
                  Start a Discussion
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayDiscussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  to={`/student/discussions/${discussion.id}`}
                  className="block"
                >
                  <div className={`bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                    discussion.isNew ? 'border-l-4 border-l-[#2563a8]' : ''
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg">{discussion.title}</h3>
                          {discussion.isNew && (
                            <span className="bg-[#2563a8] text-white text-xs px-2 py-1 rounded">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Posted by <span className="text-gray-800">{discussion.author}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              discussion.authorRole === 'Supervisor'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {discussion.authorRole}
                            </span>
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">
                            {discussion.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600 mb-1">{discussion.replies} replies</div>
                        <div className="text-gray-500 text-xs">
                          Last: {discussion.lastReply}
                        </div>
                        <div className="text-gray-500 text-xs">
                          by {discussion.lastReplyBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
