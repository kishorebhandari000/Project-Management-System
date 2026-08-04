import Sidebar from '../../components/Sidebar';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface AssessmentStat {
  title: string;
  submitted: number;
  total: number;
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
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-gray-600 mb-2">Total Projects</div>
                  <div className="text-4xl text-[#2563a8]">{summary.totalProjects}</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-gray-600 mb-2">Allocation Completion</div>
                  <div className="text-4xl text-green-600">{summary.completionRate}%</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-gray-600 mb-2">Avg Grade</div>
                  <div className="text-4xl text-[#2563a8]">{summary.avgGrade || '—'}</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-gray-600 mb-2">Pending Reviews</div>
                  <div className="text-4xl text-orange-600">{summary.pendingReviews}</div>
                </div>
              </div>

              {/* Submission Statistics */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
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
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span>{stat.title}</span>
                          <span className="text-gray-600">
                            {stat.submitted}/{stat.total} ({stat.percentage}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 h-4 rounded-full">
                          <div
                            className="bg-[#2563a8] h-4 rounded-full"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Breakdown */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl mb-6">Project Breakdown by Category</h2>
                {summary.projectCategories.length === 0 ? (
                  <p className="text-gray-500">No projects created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {summary.projectCategories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0">
                        <span>{category.category}</span>
                        <span className="text-lg">{category.count} projects</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
