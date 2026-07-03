import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import { Link } from 'react-router';
import { notifyAssessmentSubmitted, notifySubmissionConfirmation } from '../../utils/emailService';

export default function Assessments() {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('20032573@students.koi.edu.au');
  const [studentEmail, setStudentEmail] = useState('20032573@students.koi.edu.au');
  const [submitting, setSubmitting] = useState(false);

  const assessments = [
    { id: 1, title: 'Project Proposal', deadline: 'May 10, 2026', status: 'Pending' },
    { id: 2, title: 'Literature Review', deadline: 'May 15, 2026', status: 'Pending' },
    { id: 3, title: 'Requirements Document', deadline: 'April 28, 2026', status: 'Submitted' },
    { id: 4, title: 'Design Specification', deadline: 'April 20, 2026', status: 'Graded' },
    { id: 5, title: 'Mid-term Presentation', deadline: 'May 25, 2026', status: 'Not Started' },
  ];

  const handleSubmitClick = (title: string) => {
    setSelectedAssessment(title);
    setShowModal(true);
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      const submissionDate = new Date().toLocaleDateString();

      // Send notification to supervisor
      await notifyAssessmentSubmitted({
        supervisorEmail,
        studentName: 'John Doe',
        assessmentTitle: selectedAssessment,
        projectName: 'AI-Powered Healthcare System',
        submissionDate,
        viewUrl: window.location.origin + '/supervisor/assessments',
      });

      // Send confirmation to student
      await notifySubmissionConfirmation({
        studentEmail,
        studentName: 'John Doe',
        assessmentTitle: selectedAssessment,
        submissionDate,
        viewUrl: window.location.origin + '/student/assessments',
      });

      alert('✅ Assessment submitted successfully!\n\n📧 Confirmation emails sent to:\n- You (student)\n- Your supervisor\n\nCheck your email inbox!');
      setShowModal(false);
    } catch (error) {
      console.error('Submission error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (errorMsg.includes('only send testing emails to your own email')) {
        alert('⚠️ Assessment Submitted!\n\nEmail notifications failed due to Resend limitation.\nFor testing: Use 20032573@students.koi.edu.au for both email fields.\n\nYour supervisor can still view the submission in the system.');
      } else {
        alert('Assessment uploaded but email notifications failed. Your supervisor can still view it in the system.');
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Manage your project assessments</p>
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Assessment Title</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Deadline</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{assessment.title}</td>
                    <td className="px-6 py-4">{assessment.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`${
                        assessment.status === 'Submitted' ? 'text-blue-600' :
                        assessment.status === 'Graded' ? 'text-green-600' :
                        assessment.status === 'Pending' ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {assessment.status === 'Pending' || assessment.status === 'Not Started' ? (
                        <button
                          onClick={() => handleSubmitClick(assessment.title)}
                          className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a]"
                        >
                          Submit
                        </button>
                      ) : (
                        <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl mb-6">Submit {selectedAssessment}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Your Email (for confirmation) *</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="your.email@university.edu"
                  required
                />
                <p className="text-sm text-orange-600 mt-1">⚠️ Testing: Use 20032573@students.koi.edu.au</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Supervisor Email (for notification) *</label>
                <input
                  type="email"
                  value={supervisorEmail}
                  onChange={(e) => setSupervisorEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="supervisor@university.edu"
                  required
                />
                <p className="text-sm text-orange-600 mt-1">⚠️ Testing: Use 20032573@students.koi.edu.au</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-3">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
                  <div className="text-gray-600 mb-2">Drag and drop your file here</div>
                  <div className="text-gray-500 text-sm mb-3">or</div>
                  <button type="button" className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                    Browse Files
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">📧 You will receive:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Submission confirmation email</li>
                <li>Supervisor will be notified</li>
                <li>Grade notification when marked</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="flex-1 bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:bg-gray-400"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
