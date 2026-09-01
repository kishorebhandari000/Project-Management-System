import Sidebar from '../../components/Sidebar';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';

interface ApiProject {
  title: string;
  description: string;
  category?: string;
  maxStudents: number;
  status: 'open' | 'allocated' | 'closed';
  supervisor?: { name: string } | string;
}

export default function ViewProject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await api.get(`/projects/${id}`);
        setProject(data.project);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Project Details</h1>
              <p className="text-gray-600">View-only — contact an admin to make changes</p>
            </div>
            <NotificationBell role="supervisor" />

          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <p className="text-gray-500">Loading project...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                {error}
              </div>
            ) : project ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm space-y-6"
              >
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Title</p>
                  <p className="text-lg">{project.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p>{project.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Group Size</p>
                    <p>{project.maxStudents} student{project.maxStudents !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="capitalize">{project.status}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/supervisor/projects')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}