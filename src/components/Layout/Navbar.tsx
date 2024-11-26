import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Microscope } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className={`${
      isHome ? 'bg-white/80 backdrop-blur-md' : 'bg-white'
    } sticky top-0 z-50 border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Microscope className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">SkinAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}