import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  project: { title: string };
  student: { name: string; email: string };
  supervisor: { name: string };
}

export default function ManageAllocation() {
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
      setError(err instanceof Error ? err.message : 'Failed to load allocations');
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
      alert(err instanceof Error ? err.message : 'Failed to update allocation');
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Allocation</h1>
              <p className="text-gray-600">Approve or reject student requests to join projects</p>
            </div>
            <div className="flex items-center gap-4">
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
          {loading && <p className="text-gray-500">Loading allocations...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!loading && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl">Allocation Requests</h2>
              </div>
              <table className="w-full">
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
                        No allocation requests yet.
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
              </table>
            </div>
          )}

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-2">Group-based allocation</h2>
            <p className="text-sm text-gray-500">
              The original design assumed teams/groups of students sharing one project. The current backend only supports one student per allocation request. Group support (multiple students per project, assigning whole unallocated groups at once) can be added as a separate future job if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}