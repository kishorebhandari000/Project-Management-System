import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ProjectFile {
  url: string;
  name: string;
}

interface ApiProject {
  _id: string;
  title: string;
  status: 'open' | 'allocated' | 'closed';
  files?: ProjectFile[];
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/projects');
        setProjects(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Create and manage your project offerings</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]" disabled title="Create form for supervisors coming in a later job">
                Create Project
              </button>
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SV
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && <p className="text-gray-500">Loading projects...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {projects.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 text-center text-gray-500">
                  No projects assigned to you yet.
                </div>
              )}
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg">{project.title}</h3>
                      <span className={project.status === 'open' ? 'text-green-600 text-sm' : 'text-gray-500 text-sm'}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                        Edit
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm text-gray-700 mb-2">Files</p>
                    {(!project.files || project.files.length === 0) && (
                      <p className="text-sm text-gray-400">No files uploaded yet.</p>
                    )}
                    {project.files && project.files.length > 0 && (
                      <ul className="space-y-1">
                        {project.files.map((f, idx) => (
  <li key={idx}>
    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#2563a8] hover:underline text-sm">
      📎 {f.name}
    </a>
  </li>
))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}