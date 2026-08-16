import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface ProjectFile {
  url: string;
  name: string;
}

interface ApiProject {
  _id: string;
  title: string;
  category?: string;
  status: 'open' | 'allocated' | 'closed';
  supervisor?: { name: string };
  files?: ProjectFile[];
  description?: string;
  createdAt?: string;
  maxStudents?: number;
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');

  const supervisorOptions = useMemo(() => {
    const names = new Set<string>();
    for (const project of projects) {
      if (project.supervisor?.name) names.add(project.supervisor.name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return projects.filter((project) => {
      const haystack = [
        project.title,
        project.category ?? '',
        project.supervisor?.name ?? '',
        project.description ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (terms.length && !terms.every((t) => haystack.includes(t))) return false;
      if (statusFilter && project.status !== statusFilter) return false;
      if (supervisorFilter && (project.supervisor?.name ?? '') !== supervisorFilter) return false;
      return true;
    });
  }, [projects, query, statusFilter, supervisorFilter]);

  const hasActiveFilter = query.trim() !== '' || statusFilter !== '' || supervisorFilter !== '';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('');
    setSupervisorFilter('');
  };

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const triggerFilePicker = (projectId: string) => {
    fileInputRefs.current[projectId]?.click();
  };

  const handleFileSelected = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(projectId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.upload(`/projects/${projectId}/files`, formData);
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Oversee all projects in the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/projects/create" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Project
              </Link>
              <NotificationBell role="admin" />

              <ProfileAvatar role="admin" />
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
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <label htmlFor="project-search" className="sr-only">Search projects</label>
                  <input
                    id="project-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  />
                </div>

                <div>
                  <label htmlFor="project-status-filter" className="sr-only">Filter by status</label>
                  <select
                    id="project-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  >
                    <option value="">Status</option>
                    <option value="open">Open</option>
                    <option value="allocated">Allocated</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="project-supervisor-filter" className="sr-only">Filter by supervisor</label>
                  <select
                    id="project-supervisor-filter"
                    value={supervisorFilter}
                    onChange={(e) => setSupervisorFilter(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  >
                    <option value="">Supervisor</option>
                    {supervisorOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {hasActiveFilter && (
                <p className="text-sm text-gray-600 mb-4" aria-live="polite">
                  Showing {filteredProjects.length} of {projects.length} projects
                </p>
              )}

              <div className="space-y-4">
              {projects.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 text-center text-gray-500">
                  No projects yet. Click "Create Project" to add one.
                </div>
              )}
              {projects.length > 0 && filteredProjects.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 text-center text-gray-500">
                  <p>No projects match your search.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-sm text-[#2563a8] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
              {filteredProjects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg">{project.title}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {project.supervisor?.name || '-'} · {project.category || '-'} ·{' '}
                        <span className={project.status === 'open' ? 'text-green-600' : 'text-gray-500'}>
                          {project.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}
                        {' · '}
                        Group size: {project.maxStudents ?? 1} {(project.maxStudents ?? 1) === 1 ? 'student' : 'students'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
  to={`/admin/projects/${project._id}/edit`}
  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
>
  Edit
</Link>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Files</span>
                      <button
                        onClick={() => triggerFilePicker(project._id)}
                        disabled={uploadingId === project._id}
                        className="text-sm bg-[#2563a8] text-white px-3 py-1.5 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                      >
                        {uploadingId === project._id ? 'Uploading...' : 'Upload File'}
                      </button>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[project._id] = el; }}
                        onChange={(e) => handleFileSelected(project._id, e)}
                        className="hidden"
                      />
                    </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}