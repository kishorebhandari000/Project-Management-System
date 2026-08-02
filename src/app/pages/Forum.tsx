import Sidebar from '../components/Sidebar';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import ProfileAvatar from '../components/ProfileAvatar';

type Role = 'admin' | 'supervisor' | 'student';

interface ForumPost {
  _id: string;
  title: string;
  body: string;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

export default function Forum() {
  const role = (localStorage.getItem('userRole') as Role | null) ?? 'student';
  const userId = localStorage.getItem('userId');

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/forum');
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const canDelete = (post: ForumPost) => role === 'admin' || post.createdBy?._id === userId;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this forum thread? This will also delete its comments.')) return;
    try {
      await api.delete(`/forum/${id}`);
      await loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete thread');
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role={role} />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Forum</h1>
              <p className="text-gray-600">Public discussion threads visible to everyone</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/forum/new"
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]"
              >
                New Thread
              </Link>
              <Link to={`/${role}/notifications`} className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <ProfileAvatar role={role} />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm inline-block">
              <div className="text-gray-600 mb-2">Total Threads</div>
              <div className="text-3xl text-[#2563a8]">{posts.length}</div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-gray-500">Loading threads...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center text-gray-500">
              No forum threads yet. Start the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{post.body}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {post.createdBy?.name ?? 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/forum/${post._id}`}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        View
                      </Link>
                      {canDelete(post) && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
