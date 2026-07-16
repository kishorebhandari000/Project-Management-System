import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

const notifications = [
  { id: 1, type: 'feedback', message: 'Dr. Sarah Johnson has graded your Design Specification (82/100)', time: '2 hours ago', read: false },
  { id: 2, type: 'message', message: 'New message from Dr. Sarah Johnson', time: '3 hours ago', read: false },
  { id: 3, type: 'deadline', message: 'Project Proposal due in 5 days (May 10, 2026)', time: '1 day ago', read: true },
  { id: 4, type: 'system', message: 'Your project application has been approved', time: '3 days ago', read: true },
  { id: 5, type: 'forum', message: 'Admin posted: "Project Submission Deadline Extended"', time: '5 days ago', read: true },
];

const typeIcon: Record<string, string> = {
  feedback: '📝',
  message: '💬',
  deadline: '⏰',
  system: '🔔',
  forum: '📢',
};

export default function StudentNotifications() {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Notifications</h1>
              <p className="text-gray-600">Stay up-to-date with your project activities</p>
            </div>
            <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
              JD
            </Link>
          </div>
        </div>

        <div className="p-8 max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">{notifications.filter(n => !n.read).length} unread notifications</span>
            <button className="text-[#2563a8] hover:underline text-sm">Mark all as read</button>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-lg p-5 border shadow-sm flex items-start gap-4 ${!n.read ? 'border-[#2563a8] border-l-4' : 'border-gray-200'}`}
              >
                <span className="text-2xl">{typeIcon[n.type]}</span>
                <div className="flex-1">
                  <p className={`${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-[#2563a8] rounded-full mt-2 shrink-0"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
