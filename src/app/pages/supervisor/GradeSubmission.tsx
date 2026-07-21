import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';

interface Assessment {
  _id: string;
  title: string;
  description: string;
  submissionText: string;
  submittedAt?: string;
  status: string;
  mark: number | null;
  feedback: string;
  student: { name: string; email: string };
  project: { name: string };
}

export default function GradeSubmission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [mark, setMark] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Load supervisor's assessments and find this one
    api.get('/assessments/supervisor')
      .then((d) => {
        const found = d.assessments.find((a: Assessment) => a._id === id);
        if (found) {
          setAssessment(found);
          if (found.mark !== null) setMark(String(found.mark));
          if (found.feedback) setFeedback(found.feedback);
        } else {
          setError('Assessment not found');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGrade = async () => {
    const markNum = Number(mark);
    if (isNaN(markNum) || markNum < 0 || markNum > 100) {
      setError('Mark must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/assessments/${id}/grade`, { mark: markNum, feedback });
      setToast('Assessment graded successfully!');
      setTimeout(() => navigate('/supervisor/assessments'), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Grade Submission</h1>
              <p className="text-gray-600">Review and grade the student's submission</p>
            </div>
            <Link to="/supervisor/assessments" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">
              ← Back
            </Link>
          </div>
        </div>

        {toast && (
          <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
            {toast}
          </div>
        )}

        <div className="p-8 max-w-3xl">
          {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

          {assessment && (
            <div className="space-y-6">
              {/* Info card */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl mb-4">{assessment.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Student:</span>
                    <span className="ml-2 text-gray-800">{assessment.student?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <span className="ml-2 text-gray-800">{assessment.project?.name}</span>
                  </div>
                  {assessment.submittedAt && (
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <span className="ml-2 text-gray-800">{new Date(assessment.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 ${assessment.status === 'graded' ? 'text-green-600' : 'text-orange-600'}`}>
                      {assessment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg mb-3">Student Submission</h3>
                {assessment.submissionText ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {assessment.submissionText}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No submission text.</p>
                )}
              </div>

              {/* Grading */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg mb-5">
                  {assessment.status === 'graded' ? 'Grade (already graded)' : 'Grade This Submission'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Mark <span className="text-gray-400">(0–100)</span></label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={mark}
                      onChange={(e) => setMark(e.target.value)}
                      disabled={assessment.status === 'graded'}
                      className="w-40 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8] disabled:bg-gray-50"
                      placeholder="e.g. 82"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={assessment.status === 'graded'}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8] disabled:bg-gray-50"
                      placeholder="Write feedback for the student..."
                    />
                  </div>
                  {assessment.status !== 'graded' && (
                    <button
                      onClick={handleGrade}
                      disabled={saving || !mark}
                      className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Submit Grade'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
