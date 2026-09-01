import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Users, UserCog, FolderKanban, Clock, UserPlus, FolderPlus, Link2, FileEdit, BarChart3 } from 'lucide-react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import SectionHint from '../../components/SectionHint';
import StatCard from '../../components/StatCard';
import { sectionHints } from '../../lib/sectionHints';

const QUICK_ACTIONS = [
  { icon: UserPlus, label: 'Manage Users', to: '/admin/users' },
  { icon: FolderPlus, label: 'Create Project', to: '/admin/projects/create' },
  { icon: Link2, label: 'Manage Allocation', to: '/admin/allocation' },
  { icon: FileEdit, label: 'Create Assessment', to: '/admin/assessments/create' },
  { icon: BarChart3, label: 'View Reports', to: '/admin/reports' },
];

interface ActivityItem {
  text: string;
  time: string;
  date: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    supervisors: 0,
    activeProjects: 0,
    pendingAllocations: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [studentsRes, supervisorsRes, projectsRes, pendingRes] = await Promise.all([
          api.get('/users?role=student'),
          api.get('/users?role=supervisor'),
          api.get('/projects'),
          api.get('/allocations?status=pending'),
        ]);

        const activeProjects = projectsRes.projects.filter((p: any) => p.status !== 'closed').length;

        setStats({
          totalStudents: studentsRes.count,
          supervisors: supervisorsRes.count,
          activeProjects,
          pendingAllocations: pendingRes.count,
        });

        const userEvents: ActivityItem[] = studentsRes.users.slice(0, 5).map((u: any) => ({
          text: `New student registered: ${u.email}`,
          date: new Date(u.createdAt),
          time: timeAgo(new Date(u.createdAt)),
        }));

        const projectEvents: ActivityItem[] = projectsRes.projects.slice(0, 5).map((p: any) => ({
          text: `Project "${p.title}" created`,
          date: new Date(p.createdAt),
          time: timeAgo(new Date(p.createdAt)),
        }));

        const allocationsRes = await api.get('/allocations');
        const allocationEvents: ActivityItem[] = allocationsRes.allocations
          .filter((a: any) => a.status !== 'pending')
          .slice(0, 5)
          .map((a: any) => ({
            text: `${a.student?.name || 'A student'} ${a.status} for "${a.project?.title || 'a project'}"`,
            date: new Date(a.decidedAt || a.updatedAt),
            time: timeAgo(new Date(a.decidedAt || a.updatedAt)),
          }));

        const combined = [...userEvents, ...projectEvents, ...allocationEvents]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);

        setActivity(combined);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="admin" />

              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={loading ? '—' : stats.totalStudents}
              to="/admin/users"
              delay={0}
            />
            <StatCard
              icon={UserCog}
              label="Supervisors"
              value={loading ? '—' : stats.supervisors}
              to="/admin/users"
              delay={0.06}
            />
            <StatCard
              icon={FolderKanban}
              label="Active Projects"
              value={loading ? '—' : stats.activeProjects}
              to="/admin/projects"
              delay={0.12}
            />
            <StatCard
              icon={Clock}
              label="Pending Allocations"
              value={loading ? '—' : stats.pendingAllocations}
              to="/admin/allocation"
              accent="warning"
              delay={0.18}
              hint={<SectionHint text={sectionHints.adminStatPendingAllocations} />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl mb-5">Recent Activity</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : activity.length === 0 ? (
                  <p className="text-gray-400 text-sm">No recent activity yet.</p>
                ) : (
                  activity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.28 + i * 0.05 }}
                      className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-gray-700">{item.text}</span>
                      <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{item.time}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl mb-5 flex items-center">
                Quick Actions
                <SectionHint text={sectionHints.adminQuickActions} />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_ACTIONS.map(({ icon: Icon, label, to }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.34 + i * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link
                      to={to}
                      className="group flex flex-col items-center bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-white hover:border-[#2563a8]/30 hover:shadow-sm transition-colors text-center"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#2563a8]/10 text-[#2563a8] flex items-center justify-center mb-2 transition-colors group-hover:bg-[#2563a8] group-hover:text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-sm">{label}</div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}