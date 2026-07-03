import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function DiscussionThread() {
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');

  const thread = {
    id: 1,
    title: 'Project Proposal Guidelines Clarification',
    author: 'John Doe',
    authorRole: 'Student',
    category: 'General',
    createdAt: 'May 3, 2026 at 10:30 AM',
    content: 'Hi everyone, I have some questions about the project proposal guidelines. Specifically, I\'m not sure about the required length for the literature review section. The guidelines mention 2-3 pages, but I\'m wondering if this includes references or just the main content? Also, should we include preliminary results if we have already started some initial experiments? Any clarification would be appreciated!'
  };

  const replies = [
    {
      id: 1,
      author: 'Dr. Sarah Johnson',
      authorRole: 'Supervisor',
      createdAt: 'May 3, 2026 at 11:15 AM',
      content: 'Good question, John. The 2-3 pages refers to the main content only, excluding references. References should be listed separately. Regarding preliminary results, yes, you can include them if you have already started experiments, but make sure to clearly mark them as preliminary and explain your methodology.'
    },
    {
      id: 2,
      author: 'Jane Smith',
      authorRole: 'Student',
      createdAt: 'May 3, 2026 at 2:45 PM',
      content: 'Thanks for clarifying Dr. Johnson! I had the same question. One follow-up: should we use a specific citation style for the references?'
    },
    {
      id: 3,
      author: 'Dr. Sarah Johnson',
      authorRole: 'Supervisor',
      createdAt: 'May 3, 2026 at 3:20 PM',
      content: 'IEEE citation style is preferred for all technical documents. Make sure you\'re consistent throughout your proposal.'
    },
    {
      id: 4,
      author: 'Mike Johnson',
      authorRole: 'Student',
      createdAt: 'May 4, 2026 at 9:10 AM',
      content: 'This is really helpful! I was also wondering about the format. Should we include diagrams or flowcharts in the proposal, or save those for later submissions?'
    },
    {
      id: 5,
      author: 'Dr. Sarah Johnson',
      authorRole: 'Supervisor',
      createdAt: 'May 4, 2026 at 10:05 AM',
      content: 'Including diagrams and flowcharts in your proposal is encouraged, especially if they help explain your proposed methodology or system architecture. Visual aids make your proposal more clear and easier to evaluate.'
    },
  ];

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      setReplyText('');
    }
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/supervisor/discussions')}
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Discussions
              </button>
              <h1 className="text-2xl">{thread.title}</h1>
              <p className="text-gray-600">Discussion Thread</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Original Post */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {thread.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{thread.author}</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">
                      {thread.authorRole}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">
                      {thread.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">{thread.createdAt}</div>
                  <div className="text-gray-700 leading-relaxed">{thread.content}</div>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="mb-6">
              <h2 className="text-xl mb-4">{replies.length} Replies</h2>
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                        reply.authorRole === 'Supervisor' ? 'bg-[#2563a8]' : 'bg-gray-500'
                      }`}>
                        {reply.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">{reply.author}</span>
                          <span className={`px-3 py-1 rounded text-xs ${
                            reply.authorRole === 'Supervisor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {reply.authorRole}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mb-3">{reply.createdAt}</div>
                        <div className="text-gray-700 leading-relaxed">{reply.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg mb-4">Post a Reply</h3>
              <form onSubmit={handleSubmitReply}>
                <div className="mb-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Write your reply..."
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/supervisor/discussions')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
