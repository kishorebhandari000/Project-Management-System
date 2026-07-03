import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Route based on email address and save to localStorage
    if (email === 'admin@pms.com') {
      localStorage.setItem('userRole', 'Admin');
      localStorage.setItem('userName', 'Admin Team');
      localStorage.setItem('userEmail', email);
      navigate('/admin/dashboard');
    } else if (email === 'supervisor@pms.com') {
      localStorage.setItem('userRole', 'Supervisor');
      localStorage.setItem('userName', 'Dr. Sarah Johnson');
      localStorage.setItem('userEmail', email);
      navigate('/supervisor/dashboard');
    } else if (email === 'student@pms.com') {
      localStorage.setItem('userRole', 'Student');
      localStorage.setItem('userName', 'John Doe');
      localStorage.setItem('userEmail', email);
      navigate('/student/dashboard');
    } else {
      alert('Invalid email. Please use admin@pms.com, supervisor@pms.com, or student@pms.com');
    }
  };

  return (
    <div className="min-h-screen bg-[#2563a8] flex items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size="medium" />
          </div>
          <p className="text-gray-600">Project Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              placeholder="Enter your email"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use: admin@pms.com, supervisor@pms.com, or student@pms.com
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] mt-2"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/forgot-password" className="text-[#2563a8] hover:underline">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}
