import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';

export default function GradeSubmission() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/supervisor/assessments');
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Grade Submission</h1>
              <p className="text-gray-600">Review and provide feedback</p>
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
          <div className="max-w-5xl mx-auto">
            {/* Submission Details */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Submission Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-gray-600 mb-1">Student</div>
                    <div className="text-lg">John Doe</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-600 mb-1">Student ID</div>
                    <div>STU2024001</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Assessment</div>
                    <div>Project Proposal</div>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <div className="text-gray-600 mb-1">Submitted On</div>
                    <div>May 1, 2026 at 2:30 PM</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-600 mb-1">Deadline</div>
                    <div>May 10, 2026</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Status</div>
                    <span className="text-green-600">On Time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submitted File */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Submitted File</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex justify-between items-center">
                <div>
                  <div className="mb-1">Project_Proposal_JohnDoe.pdf</div>
                  <div className="text-sm text-gray-600">2.4 MB</div>
                </div>
                <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                  Download
                </button>
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                <h2 className="text-xl mb-5">Grading</h2>

                <div className="space-y-6">
                  {/* Marks */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Marks Obtained</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                        placeholder="0"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Total Marks</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                        value={100}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Percentage</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                        value="-"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-gray-700 mb-2">Grade</label>
                    <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                      <option value="">Select Grade</option>
                      <option>A+ (90-100)</option>
                      <option>A (85-89)</option>
                      <option>A- (80-84)</option>
                      <option>B+ (75-79)</option>
                      <option>B (70-74)</option>
                      <option>B- (65-69)</option>
                      <option>C+ (60-64)</option>
                      <option>C (55-59)</option>
                      <option>D (50-54)</option>
                      <option>F (0-49)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                <h2 className="text-xl mb-5">Detailed Feedback</h2>

                <div className="space-y-5">
                  {/* Strengths */}
                  <div>
                    <label className="block text-gray-700 mb-2">Strengths</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8]"
                      placeholder="What did the student do well?"
                    ></textarea>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <label className="block text-gray-700 mb-2">Areas for Improvement</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8]"
                      placeholder="What could be improved?"
                    ></textarea>
                  </div>

                  {/* Overall Comments */}
                  <div>
                    <label className="block text-gray-700 mb-2">Overall Comments</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                      placeholder="Provide comprehensive feedback on the submission"
                      required
                    ></textarea>
                  </div>

                  {/* Specific Criteria (Optional) */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg mb-4">Criteria-Based Assessment</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Content Quality</label>
                          <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Satisfactory</option>
                            <option>Needs Improvement</option>
                            <option>Poor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Structure & Organization</label>
                          <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Satisfactory</option>
                            <option>Needs Improvement</option>
                            <option>Poor</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Research & References</label>
                          <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Satisfactory</option>
                            <option>Needs Improvement</option>
                            <option>Poor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Presentation & Formatting</label>
                          <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Satisfactory</option>
                            <option>Needs Improvement</option>
                            <option>Poor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate('/supervisor/assessments')}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    Submit Grade & Feedback
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
