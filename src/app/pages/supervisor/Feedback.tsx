import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

const feedbackHistory = [
  { id: 1, student: 'John Doe', assessment: 'Design Specification', mark: 82, date: 'April 21, 2026', feedback: 'Excellent work on the design specification. UML diagrams were particularly strong.' },
  { id: 2, student: 'Mike Johnson', assessment: 'Initial Proposal', mark: 75, date: 'March 18, 2026', feedback: 'Good proposal but needs more detail on the technical implementation.' },
];

export default function SupervisorFeedback() {
  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Feedback</h1>
              <p className="text-gray-600">View feedback you have given to students</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {feedbackHistory.map((f) => (
            <div key={f.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg">{f.student} — {f.assessment}</h3>
                  <p className="text-sm text-gray-500">Graded: {f.date}</p>
                </div>
                <span className="text-2xl text-green-600">{f.mark}/100</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{f.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
