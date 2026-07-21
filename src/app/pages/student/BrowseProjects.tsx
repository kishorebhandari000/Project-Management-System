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
  description: string;
  status: 'open' | 'allocated' | 'closed';
  supervisor?: { name: string };
  files?: ProjectFile[];
}

interface ApiAllocation {
  _id: string;
  project: { _id: string } | string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function BrowseProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [myAllocations, setMyAllocations] = useState<ApiAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, allocationsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/allocations'),
      ]);
      setProjects(projectsRes.projects);
      setMyAllocations(allocationsRes.allocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAllocationForProject = (projectId: string) => {
    return myAllocations.find((a) => {
      const pId = typeof a.project === 'string' ? a.project : a.project._id;
      return pId === projectId;
    });
  };

  const handleRequest = async (projectId: string) => {
    setRequestError('');
    setRequestingId(projectId);
    try {
      await api.post('/allocations', { projectId });
      await loadData();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Failed to request project');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Browse Projects</h1>
              <p className="text-gray-600">Explore available final year projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                JD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
            />
          </div>

          {loading && <p className="text-gray-500">Loading projects...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {requestError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {requestError}
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-2 gap-6">
              {projects.length === 0 && (
                <p className="text-gray-500 col-span-2">No open projects available right now.</p>
              )}
              {projects.map((project) => {
                const allocation = getAllocationForProject(project._id);
                const isRequesting = requestingId === project._id;

                let buttonLabel = 'Request';
                let buttonDisabled = false;

                if (allocation) {
                  buttonLabel =
                    allocation.status === 'pending'
                      ? 'Requested (pending)'
                      : allocation.status === 'approved'
                      ? 'Approved'
                      : 'Rejected';
                  buttonDisabled = true;
                } else if (project.status !== 'open') {
                  buttonLabel = 'Not Available';
                  buttonDisabled = true;
                } else if (isRequesting) {
                  buttonLabel = 'Requesting...';
                  buttonDisabled = true;
                }

                return (
                  <div key={project._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg pr-4">{project.title}</h3>
                      <span className={`text-sm px-3 py-1 rounded ${
                        project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <span>Supervisor: </span>
                      <span>{project.supervisor?.name || 'Unassigned'}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{project.description}</p>

                    {project.files && project.files.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Files:</p>
                        <ul className="space-y-1">
                          {project.files.map((f, idx) => (
  <li key={idx}>
    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#2563a8] hover:underline text-sm">
      📎 {f.name}
    </a>
  </li>
))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => handleRequest(project._id)}
                      disabled={buttonDisabled}
                      className={`px-5 py-2 rounded-md ${
                        buttonDisabled
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                      }`}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}