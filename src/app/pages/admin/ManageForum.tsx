import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function ManageForum() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  const forumPosts = [
    {
      id: 1,
      title: 'Welcome to PMS - Getting Started Guide',
      category: 'Announcement',
      excerpt: 'New to the Project Management System? This guide will help you navigate the platform...',
      status: 'Published',
      postedDate: '2 days ago',
      replies: 24,
    },
    {
      id: 2,
      title: 'Project Submission Deadline Extended',
      category: 'Important',
      excerpt: 'The final project submission deadline has been extended to accommodate student requests...',
      status: 'Published',
      postedDate: '5 days ago',
      replies: 18,
    },
    {
      id: 3,
      title: 'Tips for Choosing the Right Project',
      category: 'General',
      excerpt: 'Learn how to select a project that aligns with your interests and career goals...',
      status: 'Published',
      postedDate: '1 week ago',
      replies: 42,
    },
  ];

  const draftPosts = [
    {
      id: 4,
      title: 'Upcoming Workshop: Research Methodology',
      category: 'Event',
      excerpt: 'Join us for an interactive workshop on research methodology and academic writing...',
      status: 'Draft',
      lastEdited: '1 day ago',
    },
  ];

  const displayPosts = activeTab === 'published' ? forumPosts : draftPosts;

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Public Forum</h1>
              <p className="text-gray-600">Create and manage announcements visible on homepage</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/forum/new"
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]"
              >
                New Forum Post
              </Link>
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Published Posts</div>
              <div className="text-3xl text-[#2563a8]">3</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Draft Posts</div>
              <div className="text-3xl text-gray-700">1</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Total Replies</div>
              <div className="text-3xl text-gray-700">84</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'published'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'drafts'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Drafts
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg">{post.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.category === 'Announcement'
                          ? 'bg-blue-100 text-blue-700'
                          : post.category === 'Important'
                          ? 'bg-orange-100 text-orange-700'
                          : post.category === 'Event'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === 'Published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {post.status === 'Published' ? (
                        <>
                          <span>Posted {post.postedDate}</span>
                          <span>•</span>
                          <span>{post.replies} replies</span>
                        </>
                      ) : (
                        <span>Last edited {post.lastEdited}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/admin/forum/edit/${post.id}`)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
