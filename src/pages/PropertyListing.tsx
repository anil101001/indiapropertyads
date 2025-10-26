import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Bed, Bath, Maximize, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const properties = [
  {
    id: '1',
    title: 'Luxury 3BHK Apartment in Bandra West',
    price: 12500000,
    location: { city: 'Mumbai', address: 'Bandra West, Mumbai'},
    type: 'residential' as const,
    category: 'apartment' as const,
    listingType: 'sale' as const,
    features: { bedrooms: 3, bathrooms: 2, area: 1450, areaUnit: 'sqft' as const },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    aiScore: 92,
    verified: true,
    views: 245,
  },
  {
    id: '2',
    title: 'Modern 2BHK Flat Near Koramangala',
    price: 8500000,
    location: { city: 'Bangalore', address: 'Koramangala, Bangalore' },
    type: 'residential' as const,
    category: 'apartment' as const,
    listingType: 'sale' as const,
    features: { bedrooms: 2, bathrooms: 2, area: 1100, areaUnit: 'sqft' as const },
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    aiScore: 88,
    verified: true,
    views: 312,
  },
  {
    id: '3',
    title: 'Spacious Villa with Garden in Whitefield',
    price: 22000000,
    location: { city: 'Bangalore', address: 'Whitefield, Bangalore' },
    type: 'residential' as const,
    category: 'villa' as const,
    listingType: 'sale' as const,
    features: { bedrooms: 4, bathrooms: 3, area: 2800, areaUnit: 'sqft' as const },
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    aiScore: 95,
    verified: true,
    views: 456,
  },
  {
    id: '4',
    title: 'Commercial Office Space in Connaught Place',
    price: 35000000,
    location: { city: 'Delhi', address: 'Connaught Place, Delhi' },
    type: 'commercial' as const,
    category: 'office' as const,
    listingType: 'sale' as const,
    features: { bedrooms: 0, bathrooms: 2, area: 1800, areaUnit: 'sqft' as const },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    aiScore: 90,
    verified: true,
    views: 189,
  },
];

export default function PropertyListing() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceMin: '',
    priceMax: '',
    bedrooms: 'any',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />

              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="any">Any Bedrooms</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{properties.length} Properties Found</h1>
            <p className="text-gray-600 mt-1">Showing verified listings in your area</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {properties.map((property) => (
            <Link
              key={property.id}
              to={`/property/${property.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group"
            >
              {/* Property Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.verified && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                    AI Score: {property.aiScore}%
                  </span>
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>

                {/* Views */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  <Eye className="h-3 w-3" />
                  <span>{property.views}</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                    {property.title}
                  </h3>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.location.address}</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-gray-700">
                  {property.features.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm">{property.features.bedrooms} Bed</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span className="text-sm">{property.features.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4" />
                    <span className="text-sm">{property.features.area} {property.features.areaUnit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      ₹{(property.price / 10000000).toFixed(2)} Cr
                    </p>
                    <p className="text-xs text-gray-500">₹{Math.round(property.price / property.features.area).toLocaleString()}/sqft</p>
                  </div>
                  <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
                    {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
