import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Menu, X, LogIn, UserPlus, LayoutDashboard, Shield, BarChart3, User, LogOut, ChevronDown, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

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
            {isAuthenticated && (user?.role === 'owner' || user?.role === 'agent') && (
              <Link
                to="/add-property"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                + List Property
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full mt-1 inline-block capitalize">
                        {user?.role}
                      </span>
                    </div>
                    {(user?.role === 'owner' || user?.role === 'agent') && (
                      <Link
                        to="/my-properties"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Home className="inline h-4 w-4 mr-2" />
                        My Properties
                      </Link>
                    )}
                    {user?.role === 'agent' && (
                      <Link
                        to="/agent-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="inline h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin-dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="inline h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                        <Link
                          to="/admin-pending-properties"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Clock className="inline h-4 w-4 mr-2" />
                          Pending Properties
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
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
              {isAuthenticated && (user?.role === 'owner' || user?.role === 'agent') && (
                <Link
                  to="/add-property"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + List Property
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  {user?.role === 'agent' && (
                    <Link to="/agent-dashboard" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                      Agent Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin-dashboard" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="text-red-600 hover:text-red-700 text-left w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
