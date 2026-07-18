import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface ProjectFile {
  url: string;
  name: string;
}

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  project: {
    _id: string;
    title: string;
    status: string;
    description?: string;
    maxStudents?: number;
    files?: ProjectFile[];
  };
  supervisor: {
    name: string;
  };
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState('');
  const [currentAllocation, setCurrentAllocation] = useState<ApiAllocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Student');

    const load = async () => {
      try {
        const data = await api.get('/allocations?status=approved');
        setCurrentAllocation(data.allocations[0] || null);
      } catch {
        setCurrentAllocation(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                {userName ? userName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) : 'ST'}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Current Project</div>
              <div className="text-3xl">{currentAllocation ? 1 : 0}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Assessments</div>
              <div className="text-3xl">-</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Submitted</div>
              <div className="text-3xl">-</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Mark</div>
              <div className="text-3xl">-</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 -mt-6 mb-6">
            Pending Assessments / Submitted / Average Mark need the Assessments module, not built yet.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Current Project */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Current Project</h2>

              {loading && <p className="text-gray-500">Loading...</p>}

              {!loading && !currentAllocation && (
                <div>
                  <p className="text-gray-500 mb-3">You don't have an approved project yet.</p>
                  <Link to="/student/projects" className="text-[#2563a8] hover:underline">
                    Browse available projects
                  </Link>
                </div>
              )}

             {!loading && currentAllocation && (
                <>
                  <div className="mb-3">
                    <div className="text-gray-600">Title</div>
                    <div className="text-lg">{currentAllocation.project.title}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-600">Supervisor</div>
                    <div>{currentAllocation.supervisor?.name}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-600">Status</div>
                    <span className="text-green-600">Active</span>
                  </div>
                  {currentAllocation.project.maxStudents !== undefined && (
                    <div className="mb-3">
                      <div className="text-gray-600">Group Size</div>
                      <div>Up to {currentAllocation.project.maxStudents} member(s)</div>
                    </div>
                  )}
                  {currentAllocation.project.description && (
                    <div className="mb-3">
                      <div className="text-gray-600">Description</div>
                      <p className="text-sm">{currentAllocation.project.description}</p>
                    </div>
                  )}
                  {currentAllocation.project.files && currentAllocation.project.files.length > 0 && (
                    <div className="mb-3">
                      <div className="text-gray-600 mb-1">Files</div>
                      <ul className="space-y-1">
                        {currentAllocation.project.files.map((f, idx) => (
                          <li key={idx}>
                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#2563a8] hover:underline text-sm">
                              📎 {f.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600">Progress</div>
                    <p className="text-sm text-gray-400 mt-1">
                      Progress tracking isn't built yet - needs the Assessments module.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Upcoming Deadlines</h2>
              <p className="text-sm text-gray-400">Needs the Assessments module - not built yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}