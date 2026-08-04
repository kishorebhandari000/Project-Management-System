import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface Assessment {
  _id: string;
  title: string;
  student: { name: string; email: string };
  project: { title: string };
}

interface Submission {
  _id: string;
  assessment: { _id: string };
  status: 'submitted' | 'graded';
  marks: number | null;
  feedback: string;
  submittedAt: string;
  fileUrl: string;
  fileName: string;
}

export default function SupervisorAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markDraft, setMarkDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/assessments/supervisor'), api.get('/submissions')])
      .then(([a, s]) => {
        setAssessments(a.assessments);
        setSubmissions(s.submissions);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const submissionFor = (assessmentId: string) =>
    submissions.find((s) => s.assessment._id === assessmentId);

  const pending = submissions.filter((s) => s.status === 'submitted');
  const graded = submissions.filter((s) => s.status === 'graded');
  const feedbackGiven = submissions.filter((s) => s.feedback && s.feedback.trim());

  const openEditor = (submission: Submission) => {
    setExpandedId((prev) => (prev === submission._id ? null : submission._id));
    setSaveError('');
    setMarkDraft(submission.marks !== null ? String(submission.marks) : '');
    setFeedbackDraft(submission.feedback || '');
  };

  const handleSave = async (submissionId: string) => {
    const markNum = Number(markDraft);
    if (isNaN(markNum) || markNum < 0 || markNum > 100) {
      setSaveError('Mark must be between 0 and 100');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await api.put(`/submissions/${submissionId}/grade`, { marks: markNum, feedback: feedbackDraft });
      setToast('Grade and feedback saved!');
      setExpandedId(null);
      loadData();
      setTimeout(() => setToast(''), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Review, grade, and give feedback on student submissions</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="supervisor" />
              <ProfileAvatar role="supervisor" />
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
            {toast}
          </div>
        )}

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total</div>
              <div className="text-3xl">{assessments.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Review</div>
              <div className="text-3xl text-orange-600">{pending.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Graded</div>
              <div className="text-3xl text-green-600">{graded.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Feedback Given</div>
              <div className="text-3xl text-[#2563a8]">{feedbackGiven.length}</div>
            </div>
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessments assigned to you yet.
            </div>
          )}

          {assessments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Student</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Assessment</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Project</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Submitted</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Mark</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Feedback</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((a) => {
                      const submission = submissionFor(a._id);
                      const status = submission?.status ?? 'not_submitted';
                      const isExpanded = expandedId === submission?._id;

                      return (
                        <React.Fragment key={a._id}>
                          <tr className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">{a.student?.name}</td>
                            <td className="px-6 py-4">{a.title}</td>
                            <td className="px-6 py-4 text-gray-500">{a.project?.title}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={
                                status === 'graded' ? 'text-green-600' :
                                status === 'submitted' ? 'text-orange-600' : 'text-gray-400'
                              }>
                                {status === 'not_submitted' ? 'Not submitted' :
                                 status === 'submitted' ? 'Pending review' : 'Graded'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {submission?.marks !== null && submission?.marks !== undefined ? (
                                <span className="text-green-600">{submission.marks}/100</span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              {submission?.feedback ? (
                                <span className="text-gray-600 text-sm line-clamp-2">{submission.feedback}</span>
                              ) : (
                                <span className="text-gray-400 text-sm italic">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {submission ? (
                                <button
                                  onClick={() => openEditor(submission)}
                                  className={`px-4 py-2 rounded-md text-sm ${
                                    status === 'submitted'
                                      ? 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isExpanded ? 'Close' : status === 'submitted' ? 'Grade' : 'Edit'}
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">Awaiting submission</span>
                              )}
                            </td>
                          </tr>

                          {isExpanded && submission && (
                            <tr className="border-t border-gray-200 bg-gray-50">
                              <td colSpan={8} className="px-6 py-6">
                                <div className="max-w-2xl space-y-4">
                                  <a
                                    href={submission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#2563a8] hover:underline bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                  >
                                    📎 {submission.fileName}
                                  </a>

                                  {saveError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                                      {saveError}
                                    </div>
                                  )}

                                  <div>
                                    <label className="block text-gray-700 mb-2 text-sm">
                                      Mark <span className="text-gray-400">(0–100)</span>
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={markDraft}
                                      onChange={(e) => setMarkDraft(e.target.value)}
                                      className="w-40 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                                      placeholder="e.g. 82"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-gray-700 mb-2 text-sm">Feedback</label>
                                    <textarea
                                      value={feedbackDraft}
                                      onChange={(e) => setFeedbackDraft(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8] bg-white"
                                      placeholder="Write feedback for the student..."
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => handleSave(submission._id)}
                                      disabled={saving || !markDraft}
                                      className="bg-[#2563a8] text-white px-6 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 text-sm"
                                    >
                                      {saving ? 'Saving...' : status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                                    </button>
                                    <button
                                      onClick={() => setExpandedId(null)}
                                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}