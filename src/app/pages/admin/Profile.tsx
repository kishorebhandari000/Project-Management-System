import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Profile() {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Admin Profile</h1>
              <p className="text-gray-600">Manage your account</p>
            </div>
            <Link to="/admin/notifications" className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                <span className="text-xl">🔔</span>
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
            </Link>
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-20 h-20 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-3xl">
                AD
              </div>
              <div>
                <h2 className="text-2xl">Admin User</h2>
                <p className="text-gray-500">System Administrator</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-gray-600 mb-2">Full Name</label>
                <input type="text" defaultValue="Admin User" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]" />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Email</label>
                <input type="email" defaultValue="admin@university.edu" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]" />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Admin ID</label>
                <input type="text" defaultValue="ADM-001" readOnly className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50" />
              </div>
              <div className="pt-4">
                <button className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
