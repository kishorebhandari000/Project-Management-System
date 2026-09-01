import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import ProfileAvatar from '../components/ProfileAvatar';
import NotificationBell from '../components/NotificationBell';

type Role = 'admin' | 'supervisor' | 'student';

export default function NewForumPost() {
  const role = (localStorage.getItem('userRole') as Role | null) ?? 'student';
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/forum', { title, body });
      navigate('/forum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role={role} />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/forum')}
                className="group text-[#2563a8] hover:underline mb-2 text-sm inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Back to Forum
              </button>
              <h1 className="text-2xl">New Forum Thread</h1>
              <p className="text-gray-600">Post a thread visible to everyone on the homepage</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role={role} />
              <ProfileAvatar role={role} />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm"
            >
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Thread Title</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter a clear and engaging title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Content</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-64 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Write your announcement or discussion topic here..."
                    required
                  ></motion.textarea>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm mb-2 text-blue-900">Public Forum Guidelines:</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Threads will be visible to all visitors on the homepage</li>
                    <li>Use clear and professional language</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/forum')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={submitting}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Thread'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
