import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'submission',
      title: 'New Submission',
      message: 'John Doe submitted "Project Proposal" for review',
      time: '1 hour ago',
      read: false
    },
    {
      id: 2,
      type: 'submission',
      title: 'New Submission',
      message: 'Jane Smith submitted "Literature Review" for review',
      time: '3 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'request',
      title: 'Project Request',
      message: 'Alice Williams has requested to work on "Machine Learning for Medical Diagnosis"',
      time: '5 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'deadline',
      title: 'Deadline Reminder',
      message: 'Project Proposal deadline is in 2 days (May 10, 2026). 1 student has not submitted yet.',
      time: '1 day ago',
      read: true
    },
    {
      id: 5,
      type: 'system',
      title: 'Student Progress Update',
      message: 'Mike Johnson has updated project progress to 80%',
      time: '1 day ago',
      read: true
    },
    {
      id: 6,
      type: 'request',
      title: 'Project Request',
      message: 'Bob Chen has requested to work on "Blockchain-Based Voting System"',
      time: '2 days ago',
      read: true
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-green-100 text-green-700';
      case 'request':
        return 'bg-blue-100 text-blue-700';
      case 'deadline':
        return 'bg-orange-100 text-orange-700';
      case 'system':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Notifications</h1>
              <p className="text-gray-600">You have {unreadCount} unread notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                Mark All as Read
              </button>
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
                )}
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Filter Tabs */}
            <div className="mb-6 flex gap-3">
              <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md">
                All
              </button>
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                Unread ({unreadCount})
              </button>
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                Submissions
              </button>
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                Requests
              </button>
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                Deadlines
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg p-5 border border-gray-200 shadow-sm ${
                    !notification.read ? 'border-l-4 border-l-[#2563a8]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-md text-sm ${getNotificationColor(notification.type)}`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                      <h3 className={`text-lg ${!notification.read ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">
                        Mark as Read
                      </button>
                    )}
                    {notification.type === 'submission' && (
                      <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-sm">
                        Review Submission
                      </button>
                    )}
                    {notification.type === 'request' && (
                      <button className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-sm">
                        View Request
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
