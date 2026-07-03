import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function ManageAllocation() {
  const allocations = [
    { id: 1, group: 'Group 1', memberCount: 2, project: 'AI-Based Recommendation System', supervisor: 'Dr. Sarah Johnson', status: 'Approved' },
    { id: 2, group: 'Group 2', memberCount: 3, project: 'E-commerce Platform', supervisor: 'Dr. Sarah Johnson', status: 'Approved' },
    { id: 3, group: 'Group 3', memberCount: 2, project: 'Machine Learning for Medical Diagnosis', supervisor: 'Dr. Emily Chen', status: 'Pending' },
    { id: 4, group: 'Group 4', memberCount: 5, project: 'Blockchain-Based Voting System', supervisor: 'Prof. Michael Brown', status: 'Pending' },
  ];

  const unallocatedGroups = [
    { id: 1, name: 'Group 5', memberCount: 4 },
    { id: 2, name: 'Group 6', memberCount: 3 },
    { id: 3, name: 'Group 7', memberCount: 1 },
  ];

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Allocation</h1>
              <p className="text-gray-600">Allocate groups to projects and supervisors</p>
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
          {/* Current Allocations */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl">Current Allocations</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Group Name</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Size</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Project</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Supervisor</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{allocation.group}</td>
                    <td className="px-6 py-4">{allocation.memberCount} members</td>
                    <td className="px-6 py-4">{allocation.project}</td>
                    <td className="px-6 py-4">{allocation.supervisor}</td>
                    <td className="px-6 py-4">
                      <span className={allocation.status === 'Approved' ? 'text-green-600' : 'text-orange-600'}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {allocation.status === 'Pending' && (
                          <>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                              Approve
                            </button>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                              Reject
                            </button>
                          </>
                        )}
                        {allocation.status === 'Approved' && (
                          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unallocated Groups */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-5">Unallocated Groups</h2>
            <div className="space-y-3">
              {unallocatedGroups.map((group) => (
                <div key={group.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <div>{group.name}</div>
                    <div className="text-sm text-gray-500">{group.memberCount} members</div>
                  </div>
                  <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                    Assign Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
