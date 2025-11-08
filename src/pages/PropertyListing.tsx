import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin, Bed, Bath, Maximize, Heart, Eye, Loader2, AlertCircle, X, ArrowUpDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { propertyService, Property } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';

// Format price in Indian format
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PropertyListing() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '', // Get search query from URL
    propertyType: '',
    listingType: searchParams.get('type') || '', // Get listing type from URL
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });
  const [sortBy, setSortBy] = useState('-publishedAt'); // Default: newest first
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(filters.search);

  // Indian cities list (top 50 cities)
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad'
  ].sort();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.search, filters.city, filters.propertyType, filters.listingType, filters.minPrice, filters.maxPrice, filters.bedrooms, sortBy, user?.role]);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      // Only show approved properties on public listing
      const response = await propertyService.getProperties({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined, // Text search
        city: filters.city || undefined,
        propertyType: filters.propertyType || undefined,
        listingType: filters.listingType || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
        status: 'approved', // Only approved properties
        sort: sortBy,
      });

      if (response.success) {
        setProperties(response.data.properties);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      propertyType: '',
      listingType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
    });
    setSearchInput('');
    setSortBy('-publishedAt');
    setPagination({ ...pagination, page: 1 });
  }, [pagination]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.listingType) count++;
    if (filters.city) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    return count;
  };

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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="-publishedAt">Newest First</option>
                <option value="pricing.expectedPrice">Price: Low to High</option>
                <option value="-pricing.expectedPrice">Price: High to Low</option>
                <option value="-stats.views">Most Viewed</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Filter Properties</h3>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">All Cities</option>
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="independent-house">Independent House</option>
                    <option value="plot">Plot</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                  <select
                    value={filters.listingType}
                    onChange={(e) => handleFilterChange('listingType', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">All Listings</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 2000000"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 10000000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Any Bedrooms</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${pagination.total} ${pagination.total === 1 ? 'Property' : 'Properties'} Found`}
            </h1>
            <p className="text-gray-600 mt-1">
              {filters.city ? `in ${filters.city}` : 'Showing verified listings'}
              {sortBy === '-publishedAt' && ' • Newest first'}
              {sortBy === 'pricing.expectedPrice' && ' • Price: Low to High'}
              {sortBy === '-pricing.expectedPrice' && ' • Price: High to Low'}
              {sortBy === '-stats.views' && ' • Most Viewed'}
            </p>
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No properties found. Try adjusting your filters.</p>
          </div>
        )}

        {/* Property Grid */}
        {!loading && !error && properties.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {properties.map((property) => (
            <Link
              key={property._id}
              to={`/property/${property._id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group"
            >
              {/* Property Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.images[0]?.url || '/placeholder-property.jpg'}
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
                    {property.propertyType}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>

                {/* Views */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  <Eye className="h-3 w-3" />
                  <span>{property.stats.views}</span>
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
                  <span className="text-sm">{property.address.city}</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-gray-700">
                  {property.specs.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm">{property.specs.bedrooms} Bed</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span className="text-sm">{property.specs.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4" />
                    <span className="text-sm">{property.specs.carpetArea} sqft</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(property.pricing.expectedPrice)}
                    </p>
                    <p className="text-xs text-gray-500">₹{Math.round(property.pricing.expectedPrice / property.specs.carpetArea).toLocaleString()}/sqft</p>
                  </div>
                  <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
                    {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === page
                        ? 'bg-primary-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
