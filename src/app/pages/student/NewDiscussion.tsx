import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useMyProjects } from '../../hooks/useMyProjects';

export default function NewDiscussion() {
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
      navigate(`/student/discussions/${thread._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/student/discussions')}
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Discussions
              </button>
              <h1 className="text-2xl">Start New Discussion</h1>
              <p className="text-gray-600">Create a discussion topic on one of your projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                {(localStorage.getItem('userName') ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase()}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-3xl mx-auto">
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
                <h3 className="text-xl text-gray-600 mb-3">No approved projects yet</h3>
                <p className="text-gray-500">
                  You can start a discussion once your supervisor has approved your allocation request on a project.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="block text-gray-700 mb-2">Discussion Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      placeholder="Enter a clear and descriptive title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Message</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-48 focus:outline-none focus:border-[#2563a8]"
                      placeholder="Describe your question or topic in detail..."
                      required
                    ></textarea>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm mb-2">Discussion Guidelines:</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Be respectful and professional</li>
                      <li>Stay on topic</li>
                      <li>Provide context for your questions</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/student/discussions')}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post Discussion'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
