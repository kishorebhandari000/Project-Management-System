import { Link } from 'react-router';
import { useEffect, useState } from 'react';

interface ProfileAvatarProps {
  role: 'admin' | 'student' | 'supervisor';
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileAvatar({ role }: ProfileAvatarProps) {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName'));

  useEffect(() => {
    const handleUpdate = () => setUserName(localStorage.getItem('userName'));
    window.addEventListener('userNameUpdated', handleUpdate);
    return () => window.removeEventListener('userNameUpdated', handleUpdate);
  }, []);

  const initials = getInitials(userName);

  return (
    <Link
      to={`/${role}/profile`}
      className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer"
      title={userName || undefined}
    >
      {initials}
    </Link>
  );
}