import Sidebar from '../components/Sidebar';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import ProfileAvatar from '../components/ProfileAvatar';
import NotificationBell from '../components/NotificationBell';
import StatCard from '../components/StatCard';
import { useConfirm } from '../hooks/useConfirm';

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
  const confirm = useConfirm();

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
    if (!(await confirm({ message: 'Delete this forum thread? This will also delete its comments.', confirmLabel: 'Delete', variant: 'danger' }))) return;
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/forum/new"
                  className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] inline-block"
                >
                  New Thread
                </Link>
              </motion.div>
              <NotificationBell role={role} />

              <ProfileAvatar role={role} />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 max-w-xs">
            <StatCard icon={MessageCircle} label="Total Threads" value={posts.length} delay={0} />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="text-gray-500">Loading threads...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center text-gray-500">
              No forum threads yet. Start the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
