import { Link, useLocation } from 'react-router';
import Logo from './Logo';

interface SidebarProps {
  role: 'student' | 'supervisor' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/projects', label: 'Browse Projects' },
    { to: '/student/assessments', label: 'Assessments' },
    { to: '/student/feedback', label: 'Feedback & Marks' },
    { to: '/student/discussions', label: 'Discussions' },
    { to: '/student/messages', label: 'Messages' },
  ];

  const supervisorLinks = [
    { to: '/supervisor/dashboard', label: 'Dashboard' },
    { to: '/supervisor/projects', label: 'Manage Projects' },
    { to: '/supervisor/assessments', label: 'Assessments' },
    { to: '/supervisor/feedback', label: 'Feedback' },
    { to: '/supervisor/discussions', label: 'Discussions' },
    { to: '/supervisor/messages', label: 'Messages' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/projects', label: 'Manage Projects' },
    { to: '/admin/allocation', label: 'Manage Allocation' },
    { to: '/admin/assessments', label: 'Assessments' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/forum', label: 'Public Forum' },
    { to: '/admin/discussions', label: 'Discussions' },
    { to: '/admin/messages', label: 'Messages' },
  ];

  const links = role === 'student' ? studentLinks : role === 'supervisor' ? supervisorLinks : adminLinks;

  return (
    <div className="w-64 bg-[#1e3a5f] min-h-screen text-white p-5">
      <Link to="/" className="mb-8 mt-2 block cursor-pointer hover:opacity-80 transition-opacity">
        <Logo size="small" color="white" />
      </Link>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-3 rounded-md transition-colors block ${
              location.pathname === link.to
                ? 'bg-[#2563a8]'
                : 'hover:bg-[#2a4a70]'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-10 pt-6 border-t border-gray-600">
        <Link
          to="/login"
          onClick={() => {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
          }}
          className="px-4 py-3 rounded-md hover:bg-[#2a4a70] block"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}