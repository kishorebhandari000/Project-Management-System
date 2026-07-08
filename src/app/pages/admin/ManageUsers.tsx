import Sidebar from '../../components/Sidebar';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../../lib/api';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'student';
  createdAt?: string;
}

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<'students' | 'supervisors'>('students');
  const [students, setStudents] = useState<ApiUser[]>([]);
  const [supervisors, setSupervisors] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'student' | 'supervisor'>('student');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const [studentRes, supervisorRes] = await Promise.all([
        api.get('/users?role=student'),
        api.get('/users?role=supervisor'),
      ]);
      setStudents(studentRes.users);
      setSupervisors(supervisorRes.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole(activeTab === 'students' ? 'student' : 'supervisor');
    setFormError('');
    setShowModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/users', {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

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
              <button
                onClick={openModal}
                className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]"
              >
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

          {loading && <p className="text-gray-500">Loading users...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!loading && activeTab === 'students' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Name</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Email</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                        No students yet. Click "Add User" to create one.
                      </td>
                    </tr>
                  )}
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{student.name}</td>
                      <td className="px-6 py-4">{student.email}</td>
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

          {!loading && activeTab === 'supervisors' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Name</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Email</th>
                    <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                        No supervisors yet. Click "Add User" to create one.
                      </td>
                    </tr>
                  )}
                  {supervisors.map((supervisor) => (
                    <tr key={supervisor.id} className="border-b border-gray-200">
                      <td className="px-6 py-4">{supervisor.name}</td>
                      <td className="px-6 py-4">{supervisor.email}</td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl mb-5">Add New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'student' | 'supervisor')}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                >
                  <option value="student">Student</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}