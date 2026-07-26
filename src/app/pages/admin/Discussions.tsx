import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useMyProjects } from '../../hooks/useMyProjects';

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
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
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
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                {(localStorage.getItem('userName') ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase()}
              </Link>
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
              {threads.map((d) => (
                <Link key={d._id} to={`/admin/discussions/${d._id}`} className="block">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
