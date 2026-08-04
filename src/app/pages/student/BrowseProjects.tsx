import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';

interface ProjectFile {
  url: string;
  name: string;
}

interface ApiProject {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'allocated' | 'closed';
  maxStudents: number;
  supervisor?: { name: string };
  files?: ProjectFile[];
}

interface ApiAllocation {
  _id: string;
  project: { _id: string } | string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApiGroup {
  _id: string;
  project: { _id: string } | string;
  status: 'pending' | 'approved' | 'rejected';
}

interface StudentResult {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

export default function BrowseProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [myAllocations, setMyAllocations] = useState<ApiAllocation[]>([]);
  const [myGroups, setMyGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

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

  const handleWithdraw = async (groupId: string) => {
    if (!confirm('Withdraw this request?')) return;
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

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 && (
                <p className="text-gray-500 col-span-full">No open projects available right now.</p>
              )}
              {projects.map((project) => {
                const allocation = getAllocationForProject(project._id);
                const group = getGroupForProject(project._id);

                let buttonLabel = 'Apply as a Group';
                let buttonDisabled = false;
                let showWithdraw = false;

                if (allocation) {
                  buttonLabel = allocation.status === 'approved' ? 'Approved' : 'Rejected';
                  buttonDisabled = true;
                } else if (group) {
                  buttonLabel = group.status === 'pending' ? 'Group Request Pending' : 'Approved';
                  buttonDisabled = true;
                  showWithdraw = group.status === 'pending';
                } else if (project.status !== 'open') {
                  buttonLabel = 'Not Available';
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
                      <span className="ml-3 text-gray-400">Max {project.maxStudents} student(s)</span>
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => openGroupModal(project._id)}
                        disabled={buttonDisabled}
                        className={`px-5 py-2 rounded-md ${
                          buttonDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                        }`}
                      >
                        {buttonLabel}
                      </button>

                      {showWithdraw && group && (
                        <button
                          onClick={() => handleWithdraw(group._id)}
                          disabled={withdrawingId === group._id}
                          className="px-5 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                        >
                          {withdrawingId === group._id ? 'Withdrawing...' : 'Withdraw'}
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
                    {searchResults.map((student) => (
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
                    ))}
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