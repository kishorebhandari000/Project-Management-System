import { Link } from 'react-router';
import Logo from './Logo';
import LoginButton from './LoginButton';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/">
          <Logo size="small" />
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-gray-700 hover:text-[#2563a8]">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-[#2563a8]">About</Link>
          <Link to="/features" className="text-gray-700 hover:text-[#2563a8]">Features</Link>
          <Link to="/contact" className="text-gray-700 hover:text-[#2563a8]">Contact</Link>
          <LoginButton as={Link} to="/login">Login</LoginButton>
        </div>
      </div>
    </nav>
  );
}
