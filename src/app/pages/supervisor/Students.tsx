import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: string;
  student: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
  };
  project: {
    _id: string;
    title: string;
    status: 'open' | 'allocated' | 'closed';
  };
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

export default function SupervisorStudents() {
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/allocations?status=approved');
        setAllocations(data.allocations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const matchesSearch = (a: ApiAllocation) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      a.student.name.toLowerCase().includes(term) ||
      a.student.email.toLowerCase().includes(term) ||
      (a.student.studentId?.toLowerCase().includes(term) ?? false) ||
      a.project.title.toLowerCase().includes(term)
    );
  };

  const current = allocations.filter((a) => a.project.status !== 'closed' && matchesSearch(a));
  const past = allocations.filter((a) => a.project.status === 'closed' && matchesSearch(a));

  const messageStudent = (studentId: string) => {
    navigate(`/supervisor/messages?contact=${studentId}`);
  };

  const StudentRow = ({ allocation, delay = 0 }: { allocation: ApiAllocation; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between gap-4 border border-gray-100 rounded-md px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-sm shrink-0">
          {initials(allocation.student.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate">{allocation.student.name}</div>
          <div className="text-sm text-gray-500 truncate">
            {allocation.student.studentId ? `${allocation.student.studentId} · ` : ''}
            {allocation.student.email}
          </div>
          <div className="text-xs text-gray-400 truncate">{allocation.project.title}</div>
        </div>
      </div>
      <button
        onClick={() => messageStudent(allocation.student._id)}
        className="px-4 py-2 rounded-md bg-[#2563a8] text-white text-sm hover:bg-[#1e4a8a] shrink-0"
      >
        Message
      </button>
    </motion.div>
  );

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">My Students</h1>
              <p className="text-gray-600">Everyone who has ever been allocated to one of your projects</p>
            </div>
            <div className="flex items-center gap-4">
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

          {!loading && !error && (
            <>
              <div className="mb-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, student ID, or project..."
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl">Current Students ({current.length})</h2>
                </div>
                <div className="p-6 space-y-3">
                  {current.length === 0 && (
                    <p className="text-gray-400 text-sm">No current students on your active projects.</p>
                  )}
                  {current.map((a, i) => (
                    <StudentRow key={a._id} allocation={a} delay={Math.min(i, 8) * 0.05} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl">Past Students ({past.length})</h2>
                </div>
                <div className="p-6 space-y-3">
                  {past.length === 0 && (
                    <p className="text-gray-400 text-sm">No students on closed projects yet.</p>
                  )}
                  {past.map((a, i) => (
                    <StudentRow key={a._id} allocation={a} delay={0.08 + Math.min(i, 8) * 0.05} />
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
