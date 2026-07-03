import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function SupervisorDashboard() {
  const students = [
    { id: 1, name: 'John Doe', project: 'AI-Based Recommendation System', progress: 65 },
    { id: 2, name: 'Jane Smith', project: 'E-commerce Platform', progress: 45 },
    { id: 3, name: 'Mike Johnson', project: 'Mobile Health App', progress: 80 },
  ];

  const requests = [
    { id: 1, student: 'Alice Williams', project: 'Machine Learning for Medical Diagnosis', date: 'May 1, 2026' },
    { id: 2, student: 'Bob Chen', project: 'Blockchain-Based Voting System', date: 'April 30, 2026' },
  ];

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Supervisor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. Sarah Johnson</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl">5</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Students</div>
              <div className="text-3xl">3</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Requests</div>
              <div className="text-3xl">2</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">To Review</div>
              <div className="text-3xl">4</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* My Students */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">My Students</h2>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="mb-2">{student.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{student.project}</div>
                    <div className="bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-[#2563a8] h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{student.progress}% Complete</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Requests */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Student Requests</h2>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="mb-1">{request.student}</div>
                    <div className="text-sm text-gray-600 mb-2">{request.project}</div>
                    <div className="text-xs text-gray-500 mb-3">Requested: {request.date}</div>
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl mb-5">Pending Reviews</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <div>John Doe - Project Proposal</div>
                  <div className="text-sm text-gray-600">Submitted: May 1, 2026</div>
                </div>
                <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a]">
                  Review
                </button>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <div>Jane Smith - Literature Review</div>
                  <div className="text-sm text-gray-600">Submitted: April 30, 2026</div>
                </div>
                <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a]">
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
