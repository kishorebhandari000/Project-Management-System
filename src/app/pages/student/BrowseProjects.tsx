import Sidebar from '../../components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';
import ProfileAvatar from '../../components/ProfileAvatar';
import { useConfirm } from '../../hooks/useConfirm';

interface ProjectFile {
  url: string;
  name: string;
}

interface OpenGroup {
  id: string;
  name: string;
  memberCount: number;
}

interface ApiProject {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'allocated' | 'closed';
  maxStudents: number;
  approvedCount: number;
  appliedCount: number;
  openGroups: OpenGroup[];
  groupCount: number;
  maxGroupsPerProject: number;
  supervisor?: { name: string };
  files?: ProjectFile[];
}

interface ApiAllocation {
  _id: string;
  project: { _id: string } | string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

interface ApiGroup {
  _id: string;
  project: { _id: string } | string;
  status: 'pending' | 'approved' | 'rejected';
  leader: { _id: string };
  comment?: string;
}

interface StudentResult {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  alreadyCommitted: boolean;
}

export default function BrowseProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [myAllocations, setMyAllocations] = useState<ApiAllocation[]>([]);
  const [myGroups, setMyGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('userId');
  const confirm = useConfirm();

  // Group application modal state
  const [groupModalProjectId, setGroupModalProjectId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<StudentResult[]>([]);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [groupError, setGroupError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, allocationsRes, groupsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/allocations'),
        api.get('/groups/my'),
      ]);
      setProjects(projectsRes.projects);
      setMyAllocations(allocationsRes.allocations);
      setMyGroups(groupsRes.groups);
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

  const getGroupForProject = (projectId: string) => {
    return myGroups.find((g) => {
      const pId = typeof g.project === 'string' ? g.project : g.project._id;
      return pId === projectId && g.status !== 'rejected';
    });
  };

  // Rejected groups are excluded from getGroupForProject above so the
  // project stays applyable/joinable again - but we still want to surface
  // the supervisor's rejection reason. myGroups is sorted newest-first.
  const getRejectedGroupForProject = (projectId: string) => {
    return myGroups.find((g) => {
      const pId = typeof g.project === 'string' ? g.project : g.project._id;
      return pId === projectId && g.status === 'rejected' && g.comment;
    });
  };

  const handleWithdraw = async (groupId: string) => {
    if (!(await confirm({ message: 'Withdraw this request?', variant: 'danger', confirmLabel: 'Withdraw' }))) return;
    setWithdrawingId(groupId);
    try {
      await api.delete(`/groups/${groupId}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw request');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!(await confirm({ message: 'Leave this group?', variant: 'danger', confirmLabel: 'Leave' }))) return;
    setLeavingId(groupId);
    setError('');
    try {
      await api.delete(`/groups/${groupId}/leave`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
    } finally {
      setLeavingId(null);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoiningId(groupId);
    setError('');
    try {
      await api.post(`/groups/${groupId}/join`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setJoiningId(null);
    }
  };

  const openGroupModal = (projectId: string) => {
    setGroupModalProjectId(projectId);
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMembers([]);
    setGroupError('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.get(`/users/search-students?q=${encodeURIComponent(value.trim())}`);
        setSearchResults(data.users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const addMember = (student: StudentResult) => {
    if (student.alreadyCommitted) return;
    if (selectedMembers.some((m) => m._id === student._id)) return;
    setSelectedMembers([...selectedMembers, student]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMember = (id: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m._id !== id));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupModalProjectId) return;
    setGroupError('');
    setGroupSubmitting(true);

    try {
      await api.post('/groups', {
        project: groupModalProjectId,
        name: groupName,
        memberIds: selectedMembers.map((m) => m._id),
      });
      setGroupModalProjectId(null);
      await loadData();
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Failed to submit group request');
    } finally {
      setGroupSubmitting(false);
    }
  };

  const activeProject = projects.find((p) => p._id === groupModalProjectId);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Browse Projects</h1>
              <p className="text-gray-600">Explore available final year projects</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="student" />
              <ProfileAvatar role="student" />
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

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 && (
                <p className="text-gray-500 col-span-full">No open projects available right now.</p>
              )}
              {projects.map((project) => {
                const allocation = getAllocationForProject(project._id);
                const group = getGroupForProject(project._id);
                const isLeader = !!group && group.leader._id === currentUserId;

                const isFull = project.status === 'allocated' || project.approvedCount >= project.maxStudents;
                const atGroupCap = project.groupCount >= project.maxGroupsPerProject;
                const canApply = !allocation && !group && project.status === 'open' && !isFull && !atGroupCap;
                const rejectedGroup = !group ? getRejectedGroupForProject(project._id) : undefined;

                return (
                  <div key={project._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg pr-4">{project.title}</h3>
                      <span className={`text-sm px-3 py-1 rounded ${
                        isFull || project.status !== 'open' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                      }`}>
                        {project.status === 'closed' ? 'closed' : isFull ? 'full' : 'open'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <span>Supervisor: </span>
                      <span>{project.supervisor?.name || 'Unassigned'}</span>
                      <span className="ml-3 text-gray-400">
                        {project.appliedCount}/{project.maxStudents}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{project.description}</p>

                    {rejectedGroup && (
                      <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                        <p className="text-xs text-red-700 mb-0.5">Your previous group request was rejected</p>
                        <p className="text-sm text-red-900">{rejectedGroup.comment}</p>
                      </div>
                    )}

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

                    {allocation?.status === 'rejected' && allocation.comment && (
                      <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                        <p className="text-xs text-red-700 mb-0.5">Your request was rejected</p>
                        <p className="text-sm text-red-900">{allocation.comment}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {allocation && (
                        <button disabled className="px-5 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed">
                          {allocation.status === 'approved' ? 'Approved' : 'Rejected'}
                        </button>
                      )}

                      {!allocation && group && (
                        <>
                          <button disabled className="px-5 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed">
                            {group.status === 'pending' ? 'Group Request Pending' : 'Approved'}
                          </button>
                          {group.status === 'pending' && isLeader && (
                            <button
                              onClick={() => handleWithdraw(group._id)}
                              disabled={withdrawingId === group._id}
                              className="px-5 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                            >
                              {withdrawingId === group._id ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                          )}
                          {group.status === 'pending' && !isLeader && (
                            <button
                              onClick={() => handleLeaveGroup(group._id)}
                              disabled={leavingId === group._id}
                              className="px-5 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                            >
                              {leavingId === group._id ? 'Leaving...' : 'Leave Group'}
                            </button>
                          )}
                        </>
                      )}

                      {!allocation && !group && project.status === 'closed' && (
                        <button disabled className="px-5 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed">
                          Closed
                        </button>
                      )}

                      {!allocation && !group && project.status !== 'closed' && isFull && (
                        <button disabled className="px-5 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed">
                          Project Full
                        </button>
                      )}

                      {!allocation && !group && project.status === 'open' && !isFull && project.openGroups.map((og) => (
                        <button
                          key={og.id}
                          onClick={() => handleJoinGroup(og.id)}
                          disabled={joiningId === og.id}
                          className="px-5 py-2 rounded-md bg-[#2563a8] text-white hover:bg-[#1e4a8a] disabled:opacity-60"
                        >
                          {joiningId === og.id ? 'Joining...' : `Join "${og.name || 'Group'}" (${og.memberCount}/${project.maxStudents})`}
                        </button>
                      ))}

                      {canApply && (
                        <button
                          onClick={() => openGroupModal(project._id)}
                          className="px-5 py-2 rounded-md bg-[#2563a8] text-white hover:bg-[#1e4a8a]"
                        >
                          {project.openGroups.length > 0 ? 'Start a New Group' : 'Apply as a Group'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {groupModalProjectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl mb-1">Apply as a Group</h2>
            <p className="text-gray-600 text-sm mb-5">
              {activeProject?.title} — max {activeProject?.maxStudents} student(s)
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              {groupError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  {groupError}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Team Innovate"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Add Teammates (optional)</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, email, or student ID..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                />

                {searching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}

                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto">
                    {searchResults.map((student) =>
                      student.alreadyCommitted ? (
                        <div
                          key={student._id}
                          className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 opacity-50 cursor-not-allowed"
                        >
                          <div className="text-sm text-gray-500">
                            {student.name} <span className="text-xs">(already in a group)</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {student.studentId ? `${student.studentId} · ` : ''}{student.email}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          key={student._id}
                          onClick={() => addMember(student)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-sm">{student.name}</div>
                          <div className="text-xs text-gray-500">
                            {student.studentId ? `${student.studentId} · ` : ''}{student.email}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map((m) => (
                      <span
                        key={m._id}
                        className="bg-blue-50 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {m.name}
                        <button
                          type="button"
                          onClick={() => removeMember(m._id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  You'll be included automatically as the group leader.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalProjectId(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={groupSubmitting}
                  className="flex-1 bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                >
                  {groupSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}