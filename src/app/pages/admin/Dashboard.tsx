import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
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
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Students</div>
              <div className="text-3xl">48</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Supervisors</div>
              <div className="text-3xl">12</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl">35</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Allocations</div>
              <div className="text-3xl text-orange-600">8</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { text: 'John Doe submitted Project Proposal', time: '2h ago' },
                  { text: 'New user registered: alice@student.edu', time: '3h ago' },
                  { text: 'Project "IoT Smart Home" created', time: '1d ago' },
                  { text: 'Mike Johnson allocated to Dr. Sarah Johnson', time: '2d ago' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{item.text}</span>
                    <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/users" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="text-sm">Manage Users</div>
                </Link>
                <Link to="/admin/projects/create" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-sm">Create Project</div>
                </Link>
                <Link to="/admin/allocation" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm">Manage Allocation</div>
                </Link>
                <Link to="/admin/reports" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">View Reports</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
