import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';

interface Assessment {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  submittedAt?: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  mark: number | null;
  feedback: string;
  supervisor: { name: string; email: string };
  project: { name: string };
}

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [activeSubmit, setActiveSubmit] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/assessments/my')
      .then((d) => setAssessments(d.assessments))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (id: string) => {
    if (!submitText.trim()) return;
    setSubmitting(id);
    try {
      const d = await api.put(`/assessments/${id}/submit`, { submissionText: submitText });
      setAssessments((prev) => prev.map((a) => (a._id === id ? d.assessment : a)));
      setActiveSubmit(null);
      setSubmitText('');
      showToast('Assessment submitted successfully!');
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setSubmitting(null);
    }
  };

  const statusBadge = (s: Assessment['status']) => {
    if (s === 'graded') return <span className="text-green-600 font-medium">Graded</span>;
    if (s === 'submitted') return <span className="text-blue-600 font-medium">Submitted</span>;
    return <span className="text-orange-500 font-medium">Not Submitted</span>;
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Submit and track your project assessments</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full" />
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                {localStorage.getItem('userName')?.[0] ?? 'S'}
              </Link>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 bg-[#2563a8] text-white px-5 py-3 rounded-lg shadow-lg z-50 transition-all">
            {toast}
          </div>
        )}

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total</div>
              <div className="text-3xl">{assessments.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Submitted</div>
              <div className="text-3xl text-blue-600">{assessments.filter((a) => a.status !== 'not_submitted').length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Graded</div>
              <div className="text-3xl text-green-600">{assessments.filter((a) => a.status === 'graded').length}</div>
            </div>
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading assessments...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessments assigned yet.
            </div>
          )}

          <div className="space-y-4">
            {assessments.map((a) => (
              <div key={a._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg mb-1">{a.title}</h3>
                      <p className="text-sm text-gray-500">
                        {a.project?.name} &bull; Supervisor: {a.supervisor?.name}
                      </p>
                      {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {statusBadge(a.status)}
                      {a.dueDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Graded result */}
                  {a.status === 'graded' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-gray-600">Mark:</span>
                        <span className="text-2xl text-green-600 font-semibold">{a.mark}/100</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full mb-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${a.mark}%` }} />
                      </div>
                      {a.feedback && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Feedback:</div>
                          <p className="text-gray-700 text-sm bg-white p-3 rounded border border-green-100">{a.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submitted view */}
                  {a.status === 'submitted' && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                      ✓ Submitted {a.submittedAt ? `on ${new Date(a.submittedAt).toLocaleDateString()}` : ''} — awaiting review
                    </div>
                  )}

                  {/* Submit form */}
                  {a.status === 'not_submitted' && (
                    <div className="mt-4">
                      {activeSubmit === a._id ? (
                        <div className="space-y-3">
                          <textarea
                            value={submitText}
                            onChange={(e) => setSubmitText(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8] text-sm"
                            placeholder="Write your submission here..."
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSubmit(a._id)}
                              disabled={submitting === a._id || !submitText.trim()}
                              className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 text-sm"
                            >
                              {submitting === a._id ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                              onClick={() => { setActiveSubmit(null); setSubmitText(''); }}
                              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSubmit(a._id)}
                          className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] text-sm"
                        >
                          Submit Assessment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
