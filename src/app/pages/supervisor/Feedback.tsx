import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Feedback() {
  const feedbackList = [
    {
      id: 1,
      student: 'John Doe',
      assessment: 'Design Specification',
      submittedDate: 'April 19, 2026',
      gradedDate: 'April 22, 2026',
      marks: 82,
      grade: 'A-',
      status: 'Published'
    },
    {
      id: 2,
      student: 'Jane Smith',
      assessment: 'Requirements Document',
      submittedDate: 'April 26, 2026',
      gradedDate: 'April 29, 2026',
      marks: 88,
      grade: 'A',
      status: 'Published'
    },
    {
      id: 3,
      student: 'Mike Johnson',
      assessment: 'Design Specification',
      submittedDate: 'April 25, 2026',
      gradedDate: 'April 28, 2026',
      marks: 78,
      grade: 'B+',
      status: 'Published'
    },
    {
      id: 4,
      student: 'John Doe',
      assessment: 'Requirements Document',
      submittedDate: 'April 27, 2026',
      gradedDate: 'May 1, 2026',
      marks: 85,
      grade: 'A',
      status: 'Draft'
    },
  ];

  const publishedFeedback = feedbackList.filter(f => f.status === 'Published');
  const draftFeedback = feedbackList.filter(f => f.status === 'Draft');

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Feedback Overview</h1>
              <p className="text-gray-600">View all feedback given to students</p>
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
              <div className="text-gray-600 mb-1">Total Feedback</div>
              <div className="text-3xl">{feedbackList.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Published</div>
              <div className="text-3xl text-green-600">{publishedFeedback.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Drafts</div>
              <div className="text-3xl text-orange-600">{draftFeedback.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Grade</div>
              <div className="text-3xl text-[#2563a8]">
                {Math.round(feedbackList.reduce((sum, f) => sum + f.marks, 0) / feedbackList.length)}%
              </div>
            </div>
          </div>

          {/* Published Feedback */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl">Published Feedback</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Assessment</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Submitted</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Graded</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Marks</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Grade</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishedFeedback.map((feedback) => (
                  <tr key={feedback.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{feedback.student}</td>
                    <td className="px-6 py-4">{feedback.assessment}</td>
                    <td className="px-6 py-4">{feedback.submittedDate}</td>
                    <td className="px-6 py-4">{feedback.gradedDate}</td>
                    <td className="px-6 py-4">{feedback.marks}/100</td>
                    <td className="px-6 py-4">
                      <span className="text-green-600">{feedback.grade}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/supervisor/assessments/grade/${feedback.id}`}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                        >
                          View
                        </Link>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Draft Feedback */}
          {draftFeedback.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl">Draft Feedback</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Assessment</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Submitted</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Last Modified</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Marks</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draftFeedback.map((feedback) => (
                    <tr key={feedback.id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{feedback.student}</td>
                      <td className="px-6 py-4">{feedback.assessment}</td>
                      <td className="px-6 py-4">{feedback.submittedDate}</td>
                      <td className="px-6 py-4">{feedback.gradedDate}</td>
                      <td className="px-6 py-4">{feedback.marks}/100</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/supervisor/assessments/grade/${feedback.id}`}
                            className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a]"
                          >
                            Complete
                          </Link>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback Summary by Student */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl mb-5">Student Performance Summary</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="mb-1">John Doe</div>
                    <div className="text-sm text-gray-600">2 assessments graded</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-[#2563a8] mb-1">83.5%</div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>
                <div className="bg-gray-200 h-3 rounded-full">
                  <div className="bg-[#2563a8] h-3 rounded-full" style={{ width: '83.5%' }}></div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="mb-1">Jane Smith</div>
                    <div className="text-sm text-gray-600">1 assessment graded</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-[#2563a8] mb-1">88%</div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>
                <div className="bg-gray-200 h-3 rounded-full">
                  <div className="bg-[#2563a8] h-3 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="mb-1">Mike Johnson</div>
                    <div className="text-sm text-gray-600">1 assessment graded</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-[#2563a8] mb-1">78%</div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>
                <div className="bg-gray-200 h-3 rounded-full">
                  <div className="bg-[#2563a8] h-3 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
