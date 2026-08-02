import Sidebar from '../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { api } from '../lib/api';
import ProfileAvatar from '../components/ProfileAvatar';

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
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Forum
              </button>
              <h1 className="text-2xl">New Forum Thread</h1>
              <p className="text-gray-600">Post a thread visible to everyone on the homepage</p>
            </div>
            <div className="flex items-center gap-4">
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Thread Title</label>
                  <input
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
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-64 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Write your announcement or discussion topic here..."
                    required
                  ></textarea>
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
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Thread'}
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
