import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
export default function StudentDashboard() {
  const [userName, setUserName] = useState('');

useEffect(() => {
  setUserName(localStorage.getItem('userName') || 'Student');
}, []);
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Current Project</div>
              <div className="text-3xl">1</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Assessments</div>
              <div className="text-3xl">2</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Submitted</div>
              <div className="text-3xl">5</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Mark</div>
              <div className="text-3xl">76%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Current Project */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Current Project</h2>
              <div className="mb-3">
                <div className="text-gray-600">Title</div>
                <div className="text-lg">AI-Based Recommendation System</div>
              </div>
              <div className="mb-3">
                <div className="text-gray-600">Supervisor</div>
                <div>Dr. Sarah Johnson</div>
              </div>
              <div className="mb-3">
                <div className="text-gray-600">Status</div>
                <span className="text-green-600">Active</span>
              </div>
              <div>
                <div className="text-gray-600">Progress</div>
                <div className="bg-gray-200 h-3 rounded-full mt-2">
                  <div className="bg-[#2563a8] h-3 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">65% Complete</div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Upcoming Deadlines</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                  <div>
                    <div>Project Proposal</div>
                    <div className="text-sm text-gray-600">Due: May 10, 2026</div>
                  </div>
                  <span className="text-orange-600">Pending</span>
                </div>
                <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                  <div>
                    <div>Literature Review</div>
                    <div className="text-sm text-gray-600">Due: May 15, 2026</div>
                  </div>
                  <span className="text-orange-600">Pending</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <div>Mid-term Presentation</div>
                    <div className="text-sm text-gray-600">Due: May 25, 2026</div>
                  </div>
                  <span className="text-gray-500">Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
