import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [initials, setInitials] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadMe = async () => {
      try {
        const data = await api.get('/auth/me');
        setName(data.user.name);
        setEmail(data.user.email);
        setInitials(
          data.user.name
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        );
      } catch {
        setName(localStorage.getItem('userName') || '');
        setEmail(localStorage.getItem('userEmail') || '');
      }
    };
    loadMe();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileSaving(true);

    try {
      const data = await api.put('/profile', { name, email });
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                {initials || 'ST'}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-3xl">
                  {initials || 'ST'}
                </div>
                <div>
                  <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] mr-3">
                    Change Photo
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Personal Information</h2>

              {profileMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
                  {profileMessage}
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100"
                    defaultValue="Not set up yet"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Student ID field doesn't exist on the backend yet - coming in a later step.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Academic Information</h2>
              <p className="text-sm text-gray-500 mb-3">
                This section will populate once the Projects/Allocations module is connected.
              </p>
              <div className="space-y-3 opacity-50">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Current Project</span>
                  <span>Not connected yet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supervisor</span>
                  <span>Not connected yet</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl mb-5">Change Password</h2>

              {passwordMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
                  {passwordMessage}
                </div>
              )}
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}