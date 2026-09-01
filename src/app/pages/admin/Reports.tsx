import Sidebar from '../../components/Sidebar';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, CheckCircle2, Award, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import StatCard from '../../components/StatCard';

interface AssessmentStat {
  title: string;
  released: number;
  submitted: number;
  graded: number;
  percentage: number;
}

interface ProjectCategory {
  category: string;
  count: number;
}

interface Summary {
  totalProjects: number;
  totalStudents: number;
  totalSupervisors: number;
  completionRate: number;
  avgGrade: number;
  pendingReviews: number;
  assessmentStats: AssessmentStat[];
  projectCategories: ProjectCategory[];
}

const LIVE_REFRESH_MS = 10000;

export default function Reports() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      api.get('/reports/summary')
        .then((d) => {
          if (!cancelled) setSummary(d);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load reports');
        })
        .finally(() => {
          if (!cancelled && showLoading) setLoading(false);
        });
    };

    load(true);
    const interval = setInterval(() => load(false), LIVE_REFRESH_MS);

    const handleFocus = () => load(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Reports</h1>
              <p className="text-gray-600">System statistics and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="admin" />

              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading && <div className="text-center py-20 text-gray-500">Loading reports...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {summary && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={FolderKanban}
                  label="Total Projects"
                  value={summary.totalProjects}
                  to="/admin/projects"
                  delay={0}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Allocation Completion"
                  value={`${summary.completionRate}%`}
                  delay={0.06}
                />
                <StatCard
                  icon={Award}
                  label="Avg Grade"
                  value={summary.avgGrade || '—'}
                  delay={0.12}
                />
                <StatCard
                  icon={Clock}
                  label="Pending Reviews"
                  value={summary.pendingReviews}
                  accent="warning"
                  delay={0.18}
                />
              </div>

              {/* Submission Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-xl">Submission Statistics</h2>
                  <span className="flex items-center gap-1.5 text-xs text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                  </span>
                </div>
                {summary.assessmentStats.length === 0 ? (
                  <p className="text-gray-500">No assessments created yet.</p>
                ) : (
                  <div className="space-y-5">
                    {summary.assessmentStats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + Math.min(index, 8) * 0.05 }}
                      >
                        <div className="flex justify-between mb-2">
                          <span>{stat.title}</span>
                          <span className="text-gray-600">
                            {stat.submitted}/{stat.released} submitted ({stat.percentage}%)
                            {stat.released > 0 && <span className="text-gray-400"> &bull; {stat.graded} graded</span>}
                          </span>
                        </div>
                        <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-[#2563a8] h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 0.6, delay: 0.4 + Math.min(index, 8) * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                        {stat.released === 0 && (
                          <p className="text-xs text-gray-400 mt-1">Not released to any project yet.</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Project Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <h2 className="text-xl mb-6">Project Breakdown by Category</h2>
                {summary.projectCategories.length === 0 ? (
                  <p className="text-gray-500">No projects created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {summary.projectCategories.map((category, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.36 + Math.min(index, 8) * 0.05 }}
                        className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0"
                      >
                        <span>{category.category}</span>
                        <span className="text-lg">{category.count} projects</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
