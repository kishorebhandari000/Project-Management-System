import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const recentAllocations = [
    { id: 1, group: 'Group 1', memberCount: 3, project: 'AI-Based Recommendation System', supervisor: 'Dr. Sarah Johnson', date: 'April 15, 2026' },
    { id: 2, group: 'Group 2', memberCount: 2, project: 'E-commerce Platform', supervisor: 'Dr. Sarah Johnson', date: 'April 12, 2026' },
    { id: 3, group: 'Group 3', memberCount: 4, project: 'Mobile Health App', supervisor: 'Dr. Emily Chen', date: 'April 10, 2026' },
  ];

  const assessments = [
    { id: 1, title: 'Project Proposal', dueDate: 'May 10, 2026', submissions: 28, total: 35 },
    { id: 2, title: 'Literature Review', dueDate: 'May 15, 2026', submissions: 20, total: 35 },
    { id: 3, title: 'Mid-term Presentation', dueDate: 'May 25, 2026', submissions: 0, total: 35 },
  ];

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and statistics</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Groups</div>
              <div className="text-3xl">35</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Supervisors</div>
              <div className="text-3xl">24</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl">98</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Requests</div>
              <div className="text-3xl">12</div>
            </div>
          </div>

          {/* Recent Allocations */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl">Recent Project Allocations</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 border-b border-gray-200">Group</th>
                  <th className="text-left px-6 py-3 border-b border-gray-200">Project</th>
                  <th className="text-left px-6 py-3 border-b border-gray-200">Supervisor</th>
                  <th className="text-left px-6 py-3 border-b border-gray-200">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">
                      <div>{allocation.group}</div>
                      <div className="text-sm text-gray-500">{allocation.memberCount} members</div>
                    </td>
                    <td className="px-6 py-4">{allocation.project}</td>
                    <td className="px-6 py-4">{allocation.supervisor}</td>
                    <td className="px-6 py-4">{allocation.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assessment Overview */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-5">Assessment Overview</h2>
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="mb-1">{assessment.title}</div>
                      <div className="text-sm text-gray-600">Due: {assessment.dueDate}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {assessment.submissions}/{assessment.total} submitted
                    </div>
                  </div>
                  <div className="bg-gray-200 h-3 rounded-full">
                    <div
                      className="bg-[#2563a8] h-3 rounded-full"
                      style={{ width: `${(assessment.submissions / assessment.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
