import { Link } from 'react-router';
import Logo from './Logo';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  const dashboardPath = userRole ? `/${userRole}/dashboard` : '/login';
  const isLoggedIn = Boolean(token && userRole);
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : '?';

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo size="large" color="default" />
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Home
          </Link>
          <Link to="/#features" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Features
          </Link>
          <Link to="/#about" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            About
          </Link>
          <Link to="/#contact" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Contact
          </Link>
          <Link to="/guide" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Guide
          </Link>

          {isLoggedIn ? (
            <Link
              to={dashboardPath}
              title={userName || 'Dashboard'}
              className="w-10 h-10 rounded-full bg-[#2563a8] text-white flex items-center justify-center font-semibold hover:bg-[#1e4a8a] transition-colors"
            >
              {initial}
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}