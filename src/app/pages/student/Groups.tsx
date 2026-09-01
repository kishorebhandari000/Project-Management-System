import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';
import ProfileAvatar from '../../components/ProfileAvatar';

interface GroupMember {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

interface ApiGroup {
  _id: string;
  name: string;
  status: 'pending' | 'supervisor_approved' | 'approved' | 'rejected';
  project: { _id: string; title: string };
  leader: GroupMember;
  members: GroupMember[];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

const STATUS_LABEL: Record<ApiGroup['status'], string> = {
  pending: 'Pending supervisor review',
  supervisor_approved: 'Pending final allocation',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function StudentGroups() {
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/groups/my');
        setGroups(data.groups.filter((g: ApiGroup) => g.status !== 'rejected'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const messageMember = (userId: string) => {
    navigate(`/student/messages?contact=${userId}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">My Group</h1>
              <p className="text-gray-600">Your teammates and how to reach them</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="student" />
              <ProfileAvatar role="student" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && <p className="text-gray-500">Loading...</p>}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && !error && groups.length === 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 mb-3">You're not part of a group yet.</p>
              <Link to="/student/projects" className="text-[#2563a8] hover:underline">
                Browse available projects
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {groups.map((group, gi) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: gi * 0.08 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-xl">{group.name || group.project.title}</h2>
                    <p className="text-gray-600 text-sm">{group.project.title}</p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded shrink-0 ${
                      group.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {STATUS_LABEL[group.status]}
                  </span>
                </div>

                <div className="space-y-3">
                  {group.members.map((member, mi) => {
                    const isSelf = member._id === currentUserId;
                    const isLeader = member._id === group.leader._id;
                    return (
                      <motion.div
                        key={member._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(mi, 8) * 0.05 }}
                        className="flex items-center justify-between gap-4 border border-gray-100 rounded-md px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-sm shrink-0">
                            {initials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{member.name}</span>
                              {isLeader && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded shrink-0">Leader</span>
                              )}
                              {isSelf && <span className="text-xs text-gray-400 shrink-0">(you)</span>}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {member.studentId ? `${member.studentId} · ` : ''}
                              {member.email}
                            </div>
                          </div>
                        </div>
                        {!isSelf && (
                          <button
                            onClick={() => messageMember(member._id)}
                            className="px-4 py-2 rounded-md bg-[#2563a8] text-white text-sm hover:bg-[#1e4a8a] shrink-0"
                          >
                            Message
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
