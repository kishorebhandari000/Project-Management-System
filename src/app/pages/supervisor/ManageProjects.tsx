import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Paperclip } from 'lucide-react';
import { api } from '../../lib/api';
import { useCommentPrompt } from '../../hooks/useCommentPrompt';
import { useConfirm } from '../../hooks/useConfirm';

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
  comment?: string;
  decidedBy?: string;
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decidingGroupId, setDecidingGroupId] = useState<string | null>(null);
  const [undoingGroupId, setUndoingGroupId] = useState<string | null>(null);
  const promptComment = useCommentPrompt();
  const confirm = useConfirm();
  const currentUserId = localStorage.getItem('userId');

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
    const comment = await promptComment({
      title: decision === 'approved' ? 'Recommend to admin' : 'Reject group request',
      message:
        decision === 'approved'
          ? 'Add a note for the admin on why you\'re recommending this group.'
          : 'Let the students know why this group is being rejected.',
      confirmLabel: decision === 'approved' ? 'Recommend' : 'Reject',
      variant: decision === 'rejected' ? 'danger' : 'default',
      required: true,
    });
    if (comment === null) return;

    setDecidingGroupId(id);
    try {
      await api.put(`/groups/${id}/decision`, { decision, comment });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update group request');
    } finally {
      setDecidingGroupId(null);
    }
  };

  const handleUndoDecision = async (id: string) => {
    if (
      !(await confirm({
        message: 'Undo this decision and send the group back to pending review?',
        confirmLabel: 'Undo Decision',
      }))
    )
      return;

    setUndoingGroupId(id);
    try {
      await api.put(`/groups/${id}/undo-decision`, {});
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to undo decision');
    } finally {
      setUndoingGroupId(null);
    }
  };

  const pendingGroups = groups.filter((g) => g.status === 'pending');
  const forwardedGroups = groups.filter((g) => g.status === 'supervisor_approved');
  const decidedGroups = groups.filter((g) => g.status === 'approved' || g.status === 'rejected');

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

  const GroupCard = ({ group, showActions }: { group: ApiGroup; showActions: boolean }) => {
    const canUndo =
      (group.status === 'supervisor_approved' || group.status === 'rejected') &&
      group.decidedBy === currentUserId;

    return (
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
            <li key={m._id} className="text-sm text-gray-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {m.name} {m._id === group.leader?._id && <span className="text-xs text-gray-400">(leader)</span>}
              <span className="text-gray-400"> — {m.studentId || m.email}</span>
            </li>
          ))}
        </ul>

        {!showActions && group.comment && (
          <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-4">
            <p className="text-xs text-gray-500 mb-0.5">Your comment</p>
            <p className="text-sm text-gray-700">{group.comment}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleGroupDecision(group._id, 'approved')}
              disabled={decidingGroupId === group._id}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-60"
            >
              Recommend to Admin
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleGroupDecision(group._id, 'rejected')}
              disabled={decidingGroupId === group._id}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-60"
            >
              Reject
            </motion.button>
          </div>
        )}

        {canUndo && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleUndoDecision(group._id)}
            disabled={undoingGroupId === group._id}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm disabled:opacity-60"
          >
            {undoingGroupId === group._id ? 'Undoing...' : 'Undo Decision'}
          </motion.button>
        )}
      </div>
    );
  };

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
              <Link
                to="/supervisor/projects/students"
                className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-sm"
              >
                My Students
              </Link>
              <NotificationBell role="supervisor" />
              <ProfileAvatar role="supervisor" />
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
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl">Pending Your Review ({pendingGroups.length})</h2>
                </div>
                <div className="p-6 space-y-4">
                  {pendingGroups.length === 0 && (
                    <p className="text-gray-400 text-sm">No pending group requests.</p>
                  )}
                  {pendingGroups.map((g, i) => (
                    <motion.div
                      key={g._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                    >
                      <GroupCard group={g} showActions />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {forwardedGroups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl">Awaiting Admin Allocation ({forwardedGroups.length})</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {forwardedGroups.map((g) => (
                      <GroupCard key={g._id} group={g} showActions={false} />
                    ))}
                  </div>
                </motion.div>
              )}

              {decidedGroups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.16 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl">Decided ({decidedGroups.length})</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {decidedGroups.map((g) => (
                      <GroupCard key={g._id} group={g} showActions={false} />
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {projects.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 text-center text-gray-500">
                    No projects assigned to you yet.
                  </div>
                )}
                {projects.map((project, i) => {
                  const enrolled = getEnrolledStudents(project._id);
                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.24 + Math.min(i, 8) * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                    >
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
                              <li key={a._id} className="text-sm text-gray-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {a.student.name} <span className="text-gray-400">({a.student.email})</span>
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
                                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#2563a8] hover:underline text-sm inline-flex items-center gap-1">
                                  <Paperclip className="w-3.5 h-3.5" /> {f.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
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