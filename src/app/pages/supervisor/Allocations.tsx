import Sidebar from '../../components/Sidebar';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  project: { title: string };
  student: { name: string; email: string };
}

export default function SupervisorAllocations() {
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAllocations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/allocations');
      setAllocations(data.allocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected' | 'pending') => {
    try {
      await api.put(`/allocations/${id}/decision`, { decision });
      await loadAllocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  const pending = allocations.filter((a) => a.status === 'pending');
  const decided = allocations.filter((a) => a.status !== 'pending');

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Pending Applications</h1>
              <p className="text-gray-600">Approve or reject student requests to join your projects</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="supervisor" />
              <ProfileAvatar role="supervisor" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && <p className="text-gray-500">Loading applications...</p>}
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
                  <h2 className="text-xl">Pending ({pending.length})</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Project</th>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                          No pending applications.
                        </td>
                      </tr>
                    )}
                    {pending.map((allocation, i) => (
                      <motion.tr
                        key={allocation._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                        className="border-b border-gray-200"
                      >
                        <td className="px-6 py-4">{allocation.student?.name}</td>
                        <td className="px-6 py-4">{allocation.project?.title}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleDecision(allocation._id, 'approved')}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleDecision(allocation._id, 'rejected')}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                              Reject
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl">Decided</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Project</th>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                      <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decided.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                          No decided applications yet.
                        </td>
                      </tr>
                    )}
                    {decided.map((allocation, i) => (
                      <motion.tr
                        key={allocation._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                        className="border-b border-gray-200"
                      >
                        <td className="px-6 py-4">{allocation.student?.name}</td>
                        <td className="px-6 py-4">{allocation.project?.title}</td>
                        <td className="px-6 py-4">
                          <span className={allocation.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                            {allocation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDecision(allocation._id, 'pending')}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                          >
                            Undo
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
