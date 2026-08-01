import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  project: { title: string };
  student: { name: string; email: string };
  supervisor: { name: string };
}

interface ApiProject {
  _id: string;
  title: string;
  status: 'open' | 'allocated' | 'closed';
}

interface ApiUser {
  _id: string;
  name: string;
  email: string;
}

export default function ManageAllocation() {
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [students, setStudents] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [allocationsRes, projectsRes, studentsRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/projects'),
        api.get('/users?role=student'),
      ]);
      setAllocations(allocationsRes.allocations);
      setProjects(projectsRes.projects);
      setStudents(studentsRes.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected' | 'pending') => {
    try {
      await api.put(`/allocations/${id}/decision`, { decision });
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update allocation');
    }
  };

  const handleForceAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignProjectId || !assignStudentId) return;

    setAssignError('');
    setAssignSuccess('');
    setAssigning(true);
    try {
      await api.post('/allocations/assign', { projectId: assignProjectId, studentId: assignStudentId });
      setAssignSuccess('Student assigned and approved.');
      setAssignProjectId('');
      setAssignStudentId('');
      await loadAll();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign student');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Allocation</h1>
              <p className="text-gray-600">
                Applications are approved by each project's supervisor - admin can also decide as a fallback,
                or use force-assign below as a safety-net override.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && <p className="text-gray-500">Loading allocations...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl mb-1">Force-Assign a Student</h2>
            <p className="text-sm text-gray-500 mb-4">
              Directly assign a student to a project. This bypasses the normal request flow and creates an
              already-approved allocation - use it as a safety net. Any other approved allocation the student
              currently holds is cleared.
            </p>
            {assignError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                {assignError}
              </div>
            )}
            {assignSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
                {assignSuccess}
              </div>
            )}
            <form onSubmit={handleForceAssign} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Student</label>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8] min-w-[220px]"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Project</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8] min-w-[220px]"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={assigning || !assignProjectId || !assignStudentId}
                className="bg-[#2563a8] text-white px-6 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign & Approve'}
              </button>
            </form>
          </div>

          {!loading && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl">All Allocations</h2>
              </div>
              <div className="overflow-x-auto"><table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Project</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Supervisor</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        No allocations yet.
                      </td>
                    </tr>
                  )}
                  {allocations.map((allocation) => (
                    <tr key={allocation._id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{allocation.student?.name}</td>
                      <td className="px-6 py-4">{allocation.project?.title}</td>
                      <td className="px-6 py-4">{allocation.supervisor?.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            allocation.status === 'approved'
                              ? 'text-green-600'
                              : allocation.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }
                        >
                          {allocation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {allocation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleDecision(allocation._id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecision(allocation._id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {allocation.status !== 'pending' && (
                            <button
                              onClick={() => handleDecision(allocation._id, 'pending')}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
