import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import Logo from './Logo';
import { TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { sectionHints } from '../lib/sectionHints';

interface SidebarProps {
  role: 'student' | 'supervisor' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', hint: sectionHints.navDashboard },
    { to: '/student/projects', label: 'Browse Projects', hint: sectionHints.navBrowseProjects },
    { to: '/student/assessments', label: 'Assessments', hint: sectionHints.navAssessments },
    { to: '/forum', label: 'Forum', hint: sectionHints.navForum },
    { to: '/student/discussions', label: 'Discussions', hint: sectionHints.navDiscussions },
    { to: '/student/messages', label: 'Messages', hint: sectionHints.navMessages },
  ];

  const supervisorLinks = [
    { to: '/supervisor/dashboard', label: 'Dashboard', hint: sectionHints.navDashboard },
    { to: '/supervisor/projects', label: 'Manage Projects', hint: sectionHints.navManageProjectsSupervisor },
    { to: '/supervisor/assessments', label: 'Assessments', hint: sectionHints.navAssessments },
    { to: '/forum', label: 'Forum', hint: sectionHints.navForum },
    { to: '/supervisor/discussions', label: 'Discussions', hint: sectionHints.navDiscussions },
    { to: '/supervisor/messages', label: 'Messages', hint: sectionHints.navMessages },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', hint: sectionHints.navDashboard },
    { to: '/admin/users', label: 'Manage Users', hint: sectionHints.navManageUsers },
    { to: '/admin/projects', label: 'Manage Projects', hint: sectionHints.navManageProjectsAdmin },
    { to: '/admin/allocation', label: 'Manage Allocation', hint: sectionHints.navManageAllocation },
    { to: '/admin/assessments', label: 'Assessments', hint: sectionHints.navAssessments },
    { to: '/admin/reports', label: 'Reports', hint: sectionHints.navReports },
    { to: '/forum', label: 'Forum', hint: sectionHints.navForum },
    { to: '/admin/discussions', label: 'Discussions', hint: sectionHints.navDiscussions },
    { to: '/admin/messages', label: 'Messages', hint: sectionHints.navMessages },
  ];

  const links = role === 'student' ? studentLinks : role === 'supervisor' ? supervisorLinks : adminLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  };

  const navContent = (
    <>
      <TooltipProvider delayDuration={300} skipDelayDuration={0}>
        <nav className="space-y-2">
          {links.map((link) => (
            <div
              key={link.to}
              className={`rounded-md transition-colors ${
                location.pathname === link.to
                  ? 'bg-[#2563a8]'
                  : 'hover:bg-[#2a4a70]'
              }`}
            >
              <TooltipPrimitive.Root>
                <TooltipTrigger asChild>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 block"
                  >
                    {link.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {link.hint}
                </TooltipContent>
              </TooltipPrimitive.Root>
            </div>
          ))}
        </nav>
      </TooltipProvider>
      <div className="mt-10 pt-6 border-t border-gray-600">
        <Link
          to="/login"
          onClick={handleLogout}
          className="px-4 py-3 rounded-md hover:bg-[#2a4a70] block"
        >
          Logout
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e3a5f] text-white flex items-center justify-between px-4 py-3">
        <Link to="/" className="block">
          <Logo size="small" color="white" />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md hover:bg-[#2a4a70]"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-64 bg-[#1e3a5f] text-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-8 mt-2">
              <Logo size="small" color="white" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-md hover:bg-[#2a4a70]"
              >
                <X size={22} />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-[#1e3a5f] min-h-screen text-white p-5">
        <Link to="/" className="mb-8 mt-2 block cursor-pointer hover:opacity-80 transition-opacity">
          <Logo size="small" color="white" />
        </Link>
        {navContent}
      </div>
    </>
  );
}