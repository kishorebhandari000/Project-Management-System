import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';

export default function Assessments() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'create'>('submissions');

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
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Manage student submissions and create assessments</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Tab Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'submissions'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View Submissions
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'create'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Create Assessment
            </button>
          </div>

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <>
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
            </>
          )}

          {/* Create Assessment Tab */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl mb-6">Create New Assessment</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Assessment Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="e.g., Mid-term Presentation"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Provide detailed instructions for the assessment"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Total Marks</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      defaultValue={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Assign To</label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                    <option>All Students</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                    <option>Mike Johnson</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Grading Rubric</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-24 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Define grading criteria and weightage"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Submission Type</label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                    <option>File Upload</option>
                    <option>Link Submission</option>
                    <option>Both</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}