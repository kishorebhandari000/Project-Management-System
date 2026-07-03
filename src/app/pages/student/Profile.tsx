import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Profile() {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                JD
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
                  JD
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
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      defaultValue="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                    defaultValue="STU2024001"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    defaultValue="john.doe@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    defaultValue="+1 234 567 8901"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                      defaultValue="Computer Science"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                      defaultValue="Final Year"
                      disabled
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Academic Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Current Project</span>
                  <span>AI-Based Recommendation System</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Supervisor</span>
                  <span>Dr. Sarah Johnson</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">GPA</span>
                  <span>3.8 / 4.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Progress</span>
                  <span>65%</span>
                </div>
              </div>
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
