import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import { Link } from 'react-router';

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<'students' | 'supervisors'>('students');

  const students = [
    { id: 1, name: 'John Doe', email: 'john.doe@university.edu', project: 'AI-Based Recommendation System', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@university.edu', project: 'E-commerce Platform', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@university.edu', project: 'Mobile Health App', status: 'Active' },
    { id: 4, name: 'Alice Williams', email: 'alice.w@university.edu', project: 'Not Assigned', status: 'Inactive' },
  ];

  const supervisors = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', students: 3, projects: 5 },
    { id: 2, name: 'Prof. Michael Brown', email: 'michael.b@university.edu', students: 4, projects: 6 },
    { id: 3, name: 'Dr. Emily Chen', email: 'emily.c@university.edu', students: 2, projects: 4 },
    { id: 4, name: 'Dr. Robert Lee', email: 'robert.l@university.edu', students: 5, projects: 7 },
  ];

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Users</h1>
              <p className="text-gray-600">Manage students and supervisors</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Add User
              </button>
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
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
          {/* Tab Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'students'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('supervisors')}
              className={`px-6 py-3 rounded-md ${
                activeTab === 'supervisors'
                  ? 'bg-[#2563a8] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Supervisors
            </button>
          </div>

          {/* Students Table */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Name</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Email</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Project</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{student.name}</td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">
                        <span className={student.project === 'Not Assigned' ? 'text-gray-500' : ''}>
                          {student.project}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={student.status === 'Active' ? 'text-green-600' : 'text-gray-500'}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                            Edit
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Supervisors Table */}
          {activeTab === 'supervisors' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Name</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Email</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Students</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Projects</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((supervisor) => (
                    <tr key={supervisor.id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{supervisor.name}</td>
                      <td className="px-6 py-4">{supervisor.email}</td>
                      <td className="px-6 py-4">{supervisor.students}</td>
                      <td className="px-6 py-4">{supervisor.projects}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                            Edit
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
