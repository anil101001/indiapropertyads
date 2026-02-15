import { Link } from 'react-router-dom';
import { Search, Building2, TrendingUp, Shield, Sparkles, MapPin, Home as HomeIcon, Store, Warehouse, Key, Hotel } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState<'sale' | 'rent'>('sale');

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary-600" />,
      title: 'AI-Powered Valuation',
      description: 'Get accurate property prices using our advanced AI engine trained on Indian market data.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Verified Listings',
      description: 'Every property is verified with RERA compliance and fraud detection checks.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Market Intelligence',
      description: 'Access real-time market trends, price analytics, and neighborhood insights.',
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: 'Map-First Discovery',
      description: 'Explore properties on interactive maps with commute time calculations.',
    },
  ];

  const propertyTypes = [
    { icon: <Building2 className="h-12 w-12" />, name: 'Apartments', count: '2,500+', link: '/properties?propertyType=apartment' },
    { icon: <HomeIcon className="h-12 w-12" />, name: 'Villas & Houses', count: '850+', link: '/properties?propertyType=villa' },
    { icon: <Store className="h-12 w-12" />, name: 'Offices & Shops', count: '1,200+', link: '/properties?propertyCategory=commercial' },
    { icon: <MapPin className="h-12 w-12" />, name: 'Plots & Land', count: '670+', link: '/properties?propertyType=plot' },
    { icon: <Warehouse className="h-12 w-12" />, name: 'Warehouses', count: '320+', link: '/properties?propertyType=warehouse' },
    { icon: <TrendingUp className="h-12 w-12" />, name: 'Pre-Leased', count: '180+', link: '/properties?type=pre-leased' },
    { icon: <Key className="h-12 w-12" />, name: 'Rental Homes', count: '1,800+', link: '/properties?type=rent' },
    { icon: <Hotel className="h-12 w-12" />, name: 'Hospitality', count: '90+', link: '/properties?propertyType=hotel' },
  ];

  const cities = [
    { name: 'Hyderabad', properties: 50, image: 'https://images.unsplash.com/photo-1603813507806-0d4e5e5d3f1e?w=400' },
    { name: 'Bangalore', properties: 0, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400', comingSoon: true },
    { name: 'Mumbai', properties: 0, image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400', comingSoon: true },
    { name: 'Chennai', properties: 0, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', comingSoon: true },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream Property with <span className="text-yellow-300">AI Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100">
              India's most transparent and trusted real estate marketplace
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Buy/Rent Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPropertyType('sale')}
                    className={`flex-1 px-6 py-3 rounded-md font-semibold transition ${
                      propertyType === 'sale'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setPropertyType('rent')}
                    className={`flex-1 px-6 py-3 rounded-md font-semibold transition ${
                      propertyType === 'rent'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rent
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex-grow relative">
                  <input
                    type="text"
                    placeholder="Search by city, locality, or project name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-900"
                  />
                  <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Search Button */}
                <Link
                  to={`/properties?type=${propertyType}&q=${searchQuery}`}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">10,000+</p>
                <p className="text-gray-200 mt-1">Verified Properties</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">2,500+</p>
                <p className="text-gray-200 mt-1">Trusted Agents</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">50+</p>
                <p className="text-gray-200 mt-1">Cities Covered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">95%</p>
                <p className="text-gray-200 mt-1">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose India Property Ads?
            </h2>
            <p className="text-xl text-gray-600">
              Powered by AzentiqAI - The most advanced real estate intelligence platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Property Types
            </h2>
            <p className="text-xl text-gray-600">Find the perfect property that matches your needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyTypes.map((type, index) => (
              <Link
                key={index}
                to={type.link}
                className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl text-center hover:shadow-xl transition transform hover:-translate-y-2"
              >
                <div className="flex justify-center text-primary-600 mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-primary-600 font-medium">{type.count} Properties</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Properties by Top Cities
            </h2>
            <p className="text-xl text-gray-600">Discover real estate opportunities across India</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city: any, index: number) => (
              city.comingSoon ? (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-xl shadow-lg opacity-80"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-64 object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                    <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full w-fit">Coming Soon</span>
                  </div>
                </div>
              ) : (
                <Link
                  key={index}
                  to={`/properties?city=${city.name}`}
                  className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-gray-200">{city.properties}+ Properties</p>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to List Your Property?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of agents and property owners who trust India Property Ads
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/add-property"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              List Property Now
            </Link>
            <Link
              to="/register"
              className="bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition text-lg border-2 border-white"
            >
              Register as Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
