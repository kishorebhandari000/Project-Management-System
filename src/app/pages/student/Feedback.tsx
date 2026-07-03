import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Feedback() {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Feedback & Marks</h1>
              <p className="text-gray-600">View your assessment results</p>
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

        <div className="p-8 space-y-6">
          {/* Released Marks */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-5">Design Specification</h2>

            <div className="mb-5">
              <div className="text-gray-600 mb-2">Your Mark</div>
              <div className="text-5xl text-[#2563a8] mb-3">82/100</div>
              <div className="bg-gray-200 h-4 rounded-full">
                <div className="bg-[#2563a8] h-4 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div>
              <div className="text-gray-600 mb-2">Supervisor Feedback</div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <p className="text-gray-700">
                  Excellent work on the design specification. Your use of UML diagrams was particularly strong,
                  and the system architecture is well thought out. Some areas for improvement include more detailed
                  error handling scenarios and edge cases. Overall, a very solid submission that demonstrates good
                  understanding of the project requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Marks */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-5">Requirements Document</h2>

            <div className="text-center py-10">
              <div className="text-xl text-gray-600 mb-2">Marks Not Yet Released</div>
              <div className="text-gray-500">Your supervisor is currently reviewing this assessment</div>
            </div>
          </div>

          {/* Assessment History */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-5">Assessment History</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <div>Design Specification</div>
                  <div className="text-sm text-gray-600">Submitted: April 19, 2026</div>
                </div>
                <div className="text-lg text-green-600">82/100</div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <div>Requirements Document</div>
                  <div className="text-sm text-gray-600">Submitted: April 27, 2026</div>
                </div>
                <div className="text-sm text-orange-600">Pending</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div>Initial Proposal</div>
                  <div className="text-sm text-gray-600">Submitted: March 15, 2026</div>
                </div>
                <div className="text-lg text-green-600">78/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
