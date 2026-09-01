import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import { useMyProjects } from '../../hooks/useMyProjects';
import NotificationBell from '../../components/NotificationBell';
import ProfileAvatar from '../../components/ProfileAvatar';

interface Thread {
  _id: string;
  title: string;
  content: string;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
  repliesCount: number;
  projectTitle: string;
}

export default function AdminDiscussions() {
  const { projects, loading: projectsLoading, error: projectsError } = useMyProjects();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectsLoading) return;

    if (projects.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(
          projects.map((p) =>
            api
              .get(`/discussions?project=${p.id}`)
              .then((list: Omit<Thread, 'projectTitle'>[]) =>
                list.map((t) => ({ ...t, projectTitle: p.title }))
              )
          )
        );
        if (!cancelled) {
          const merged = results
            .flat()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setThreads(merged);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load discussions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectsLoading, projects]);

  const isLoading = projectsLoading || loading;
  const anyError = projectsError || error;

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Discussions</h1>
              <p className="text-gray-600">Project discussion threads across the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/discussions/new"
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]"
              >
                New Discussion
              </Link>
              <NotificationBell role="admin" />
              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-gray-500">
              Loading discussions...
            </div>
          ) : anyError ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-red-700">
              {anyError}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm text-center">
              <h3 className="text-xl text-gray-600 mb-2">No projects exist yet</h3>
              <p className="text-gray-500">Discussions will appear here once projects are created.</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm text-center">
              <h3 className="text-xl text-gray-600 mb-2">No discussions yet</h3>
              <p className="text-gray-500">No project has started a discussion yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((d, i) => (
                <motion.div
                  key={d._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                >
                  <Link to={`/admin/discussions/${d._id}`} className="block">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg">{d.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Posted by <span className="text-gray-800">{d.createdBy.name}</span></span>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">{d.projectTitle}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-600 mb-1">{d.repliesCount} {d.repliesCount === 1 ? 'reply' : 'replies'}</div>
                          <div className="text-gray-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
