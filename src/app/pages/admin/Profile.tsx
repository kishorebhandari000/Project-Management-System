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
              <h1 className="text-2xl">Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
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
          <div className="max-w-3xl mx-auto">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-3xl">
                  AD
                </div>
                <div>
                  <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] mr-3">
                    Change Photo
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Personal Information</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      defaultValue="Admin"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      defaultValue="User"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    defaultValue="admin@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    defaultValue="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    defaultValue="Administration"
                  />
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Change Password</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Confirm new password"
                  />
                </div>
              </form>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
