import Sidebar from '../../components/Sidebar';
import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Machine Learning');
  const [maxStudents, setMaxStudents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await api.get(`/projects/${id}`);
        const project = data.project;
        setTitle(project.title);
        setDescription(project.description);
        setCategory(project.category || 'Machine Learning');
        setMaxStudents(project.maxStudents || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/projects/${id}`, { title, description, category, maxStudents });
      navigate('/supervisor/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
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
              <h1 className="text-2xl">Edit Project</h1>
              <p className="text-gray-600">Update your project details</p>
            </div>
            <Link to="/supervisor/notifications" className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                <span className="text-xl">🔔</span>
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <p className="text-gray-500">Loading project...</p>
            ) : (
              <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Project Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      >
                        <option>Machine Learning</option>
                        <option>Web Development</option>
                        <option>Mobile Development</option>
                        <option>IoT</option>
                        <option>Cybersecurity</option>
                        <option>Blockchain</option>
                        <option>Data Science</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Group Size (max students)</label>
                      <select
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      >
                        <option value="1">Individual (1 student)</option>
                        <option value="2">Pair (2 students)</option>
                        <option value="3">Small Group (3 students)</option>
                        <option value="4">Medium Group (4 students)</option>
                        <option value="5">Large Group (5 students)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/supervisor/projects')}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
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