import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Assessments() {
  const submissions = [
    { id: 1, student: 'John Doe', assessment: 'Project Proposal', submittedDate: 'May 1, 2026', status: 'Pending Review', grade: null },
    { id: 2, student: 'Jane Smith', assessment: 'Literature Review', submittedDate: 'April 30, 2026', status: 'Pending Review', grade: null },
    { id: 3, student: 'John Doe', assessment: 'Requirements Document', submittedDate: 'April 27, 2026', status: 'Graded', grade: 85 },
    { id: 4, student: 'Mike Johnson', assessment: 'Design Specification', submittedDate: 'April 25, 2026', status: 'Graded', grade: 78 },
    { id: 5, student: 'Jane Smith', assessment: 'Requirements Document', submittedDate: 'April 26, 2026', status: 'Graded', grade: 88 },
  ];

  const assessments = [
    { id: 1, title: 'Project Proposal', deadline: 'May 10, 2026', totalSubmissions: 2, totalStudents: 3 },
    { id: 2, title: 'Literature Review', deadline: 'May 15, 2026', totalSubmissions: 1, totalStudents: 3 },
    { id: 3, title: 'Requirements Document', deadline: 'April 28, 2026', totalSubmissions: 3, totalStudents: 3 },
    { id: 4, title: 'Design Specification', deadline: 'April 20, 2026', totalSubmissions: 1, totalStudents: 3 },
  ];

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Manage and grade student submissions</p>
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
          {/* Assessment Overview */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl mb-4">Assessment Overview</h2>
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <div className="mb-1">{assessment.title}</div>
                    <div className="text-sm text-gray-600">Deadline: {assessment.deadline}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {assessment.totalSubmissions}/{assessment.totalStudents} submitted
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Assessment</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Submitted Date</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Grade</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{submission.student}</td>
                    <td className="px-6 py-4">{submission.assessment}</td>
                    <td className="px-6 py-4">{submission.submittedDate}</td>
                    <td className="px-6 py-4">
                      <span className={submission.status === 'Graded' ? 'text-green-600' : 'text-orange-600'}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {submission.grade ? `${submission.grade}/100` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a]">
                          {submission.status === 'Graded' ? 'View' : 'Grade'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}