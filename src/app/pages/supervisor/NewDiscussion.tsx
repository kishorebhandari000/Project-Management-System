import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useMyProjects } from '../../hooks/useMyProjects';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function SupervisorNewDiscussion() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, error: projectsError } = useMyProjects();

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = projectId.trim() && title.trim() && content.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError('');
    setSubmitting(true);
    try {
      const thread = await api.post('/discussions', { title, content, project: projectId });
      navigate(`/supervisor/discussions/${thread._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/supervisor/discussions')}
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Discussions
              </button>
              <h1 className="text-2xl">New Discussion</h1>
              <p className="text-gray-600">Start a new discussion thread on one of your projects</p>
            </div>
            <ProfileAvatar role="supervisor" />
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          {projectsLoading ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-gray-500">
              Loading your projects...
            </div>
          ) : projectsError ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-red-700">
              {projectsError}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm text-center">
              <h3 className="text-xl text-gray-600 mb-3">No supervised projects yet</h3>
              <p className="text-gray-500">You can start a discussion once you supervise a project.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 mb-2">Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    required
                  >
                    <option value="">Select a project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
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
                  <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Post Discussion'}
                  </button>
                  <Link to="/supervisor/discussions" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
