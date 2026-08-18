import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import AssessmentCategoryTabs, {
  ASSESSMENT_CATEGORY_LABELS,
  type AssessmentCategory,
  type AssessmentCategoryFilter,
} from '../../components/AssessmentCategoryTabs';

interface AssessmentFile {
  url: string;
  name: string;
}

interface ProjectVisibility {
  _id: string;
  title: string;
  visible: boolean;
  extendedDueDate?: string | null;
}

interface AssessmentTemplate {
  _id: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  dueDate?: string;
  files: AssessmentFile[];
  projects: ProjectVisibility[];
}

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

export default function SupervisorAssessments() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markDraft, setMarkDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<AssessmentCategoryFilter>('all');
  const [extendingKey, setExtendingKey] = useState<string | null>(null);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [extendSaving, setExtendSaving] = useState(false);
  const [extendError, setExtendError] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/assessments/supervisor'), api.get('/submissions')])
      .then(([a, s]) => {
        setTemplates(a.assessments);
        setSubmissions(s.submissions);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category tabs filter both sections consistently: templates by their own
  // category, submissions by their (populated) assessment's category. The
  // stat cards below are then derived from these same filtered arrays, so
  // "All" naturally reproduces the old unfiltered totals.
  const filteredTemplates =
    categoryFilter === 'all' ? templates : templates.filter((t) => t.category === categoryFilter);
  const filteredSubmissions =
    categoryFilter === 'all' ? submissions : submissions.filter((s) => s.assessment?.category === categoryFilter);

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

  const handleToggleVisibility = async (assessmentId: string, projectId: string, nextVisible: boolean) => {
    const key = `${assessmentId}:${projectId}`;
    setTogglingKey(key);
    try {
      await api.put(`/assessments/${assessmentId}/visibility`, { projectId, visible: nextVisible });
      setTemplates((prev) =>
        prev.map((t) =>
          t._id !== assessmentId
            ? t
            : { ...t, projects: t.projects.map((p) => (p._id !== projectId ? p : { ...p, visible: nextVisible })) }
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update visibility');
    } finally {
      setTogglingKey(null);
    }
  };

  const openExtend = (assessmentId: string, projectId: string) => {
    const key = `${assessmentId}:${projectId}`;
    setExtendingKey((prev) => (prev === key ? null : key));
    setDueDateDraft('');
    setExtendError('');
  };

  const handleExtendDeadline = async (assessmentId: string, projectId: string) => {
    if (!dueDateDraft) return;
    setExtendSaving(true);
    setExtendError('');
    try {
      const { visibility } = await api.put(`/assessments/${assessmentId}/extend-deadline`, {
        projectId,
        newDueDate: dueDateDraft,
      });
      setTemplates((prev) =>
        prev.map((t) =>
          t._id !== assessmentId
            ? t
            : {
                ...t,
                projects: t.projects.map((p) =>
                  p._id !== projectId ? p : { ...p, extendedDueDate: visibility.extendedDueDate }
                ),
              }
        )
      );
      setExtendingKey(null);
      setToast('Deadline extended!');
      setTimeout(() => setToast(''), 2500);
    } catch (e) {
      setExtendError(e instanceof Error ? e.message : 'Failed to extend deadline');
    } finally {
      setExtendSaving(false);
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
              <p className="text-gray-600">Release assessments to your students, then review and grade their work</p>
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
              <div className="text-gray-600 mb-1">Templates</div>
              <div className="text-3xl">{filteredTemplates.length}</div>
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

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {!loading && !error && (templates.length > 0 || submissions.length > 0) && (
            <AssessmentCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />
          )}

          {/* Assessment templates + per-project visibility */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl">Assessment Templates</h2>
              <p className="text-sm text-gray-500">Turn an assessment on for your project(s) to release it to your students.</p>
            </div>

            {loading && <div className="text-center py-10 text-gray-500">Loading...</div>}

            {!loading && templates.length === 0 && (
              <div className="text-center py-10 text-gray-500">No assessment templates have been created yet.</div>
            )}

            {!loading && templates.length > 0 && filteredTemplates.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No {categoryFilter !== 'all' ? ASSESSMENT_CATEGORY_LABELS[categoryFilter] : ''} templates.
              </div>
            )}

            {filteredTemplates.length > 0 && (
              <div className="divide-y divide-gray-200">
                {filteredTemplates.map((t) => (
                  <div key={t._id} className="px-6 py-5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg">{t.title}</h3>
                          {t.category && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {ASSESSMENT_CATEGORY_LABELS[t.category]}
                            </span>
                          )}
                        </div>
                        {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                        {t.dueDate && (
                          <p className="text-xs text-gray-400 mt-1">Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                        )}
                        {t.files?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-3">
                            {t.files.map((f, idx) => (
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

                      <div className="shrink-0 space-y-2 min-w-[200px]">
                        {t.projects.length === 0 && (
                          <p className="text-sm text-gray-400">You don't supervise any projects yet.</p>
                        )}
                        {t.projects.map((p) => {
                          const key = `${t._id}:${p._id}`;
                          const isExtending = extendingKey === key;
                          return (
                            <div key={p._id} className="border-b border-gray-100 pb-2 last:border-b-0">
                              <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-gray-700">{p.title}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility(t._id, p._id, !p.visible)}
                                  disabled={togglingKey === key}
                                  className={`px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-50 ${
                                    p.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {togglingKey === key ? '...' : p.visible ? 'Visible' : 'Hidden'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-4 text-xs text-gray-500 mt-1">
                                <span>
                                  {p.extendedDueDate
                                    ? `Extended to: ${new Date(p.extendedDueDate).toLocaleDateString()}`
                                    : t.dueDate
                                    ? `Due: ${new Date(t.dueDate).toLocaleDateString()}`
                                    : 'No due date'}
                                </span>
                                {t.dueDate && (
                                  <button
                                    type="button"
                                    onClick={() => openExtend(t._id, p._id)}
                                    className="text-[#2563a8] hover:underline shrink-0"
                                  >
                                    Extend Deadline
                                  </button>
                                )}
                              </div>

                              {isExtending && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="date"
                                      value={dueDateDraft}
                                      onChange={(e) => setDueDateDraft(e.target.value)}
                                      className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#2563a8]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleExtendDeadline(t._id, p._id)}
                                      disabled={!dueDateDraft || extendSaving}
                                      className="bg-[#2563a8] text-white px-3 py-1 rounded-md text-xs hover:bg-[#1e4a8a] disabled:opacity-50"
                                    >
                                      {extendSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExtendingKey(null)}
                                      className="text-gray-500 text-xs hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  {extendError && <p className="text-xs text-red-600">{extendError}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions / grading - one row per submission, since a single
              template can now be released to many students at once. */}
          {!loading && !error && submissions.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No submissions from your students yet.
            </div>
          )}

          {!loading && !error && submissions.length > 0 && filteredSubmissions.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No {categoryFilter !== 'all' ? ASSESSMENT_CATEGORY_LABELS[categoryFilter] : ''} submissions.
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
                    {filteredSubmissions.map((s) => {
                      const isExpanded = expandedId === s._id;
                      return (
                        <React.Fragment key={s._id}>
                          <tr className="border-t border-gray-200 hover:bg-gray-50">
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
                          </tr>

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
                                    📎 {s.fileName}
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
                                      onClick={() => handleSave(s._id)}
                                      disabled={saving || !markDraft}
                                      className="bg-[#2563a8] text-white px-6 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50 text-sm"
                                    >
                                      {saving ? 'Saving...' : s.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
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
