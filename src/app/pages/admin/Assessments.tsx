import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ClipboardList, CheckCircle2, Paperclip } from 'lucide-react';
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

interface Assessment {
  _id: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  dueDate?: string;
  files: AssessmentFile[];
  visibleProjectCount: number;
}

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AssessmentCategoryFilter>('all');

  useEffect(() => {
    api
      .get('/assessments/all')
      .then((data) => setAssessments(data.assessments))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const filteredAssessments =
    categoryFilter === 'all' ? assessments : assessments.filter((a) => a.category === categoryFilter);
  const released = filteredAssessments.filter((a) => a.visibleProjectCount > 0).length;

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Manage the shared assessment templates for this trimester</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/assessments/create" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Assessment
              </Link>
              <NotificationBell role="admin" />

              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <StatCard icon={ClipboardList} label="Total Templates" value={filteredAssessments.length} delay={0} />
            <StatCard
              icon={CheckCircle2}
              label="Released to at Least One Project"
              value={released}
              delay={0.06}
            />
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessment templates in the system yet.
            </div>
          )}

          {!loading && !error && assessments.length > 0 && (
            <AssessmentCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />
          )}

          {!loading && !error && assessments.length > 0 && filteredAssessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No {categoryFilter !== 'all' ? ASSESSMENT_CATEGORY_LABELS[categoryFilter] : ''} assessment templates yet.
            </div>
          )}

          {filteredAssessments.length > 0 && (
            <div className="space-y-4">
              {filteredAssessments.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg">{a.title}</h3>
                        {a.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {ASSESSMENT_CATEGORY_LABELS[a.category]}
                          </span>
                        )}
                      </div>
                      {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                      {a.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                      )}
                      {a.files?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                          {a.files.map((f, idx) => (
                            <a
                              key={idx}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#2563a8] hover:underline text-sm"
                            >
                              <Paperclip className="w-3.5 h-3.5" /> {f.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-sm shrink-0 ${a.visibleProjectCount > 0 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {a.visibleProjectCount > 0
                        ? `Visible to ${a.visibleProjectCount} project${a.visibleProjectCount === 1 ? '' : 's'}`
                        : 'Not released yet'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
