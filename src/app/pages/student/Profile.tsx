import Sidebar from '../../components/Sidebar';
import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { validatePasswordStrength, PASSWORD_REQUIREMENTS_HINT } from '../../lib/validatePassword';
import NotificationBell from '../../components/NotificationBell';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function StudentProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then((data) => {
        setName(data.user.name);
        setEmail(data.user.email);
      })
      .catch((err) => setSaveError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError('');
    setSaveMessage('');
    setSaving(true);
    try {
      const data = await api.put('/profile', { name });
      setName(data.user.name);
      localStorage.setItem('userName', data.user.name);
      window.dispatchEvent(new Event('userNameUpdated'));
      setSaveMessage('Profile updated successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      setPasswordError(passwordCheck.message ?? 'Invalid password');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">My Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
            <NotificationBell role="student" />

          </div>
        </div>

        <div className="p-8 max-w-2xl space-y-6">
          {loading && <p className="text-gray-500">Loading profile...</p>}

          {!loading && (
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="w-20 h-20 bg-[#2563a8] rounded-full flex items-center justify-center text-white text-3xl">
                  {name ? getInitials(name) : '?'}
                </div>
                <div>
                  <h2 className="text-2xl">{name || 'Student'}</h2>
                  <p className="text-gray-500">Student</p>
                </div>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                  {saveError}
                </div>
              )}
              {saveMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
                  {saveMessage}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-gray-600 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact an administrator to change your email.</p>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-4">Change Password</h2>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                {passwordError}
              </div>
            )}
            {passwordMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-gray-600 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-400 mt-1">{PASSWORD_REQUIREMENTS_HINT}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  required
                  minLength={8}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] transition-colors disabled:opacity-60"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}