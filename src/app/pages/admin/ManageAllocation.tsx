import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

const allocations = [
  { id: 1, student: 'John Doe', supervisor: 'Dr. Sarah Johnson', project: 'AI-Based Recommendation System', status: 'Allocated' },
  { id: 2, student: 'Jane Smith', supervisor: 'Dr. Sarah Johnson', project: 'E-commerce Platform', status: 'Allocated' },
  { id: 3, student: 'Mike Johnson', supervisor: 'Dr. Sarah Johnson', project: 'Mobile Health App', status: 'Allocated' },
  { id: 4, student: 'Alice Williams', supervisor: 'Unassigned', project: 'Unassigned', status: 'Pending' },
  { id: 5, student: 'Bob Chen', supervisor: 'Unassigned', project: 'Unassigned', status: 'Pending' },
];

export default function ManageAllocation() {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Allocation</h1>
              <p className="text-gray-600">Assign students to supervisors and projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Students</div>
              <div className="text-3xl">{allocations.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Allocated</div>
              <div className="text-3xl text-green-600">{allocations.filter(a => a.status === 'Allocated').length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending</div>
              <div className="text-3xl text-orange-600">{allocations.filter(a => a.status === 'Pending').length}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4">Student</th>
                  <th className="text-left px-6 py-4">Supervisor</th>
                  <th className="text-left px-6 py-4">Project</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id} className="border-t border-gray-200">
                    <td className="px-6 py-4">{a.student}</td>
                    <td className="px-6 py-4">
                      {a.status === 'Pending' ? (
                        <select className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:border-[#2563a8] text-sm">
                          <option>Select supervisor</option>
                          <option>Dr. Sarah Johnson</option>
                          <option>Dr. Emily Chen</option>
                          <option>Prof. Michael Brown</option>
                        </select>
                      ) : a.supervisor}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.project}</td>
                    <td className="px-6 py-4">
                      <span className={a.status === 'Allocated' ? 'text-green-600' : 'text-orange-600'}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === 'Pending' ? (
                        <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-sm">
                          Assign
                        </button>
                      ) : (
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
