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
  maxStudents: number;
  files?: ProjectFile[];
}

interface ApiAllocation {
  _id: string;
  project: { _id: string; title: string } | string;
  student: { _id: string; name: string; email: string };
  status: 'pending' | 'approved' | 'rejected';
}

interface Member {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

interface ApiGroup {
  _id: string;
  name: string;
  status: 'pending' | 'supervisor_approved' | 'approved' | 'rejected';
  project: { _id: string; title: string; maxStudents: number };
  leader: { _id: string; name: string };
  members: Member[];
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decidingGroupId, setDecidingGroupId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, allocationsRes, groupsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/allocations'),
        api.get('/groups'),
      ]);
      setProjects(projectsRes.projects);
      setAllocations(allocationsRes.allocations);
      setGroups(groupsRes.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGroupDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setDecidingGroupId(id);
    try {
      await api.put(`/groups/${id}/decision`, { decision });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update group request');
    } finally {
      setDecidingGroupId(null);
    }
  };

  const pendingGroups = groups.filter((g) => g.status === 'pending');
  const forwardedGroups = groups.filter((g) => g.status === 'supervisor_approved');
  const decidedGroups = groups.filter((g) => g.status === 'approved' || g.status === 'rejected');

  // Students actually enrolled on a project (an approved allocation - created
  // once a group's final allocation is approved, or via admin force-assign).
  const getEnrolledStudents = (projectId: string) => {
    return allocations.filter((a) => {
      if (!a.project || a.status !== 'approved') return false;
      const pId = typeof a.project === 'string' ? a.project : a.project._id;
      return pId === projectId;
    });
  };

  const groupStatusBadge = (status: ApiGroup['status']) => {
    const map: Record<ApiGroup['status'], string> = {
      pending: 'bg-orange-100 text-orange-700',
      supervisor_approved: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const label: Record<ApiGroup['status'], string> = {
      pending: 'Pending Review',
      supervisor_approved: 'Awaiting Admin Allocation',
      approved: 'Allocated',
      rejected: 'Rejected',
    };
    return <span className={`text-xs px-3 py-1 rounded ${map[status]}`}>{label[status]}</span>;
  };

  const GroupCard = ({ group, showActions }: { group: ApiGroup; showActions: boolean }) => (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
        <div>
          <h3 className="text-lg">{group.name || 'Untitled Group'}</h3>
          <p className="text-sm text-gray-600">{group.project?.title || 'Deleted project'}</p>
        </div>
        {groupStatusBadge(group.status)}
      </div>

      <ul className="space-y-1 mb-4">
        {group.members.map((m) => (
          <li key={m._id} className="text-sm text-gray-700">
            👤 {m.name} {m._id === group.leader?._id && <span className="text-xs text-gray-400">(leader)</span>}
            <span className="text-gray-400"> — {m.studentId || m.email}</span>
          </li>
        ))}
      </ul>

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => handleGroupDecision(group._id, 'approved')}
            disabled={decidingGroupId === group._id}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-60"
          >
            Recommend to Admin
          </button>
          <button
            onClick={() => handleGroupDecision(group._id, 'rejected')}
            disabled={decidingGroupId === group._id}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Manage your project offerings and student group applications</p>
            </div>
            <div className="flex items-center gap-4">
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
          {loading && <p className="text-gray-500">Loading...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!loading && (
            <>
              {/* Group Requests */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl">Pending Your Review ({pendingGroups.length})</h2>
                </div>
                <div className="p-6 space-y-4">
                  {pendingGroups.length === 0 && (
                    <p className="text-gray-400 text-sm">No pending group requests.</p>
                  )}
                  {pendingGroups.map((g) => (
                    <GroupCard key={g._id} group={g} showActions />
                  ))}
                </div>
              </div>

              {forwardedGroups.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl">Awaiting Admin Allocation ({forwardedGroups.length})</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {forwardedGroups.map((g) => (
                      <GroupCard key={g._id} group={g} showActions={false} />
                    ))}
                  </div>
                </div>
              )}

              {decidedGroups.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl">Decided ({decidedGroups.length})</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {decidedGroups.map((g) => (
                      <GroupCard key={g._id} group={g} showActions={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Project List */}
              <div className="space-y-4">
                {projects.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 text-center text-gray-500">
                    No projects assigned to you yet.
                  </div>
                )}
                {projects.map((project) => {
                  const enrolled = getEnrolledStudents(project._id);
                  return (
                    <div key={project._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <h3 className="text-lg">{project.title}</h3>
                          <span className={project.status === 'open' ? 'text-green-600 text-sm' : 'text-gray-500 text-sm'}>
                            {project.status} · {enrolled.length}/{project.maxStudents} seats filled
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/supervisor/projects/${project._id}/view`}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                          >
                            View
                          </Link>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <p className="text-sm text-gray-700 mb-2">Group</p>
                        {enrolled.length === 0 ? (
                          <p className="text-sm text-gray-400">No students allocated yet.</p>
                        ) : (
                          <ul className="space-y-1">
                            {enrolled.map((a) => (
                              <li key={a._id} className="text-sm text-gray-700">
                                👤 {a.student.name} <span className="text-gray-400">({a.student.email})</span>
                              </li>
                            ))}
                          </ul>
                        )}
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
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}