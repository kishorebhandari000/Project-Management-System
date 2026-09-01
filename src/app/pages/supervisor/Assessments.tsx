import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Paperclip } from 'lucide-react';
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

export default function SupervisorAssessments() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    api
      .get('/assessments/supervisor')
      .then((a) => setTemplates(a.assessments))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTemplates =
    categoryFilter === 'all' ? templates : templates.filter((t) => t.category === categoryFilter);

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
              <Link
                to="/supervisor/assessments/submissions"
                className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-sm"
              >
                View Submissions
              </Link>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={ClipboardList} label="Templates" value={filteredTemplates.length} delay={0} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {!loading && !error && templates.length > 0 && (
            <AssessmentCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />
          )}

          {/* Assessment templates + per-project visibility */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8"
          >
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
                {filteredTemplates.map((t, i) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                    className="px-6 py-5"
                  >
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
                                className="text-[#2563a8] hover:underline text-sm inline-flex items-center gap-1"
                              >
                                <Paperclip className="w-3.5 h-3.5" /> {f.name}
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
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-xs ${p.visible ? 'text-green-700' : 'text-gray-500'}`}>
                                    {p.visible ? 'Visible' : 'Hidden'}
                                  </span>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={p.visible}
                                    aria-label={`${p.visible ? 'Hide' : 'Show'} this assessment for ${p.title}`}
                                    onClick={() => handleToggleVisibility(t._id, p._id, !p.visible)}
                                    disabled={togglingKey === key}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                                      p.visible ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                        p.visible ? 'translate-x-4' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                </div>
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
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
