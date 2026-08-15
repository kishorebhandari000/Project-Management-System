import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface AssessmentFile {
  url: string;
  name: string;
}

interface Assessment {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  files: AssessmentFile[];
}

interface Submission {
  _id: string;
  assessment: { _id: string };
  fileUrl: string;
  fileName: string;
  status: 'submitted' | 'graded';
  marks: number | null;
  feedback: string;
  submittedAt: string;
}

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [hasApprovedProject, setHasApprovedProject] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assessmentsRes, submissionsRes] = await Promise.all([
        api.get('/assessments/my'),
        api.get('/submissions'),
      ]);
      setAssessments(assessmentsRes.assessments);
      setHasApprovedProject(assessmentsRes.hasApprovedProject ?? true);
      setSubmissions(submissionsRes.submissions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const submissionFor = (assessmentId: string) =>
    submissions.find((s) => s.assessment._id === assessmentId);

  const handleUpload = async (assessmentId: string) => {
    if (!file) return;
    setSubmitting(assessmentId);
    try {
      const formData = new FormData();
      formData.append('assessmentId', assessmentId);
      formData.append('file', file);
      await api.upload('/submissions', formData);
      setActiveUpload(null);
      setFile(null);
      showToast('File submitted successfully!');
      await loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(null);
    }
  };

  const total = assessments.length;
  const submittedCount = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const gradedCount = gradedSubmissions.length;
  const avgMark = gradedCount
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.marks ?? 0), 0) / gradedCount)
    : null;

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Submit your work and view feedback and marks</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="student" />

              <ProfileAvatar role="student" />
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed top-6 right-6 bg-[#2563a8] text-white px-5 py-3 rounded-lg shadow-lg z-50">
            {toast}
          </div>
        )}

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total</div>
              <div className="text-3xl">{total}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Submitted</div>
              <div className="text-3xl text-blue-600">{submittedCount}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Graded</div>
              <div className="text-3xl text-green-600">{gradedCount}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Mark</div>
              <div className="text-3xl text-[#2563a8]">{avgMark !== null ? `${avgMark}%` : '—'}</div>
            </div>
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading assessments...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              {!hasApprovedProject
                ? "You don't have an approved project yet — assessments will appear here once you do."
                : "Your supervisor hasn't released any assessments yet. Check back soon."}
            </div>
          )}

          <div className="space-y-4">
            {assessments.map((a) => {
              const submission = submissionFor(a._id);
              return (
                <div key={a._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg mb-1">{a.title}</h3>
                        {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                        {a.files?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-3">
                            {a.files.map((f, idx) => (
                              <a
                                key={idx}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#2563a8] hover:underline text-sm"
                              >
                                📎 {f.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {submission?.status === 'graded' ? (
                          <span className="text-green-600 font-medium">Graded</span>
                        ) : submission?.status === 'submitted' ? (
                          <span className="text-blue-600 font-medium">Submitted</span>
                        ) : (
                          <span className="text-orange-500 font-medium">Not Submitted</span>
                        )}
                        {a.dueDate && (
                          <div className="text-xs text-gray-400 mt-1">
                            Due: {new Date(a.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {submission?.status === 'graded' && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">Mark:</span>
                          <span className="text-2xl text-green-600 font-semibold">{submission.marks}/100</span>
                        </div>

                        <div className="bg-gray-200 h-2.5 rounded-full">
                          <div
                            className="bg-[#2563a8] h-2.5 rounded-full"
                            style={{ width: `${submission.marks ?? 0}%` }}
                          />
                        </div>

                        <div>
                          <div className="text-gray-600 mb-2 text-sm">Supervisor Feedback</div>
                          {submission.feedback ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-gray-700">{submission.feedback}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-sm">No written feedback provided.</p>
                          )}
                        </div>

                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[#2563a8] hover:underline text-sm">
                          📎 {submission.fileName}
                        </a>
                      </div>
                    )}

                    {submission?.status === 'submitted' && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        ✓ Submitted {submission.submittedAt ? `on ${new Date(submission.submittedAt).toLocaleDateString()}` : ''} — awaiting review
                        <div className="mt-1">
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            📎 {submission.fileName}
                          </a>
                        </div>
                      </div>
                    )}

                    {!submission && (
                      <div className="mt-4">
                        {activeUpload === a._id ? (
                          <div className="space-y-3">
                            <input
                              type="file"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleUpload(a._id)}
                                disabled={submitting === a._id || !file}
                                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 text-sm"
                              >
                                {submitting === a._id ? 'Submitting...' : 'Submit File'}
                              </button>
                              <button
                                onClick={() => { setActiveUpload(null); setFile(null); }}
                                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveUpload(a._id)}
                            className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] text-sm"
                          >
                            Submit File
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}