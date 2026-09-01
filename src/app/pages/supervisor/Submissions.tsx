import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import StatCard from '../../components/StatCard';
import AssessmentCategoryTabs, {
  ASSESSMENT_CATEGORY_LABELS,
  type AssessmentCategory,
  type AssessmentCategoryFilter,
} from '../../components/AssessmentCategoryTabs';

interface Submission {
  _id: string;
  assessment: { _id: string; title: string; category: AssessmentCategory };
  student: { name: string; email: string };
  status: 'submitted' | 'graded';
  marks: number | null;
  feedback: string;
  submittedAt: string;
  fileUrl: string;
  fileName: string;
}

export default function SupervisorSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markDraft, setMarkDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AssessmentCategoryFilter>('all');
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    api
      .get('/submissions')
      .then((s) => setSubmissions(s.submissions))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const matchesSearch = (s: Submission) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      s.student?.name?.toLowerCase().includes(term) ||
      s.assessment?.title?.toLowerCase().includes(term)
    );
  };

  const filteredSubmissions = submissions
    .filter((s) => categoryFilter === 'all' || s.assessment?.category === categoryFilter)
    .filter(matchesSearch);

  const pending = filteredSubmissions.filter((s) => s.status === 'submitted');
  const graded = filteredSubmissions.filter((s) => s.status === 'graded');
  const feedbackGiven = filteredSubmissions.filter((s) => s.feedback && s.feedback.trim());

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
              <h1 className="text-2xl">Submissions</h1>
              <p className="text-gray-600">Review and grade your students' submitted work</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="supervisor" />
              <ProfileAvatar role="supervisor" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard icon={Clock} label="Pending Review" value={pending.length} accent="warning" delay={0} />
            <StatCard icon={CheckCircle2} label="Graded" value={graded.length} delay={0.06} />
            <StatCard icon={MessageSquare} label="Feedback Given" value={feedbackGiven.length} delay={0.12} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {!loading && !error && submissions.length > 0 && (
            <AssessmentCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />
          )}

          {!loading && !error && submissions.length > 0 && (
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or assessment..."
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              />
            </div>
          )}

          {loading && <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">Loading...</div>}

          {!loading && !error && submissions.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No submissions from your students yet.
            </div>
          )}

          {!loading && !error && submissions.length > 0 && filteredSubmissions.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No matching submissions.
            </div>
          )}

          {filteredSubmissions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Student</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Assessment</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Submitted</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Mark</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Feedback</th>
                      <th className="text-left px-6 py-4 text-sm text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((s, i) => {
                      const isExpanded = expandedId === s._id;
                      return (
                        <React.Fragment key={s._id}>
                          <motion.tr
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                            className="border-t border-gray-200 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">{s.student?.name}</td>
                            <td className="px-6 py-4">{s.assessment?.title}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={s.status === 'graded' ? 'text-green-600' : 'text-orange-600'}>
                                {s.status === 'graded' ? 'Graded' : 'Pending review'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {s.marks !== null && s.marks !== undefined ? (
                                <span className="text-green-600">{s.marks}/100</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              {s.feedback ? (
                                <span className="text-gray-600 text-sm line-clamp-2">{s.feedback}</span>
                              ) : (
                                <span className="text-gray-400 text-sm italic">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => openEditor(s)}
                                className={`px-4 py-2 rounded-md text-sm ${
                                  s.status === 'submitted'
                                    ? 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {isExpanded ? 'Close' : s.status === 'submitted' ? 'Grade' : 'Edit'}
                              </button>
                            </td>
                          </motion.tr>

                          {isExpanded && (
                            <tr className="border-t border-gray-200 bg-gray-50">
                              <td colSpan={7} className="px-6 py-6">
                                <div className="max-w-2xl space-y-4">
                                  <a
                                    href={s.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#2563a8] hover:underline bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                  >
                                    <Paperclip className="w-4 h-4" /> {s.fileName}
                                  </a>

                                  <AnimatePresence>
                                    {saveError && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3"
                                      >
                                        {saveError}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

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
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => handleSave(s._id)}
                                      disabled={saving || !markDraft}
                                      className="bg-[#2563a8] text-white px-6 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 text-sm"
                                    >
                                      {saving ? 'Saving...' : s.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                                    </motion.button>
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
