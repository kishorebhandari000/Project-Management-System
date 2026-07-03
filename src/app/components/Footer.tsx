import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg">PMS — Project Management System</div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <Link to="/features" className="hover:text-gray-300">Features</Link>
            <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          </div>
        </div>
        <div className="text-gray-400 text-sm text-center pt-4 border-t border-gray-600">
          © 2026 PMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
