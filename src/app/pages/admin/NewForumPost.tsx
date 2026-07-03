import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function NewForumPost() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/forum');
  };

  const handleSaveDraft = () => {
    navigate('/admin/forum');
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/admin/forum')}
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Forum Management
              </button>
              <h1 className="text-2xl">Create New Forum Post</h1>
              <p className="text-gray-600">Post announcements and updates to the public homepage</p>
            </div>
            <div className="flex items-center gap-4">
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Post Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter a clear and engaging title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                    <option>Announcement</option>
                    <option>Important</option>
                    <option>General</option>
                    <option>Event</option>
                    <option>Guidelines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Excerpt</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Short summary (displayed on homepage)"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">This will be shown in the preview on the homepage</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Full Content</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-64 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Write your announcement or discussion topic here..."
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Visibility Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={(e) => setStatus(e.target.value as 'draft')}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Save as Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={status === 'published'}
                        onChange={(e) => setStatus(e.target.value as 'published')}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Publish Immediately</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm mb-2 text-blue-900">Public Forum Guidelines:</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Posts will be visible to all visitors on the homepage</li>
                    <li>Use clear and professional language</li>
                    <li>Choose appropriate categories for better organization</li>
                    <li>Draft posts are only visible to administrators</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/forum')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  {status === 'draft' && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-800"
                    >
                      Save Draft
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    {status === 'published' ? 'Publish Post' : 'Save'}
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
