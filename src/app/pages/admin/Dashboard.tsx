import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { api } from '../../lib/api';

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
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Students</div>
              <div className="text-3xl">{loading ? '—' : stats.totalStudents}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Supervisors</div>
              <div className="text-3xl">{loading ? '—' : stats.supervisors}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl">{loading ? '—' : stats.activeProjects}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Allocations</div>
              <div className="text-3xl text-orange-600">{loading ? '—' : stats.pendingAllocations}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Recent Activity</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : activity.length === 0 ? (
                  <p className="text-gray-400 text-sm">No recent activity yet.</p>
                ) : (
                  activity.map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{item.text}</span>
                      <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/users" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="text-sm">Manage Users</div>
                </Link>
                <Link to="/admin/projects/create" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-sm">Create Project</div>
                </Link>
                <Link to="/admin/allocation" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm">Manage Allocation</div>
                </Link>
                <Link to="/admin/reports" className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">View Reports</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}