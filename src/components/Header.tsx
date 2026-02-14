import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Menu, X, LogIn, UserPlus, LayoutDashboard, Shield, BarChart3, User, LogOut, ChevronDown, Clock, Users, Store, TrendingUp, MapPin, Key } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleDropdownEnter = (menu: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(menu);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
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

          {/* Desktop Navigation - Mega Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Buy Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('buy')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                to="/properties?type=sale"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeDropdown === 'buy' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Buy</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
              {activeDropdown === 'buy' && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                  <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Residential</p>
                  <Link to="/properties?type=sale&propertyType=apartment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Apartments / Flats</Link>
                  <Link to="/properties?type=sale&propertyType=villa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Villas</Link>
                  <Link to="/properties?type=sale&propertyType=independent-house" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Independent Houses</Link>
                  <Link to="/properties?type=sale&propertyType=row-house" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Row Houses</Link>
                  <Link to="/properties?type=sale&propertyType=duplex" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Duplex / Triplex</Link>
                  <Link to="/properties?type=sale&propertyType=builder-floor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Builder Floor</Link>
                  <Link to="/properties?type=sale&propertyType=studio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Studio Apartments</Link>
                  <Link to="/properties?type=sale&propertyType=farmhouse" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Farmhouses</Link>
                  <div className="border-t my-1"></div>
                  <Link to="/properties?type=sale" className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50">View All Buy &rarr;</Link>
                </div>
              )}
            </div>

            {/* Rent Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('rent')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                to="/properties?type=rent"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeDropdown === 'rent' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>Rent</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
              {activeDropdown === 'rent' && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                  <Link to="/properties?type=rent&propertyType=apartment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Apartments / Flats</Link>
                  <Link to="/properties?type=rent&propertyType=villa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Villas / Houses</Link>
                  <Link to="/properties?type=rent&propertyType=co-living" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Co-living / PG</Link>
                  <Link to="/properties?type=rent&propertyType=serviced-apartment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Serviced Apartments</Link>
                  <Link to="/properties?type=rent&propertyType=vacation-home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Vacation Homes</Link>
                  <div className="border-t my-1"></div>
                  <Link to="/properties?type=rent" className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50">View All Rent &rarr;</Link>
                </div>
              )}
            </div>

            {/* Commercial Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('commercial')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                to="/properties?propertyCategory=commercial"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeDropdown === 'commercial' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Commercial</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
              {activeDropdown === 'commercial' && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-xl border py-2 z-50">
                  <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Office & Retail</p>
                  <Link to="/properties?propertyType=office" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Office Spaces</Link>
                  <Link to="/properties?propertyType=co-working" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Co-working Spaces</Link>
                  <Link to="/properties?propertyType=shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Retail Shops</Link>
                  <Link to="/properties?propertyType=showroom" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Showrooms</Link>
                  <div className="border-t my-1"></div>
                  <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Industrial & Logistics</p>
                  <Link to="/properties?propertyType=warehouse" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Warehouses / Godowns</Link>
                  <Link to="/properties?propertyType=industrial-shed" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Industrial Sheds</Link>
                  <Link to="/properties?propertyType=cold-storage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Cold Storage</Link>
                  <Link to="/properties?propertyType=it-park" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">IT Parks / SEZ</Link>
                  <div className="border-t my-1"></div>
                  <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hospitality & Others</p>
                  <Link to="/properties?propertyType=restaurant" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Restaurants / Cafes</Link>
                  <Link to="/properties?propertyType=hotel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Hotels / Lodges</Link>
                  <Link to="/properties?propertyType=clinic" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Clinics / Hospitals</Link>
                  <div className="border-t my-1"></div>
                  <Link to="/properties?propertyCategory=commercial" className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50">View All Commercial &rarr;</Link>
                </div>
              )}
            </div>

            {/* Land & Plots */}
            <Link
              to="/properties?propertyType=plot"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/properties') && location.search.includes('plot') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Land & Plots</span>
            </Link>

            {/* Invest Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('invest')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                to="/properties?type=pre-leased"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeDropdown === 'invest' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Invest</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
              {activeDropdown === 'invest' && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                  <Link to="/properties?type=pre-leased" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Pre-Leased Properties</Link>
                  <Link to="/properties?type=lease" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Lease Properties</Link>
                  <Link to="/properties?type=invest" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Investment Deals</Link>
                  <Link to="/properties?type=fractional" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Fractional Ownership</Link>
                  <Link to="/properties?type=joint-venture" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Joint Ventures</Link>
                  <Link to="/properties?segment=luxury" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Luxury Properties</Link>
                </div>
              )}
            </div>

            {/* Projects */}
            <Link
              to="/projects"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/projects') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Projects</span>
            </Link>

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('more')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeDropdown === 'more' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <span>More</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {activeDropdown === 'more' && (
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-xl border py-2 z-50">
                  <Link to="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">About Us</Link>
                  <Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Contact</Link>
                  {isAuthenticated && user?.role === 'admin' && (
                    <>
                      <div className="border-t my-1"></div>
                      <Link to="/admin-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <Shield className="inline h-4 w-4 mr-2" />Admin
                      </Link>
                      <Link to="/admin-reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <BarChart3 className="inline h-4 w-4 mr-2" />Reports
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
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
                    {user?.role === 'buyer' && (
                      <Link
                        to="/buyer-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="inline h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    )}
                    {(user?.role === 'owner' || user?.role === 'agent') && (
                      <>
                        <Link
                          to="/owner-dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="inline h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-properties"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home className="inline h-4 w-4 mr-2" />
                          My Properties
                        </Link>
                        <Link
                          to="/crm"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Users className="inline h-4 w-4 mr-2" />
                          CRM / Leads
                        </Link>
                        <Link
                          to="/builder/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Building2 className="inline h-4 w-4 mr-2" />
                          Builder Portal
                        </Link>
                      </>
                    )}
                    {user?.role === 'agent' && (
                      <Link
                        to="/agent-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="inline h-4 w-4 mr-2" />
                        Agent Tools
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
                          to="/admin-cockpit"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Users className="inline h-4 w-4 mr-2" />
                          User Management
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
          <div className="lg:hidden py-4 border-t max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              <Link to="/" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
              <Link to="/properties?type=sale" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Buy
              </Link>
              <Link to="/properties?type=rent" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Rent
              </Link>
              <Link to="/properties?propertyCategory=commercial" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Commercial
              </Link>
              <Link to="/properties?propertyType=plot" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Land & Plots
              </Link>
              <Link to="/properties?type=pre-leased" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Invest / Pre-Leased
              </Link>
              <Link to="/projects" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Projects
              </Link>
              <div className="border-t my-2"></div>
              <Link to="/about" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isAuthenticated && (user?.role === 'owner' || user?.role === 'agent') && (
                <>
                  <Link
                    to="/crm"
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CRM / Leads
                  </Link>
                  <Link
                    to="/builder/dashboard"
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Builder Portal
                  </Link>
                  <Link
                    to="/add-property"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    + List Property
                  </Link>
                </>
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
                    <>
                      <Link to="/admin-dashboard" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin-cockpit" className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                        User Management
                      </Link>
                    </>
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
