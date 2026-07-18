import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';

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
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
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
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                AD
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
                  No projects yet. Click "Create Project" to add one.
                </div>
              )}
              {projects.map((project) => (
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
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                        Edit
                      </button>
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
          )}
        </div>
      </div>
    </div>
  );
}