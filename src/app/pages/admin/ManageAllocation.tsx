import Sidebar from '../../components/Sidebar';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'lucide-react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import { useConfirm } from '../../hooks/useConfirm';
import { useCommentPrompt } from '../../hooks/useCommentPrompt';

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
  maxStudents: number;
}

interface ApiUser {
  _id: string;
  name: string;
  email: string;
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
  supervisor: { name: string };
  leader: { _id: string; name: string };
  members: Member[];
  comment?: string;
}

export default function ManageAllocation() {
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [students, setStudents] = useState<ApiUser[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decidingGroupId, setDecidingGroupId] = useState<string | null>(null);
  const [undoingGroupId, setUndoingGroupId] = useState<string | null>(null);
  const confirm = useConfirm();
  const promptComment = useCommentPrompt();

  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [allocationsRes, projectsRes, studentsRes, groupsRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/projects'),
        api.get('/users?role=student'),
        api.get('/groups'),
      ]);
      setAllocations(allocationsRes.allocations);
      setProjects(projectsRes.projects);
      setStudents(studentsRes.users);
      setGroups(groupsRes.groups);
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
    let comment: string | undefined;
    if (decision === 'rejected') {
      const result = await promptComment({
        title: 'Reject allocation',
        message: 'Let the student know why this request is being rejected.',
        confirmLabel: 'Reject',
        variant: 'danger',
        required: true,
      });
      if (result === null) return;
      comment = result;
    }

    try {
      await api.put(`/allocations/${id}/decision`, { decision, comment });
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update allocation');
    }
  };

  const handleGroupDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setDecidingGroupId(id);
    try {
      await api.put(`/groups/${id}/decision`, { decision });
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to finalize group');
    } finally {
      setDecidingGroupId(null);
    }
  };

  const handleUndoGroupAllocation = async (id: string) => {
    if (!(await confirm({
      title: 'Undo allocation',
      message: 'This releases the seats it locked in and sends the group back for a new decision.',
      confirmLabel: 'Undo',
      variant: 'danger',
    }))) return;
    setUndoingGroupId(id);
    try {
      await api.put(`/groups/${id}/undo`, {});
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to undo allocation');
    } finally {
      setUndoingGroupId(null);
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

  const awaitingFinalAllocation = groups.filter((g) => g.status === 'supervisor_approved');
  const approvedGroups = groups.filter((g) => g.status === 'approved');

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
              <NotificationBell role="admin" />

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

          {!loading && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl">Groups Awaiting Final Allocation ({awaitingFinalAllocation.length})</h2>
                <p className="text-sm text-gray-500">Recommended by the supervisor — approve to lock in the seats.</p>
              </div>

              <div className="p-6 space-y-4">
                {awaitingFinalAllocation.length === 0 && (
                  <p className="text-gray-400 text-sm">Nothing waiting on final allocation right now.</p>
                )}
                {awaitingFinalAllocation.map((group, i) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-lg">{group.name || 'Untitled Group'}</h3>
                        <p className="text-sm text-gray-600">
                          {group.project.title} · Supervisor: {group.supervisor?.name}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700">
                        {group.members.length}/{group.project.maxStudents} seats
                      </span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {group.members.map((m) => (
                        <li key={m._id} className="flex items-center gap-1 text-sm text-gray-700">
                          <User className="w-3.5 h-3.5 text-gray-400" /> {m.name} {m._id === group.leader._id && <span className="text-xs text-gray-400">(leader)</span>}
                          <span className="text-gray-400"> — {m.studentId || m.email}</span>
                        </li>
                      ))}
                    </ul>

                    {group.comment && (
                      <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2 mb-4">
                        <p className="text-xs text-blue-700 mb-0.5">Supervisor's comment</p>
                        <p className="text-sm text-blue-900">{group.comment}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleGroupDecision(group._id, 'approved')}
                        disabled={decidingGroupId === group._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-60"
                      >
                        {decidingGroupId === group._id ? 'Allocating...' : 'Approve Final Allocation'}
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {!loading && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl">Approved Groups ({approvedGroups.length})</h2>
                <p className="text-sm text-gray-500">Finalized allocations — undo to release the seats and send back for a new decision.</p>
              </div>

              <div className="p-6 space-y-4">
                {approvedGroups.length === 0 && (
                  <p className="text-gray-400 text-sm">No finalized group allocations right now.</p>
                )}
                {approvedGroups.map((group, i) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-lg">{group.name || 'Untitled Group'}</h3>
                        <p className="text-sm text-gray-600">
                          {group.project.title} · Supervisor: {group.supervisor?.name}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded bg-green-100 text-green-700">
                        {group.members.length}/{group.project.maxStudents} seats
                      </span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {group.members.map((m) => (
                        <li key={m._id} className="flex items-center gap-1 text-sm text-gray-700">
                          <User className="w-3.5 h-3.5 text-gray-400" /> {m.name} {m._id === group.leader._id && <span className="text-xs text-gray-400">(leader)</span>}
                          <span className="text-gray-400"> — {m.studentId || m.email}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUndoGroupAllocation(group._id)}
                      disabled={undoingGroupId === group._id}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm disabled:opacity-60"
                    >
                      {undoingGroupId === group._id ? 'Undoing...' : 'Undo Allocation'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl mb-1">Force-Assign a Student</h2>
            <p className="text-sm text-gray-500 mb-4">
              Directly assign a student to a project. This bypasses the normal request flow and creates an
              already-approved allocation - use it as a safety net. Any other approved allocation the student
              currently holds is cleared.
            </p>
            <AnimatePresence>
              {assignError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4"
                >
                  {assignError}
                </motion.div>
              )}
              {assignSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4"
                >
                  {assignSuccess}
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleForceAssign} className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-gray-700 mb-2 text-sm">Student</label>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8] sm:min-w-[220px]"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-gray-700 mb-2 text-sm">Project</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8] sm:min-w-[220px]"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={assigning || !assignProjectId || !assignStudentId}
                className="w-full sm:w-auto bg-[#2563a8] text-white px-6 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign & Approve'}
              </motion.button>
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
                  {allocations.map((allocation, i) => (
                    <motion.tr
                      key={allocation._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                      className="border-b border-gray-200"
                    >
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
                    </motion.tr>
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