import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';

const users = [
  { id: 1, name: 'John Doe', email: 'john@student.edu', role: 'Student', status: 'Active', joined: 'Sep 2024' },
  { id: 2, name: 'Jane Smith', email: 'jane@student.edu', role: 'Student', status: 'Active', joined: 'Sep 2024' },
  { id: 3, name: 'Mike Johnson', email: 'mike@student.edu', role: 'Student', status: 'Active', joined: 'Sep 2024' },
  { id: 4, name: 'Dr. Sarah Johnson', email: 's.johnson@university.edu', role: 'Supervisor', status: 'Active', joined: 'Jan 2019' },
  { id: 5, name: 'Dr. Emily Chen', email: 'e.chen@university.edu', role: 'Supervisor', status: 'Active', joined: 'Mar 2020' },
  { id: 6, name: 'Prof. Michael Brown', email: 'm.brown@university.edu', role: 'Supervisor', status: 'Active', joined: 'Aug 2018' },
];

export default function ManageUsers() {
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

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
                + Add User
              </button>
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                >
                  <option>All</option>
                  <option>Student</option>
                  <option>Supervisor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Role</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Joined</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-200">
                    <td className="px-6 py-4">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${u.role === 'Student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-green-600">{u.status}</td>
                    <td className="px-6 py-4 text-gray-600">{u.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm">Edit</button>
                        <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
