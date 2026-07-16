import { Link } from 'react-router';
import Logo from './Logo';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo color="dark" />
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Features
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-[#2563a8] transition-colors">
            Contact
          </Link>
          <Link
            to="/login"
            className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
