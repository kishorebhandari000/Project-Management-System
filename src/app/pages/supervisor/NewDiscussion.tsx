import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function SupervisorNewDiscussion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/supervisor/discussions');
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">New Discussion</h1>
              <p className="text-gray-600">Start a new discussion thread</p>
            </div>
            <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
              SJ
            </Link>
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Discussion title..."
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                >
                  <option>General</option>
                  <option>Technical</option>
                  <option>Assessments</option>
                  <option>Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 h-40 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Write your discussion..."
                  required
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]">
                  Post Discussion
                </button>
                <Link to="/supervisor/discussions" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
