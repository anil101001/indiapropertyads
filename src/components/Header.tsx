import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Menu, X, LogIn, UserPlus, LayoutDashboard, Shield, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              India<span className="text-primary-600">PropertyAds</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 ${
                isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/properties"
              className={`flex items-center space-x-1 ${
                isActive('/properties') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Properties</span>
            </Link>
            <Link
              to="/agent-dashboard"
              className={`flex items-center space-x-1 ${
                isActive('/agent-dashboard') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Agent Portal</span>
            </Link>
            <Link
              to="/admin-dashboard"
              className={`flex items-center space-x-1 ${
                isActive('/admin-dashboard') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
            <Link
              to="/admin-reports"
              className={`flex items-center space-x-1 ${
                isActive('/admin-reports') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Link>
            <Link
              to="/about"
              className={`${
                isActive('/about') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`${
                isActive('/contact') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/add-property"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              + List Property
            </Link>
            <Link
              to="/login"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-1 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/properties" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Properties
              </Link>
              <Link to="/agent-dashboard" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Agent Portal
              </Link>
              <Link to="/admin-dashboard" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Admin Dashboard
              </Link>
              <Link to="/admin-reports" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Admin Reports (AI)
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <Link
                to="/add-property"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                + List Property
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
