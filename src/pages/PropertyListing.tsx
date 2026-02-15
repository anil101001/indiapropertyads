import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin, Bed, Bath, Maximize, Heart, Eye, Loader2, AlertCircle, X, ArrowUpDown, Settings, Info } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { propertyService, Property } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import BudgetPreferencesModal from '../components/BudgetPreferencesModal';
import { api } from '../services/api';

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
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('type') || '', // Get listing type from URL
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    applyAffordability: false, // New affordability filter
    // Category & Segment
    propertyCategory: searchParams.get('propertyCategory') || '',
    segment: searchParams.get('segment') || '',
    // Compliance
    reraApproved: false,
    // Commercial features
    roadFacing: false,
    highFootfall: false,
    truckAccess: false,
    loadingBay: false,
    // Land/Plot specific filters
    plotSubType: '',
    ownershipType: '',
    legalStatus: '',
    layoutStatus: '',
    zoningClassification: [] as string[],
    boundaryWall: false,
    waterConnection: false,
    electricityConnection: false,
    cornerPlot: false,
    gatedSecurity: false,
    minPlotArea: '',
    maxPlotArea: '',
    areaUnit: 'sqft',
  });
  const [sortBy, setSortBy] = useState('-publishedAt'); // Default: newest first
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [userBudget, setUserBudget] = useState<{ min?: number; max?: number } | null>(null);
  const [showBudgetBanner, setShowBudgetBanner] = useState(true);

  // Helper to check if selected property type is commercial
  const isCommercialPropertyType = () => {
    return ['shop', 'office', 'warehouse', 'showroom',
      'co-working', 'commercial-building', 'it-park', 'industrial-shed', 'cold-storage',
      'restaurant', 'clinic', 'hotel', 'educational'
    ].includes(filters.propertyType);
  };

  // Helper to check if selected property type is land/plot
  const isLandPlotPropertyType = () => {
    return filters.propertyType === 'plot';
  };

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

  // Fetch user budget preferences
  useEffect(() => {
    const fetchUserBudget = async () => {
      if (user) {
        try {
          const response = await api.get('/users/me');
          if (response.success && response.data.preferences?.budget) {
            setUserBudget(response.data.preferences.budget);
          }
        } catch (error) {
          console.error('Failed to fetch user budget:', error);
        }
      }
    };
    fetchUserBudget();
  }, [user]);

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
  }, [pagination.page, filters.search, filters.city, filters.propertyType, filters.listingType, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.applyAffordability, filters.propertyCategory, filters.segment, filters.reraApproved, filters.roadFacing, filters.highFootfall, filters.truckAccess, filters.loadingBay, filters.plotSubType, filters.ownershipType, filters.legalStatus, filters.layoutStatus, filters.zoningClassification, filters.boundaryWall, filters.waterConnection, filters.electricityConnection, filters.cornerPlot, filters.gatedSecurity, filters.minPlotArea, filters.maxPlotArea, filters.areaUnit, sortBy, user?.role]);

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
        applyAffordability: filters.applyAffordability ? 'true' : undefined,
        // Land/Plot specific filters
        plotSubType: filters.plotSubType || undefined,
        ownershipType: filters.ownershipType || undefined,
        legalStatus: filters.legalStatus || undefined,
        layoutStatus: filters.layoutStatus || undefined,
        zoningClassification: filters.zoningClassification.length > 0 ? filters.zoningClassification.join(',') : undefined,
        boundaryWall: filters.boundaryWall ? 'true' : undefined,
        waterConnection: filters.waterConnection ? 'true' : undefined,
        electricityConnection: filters.electricityConnection ? 'true' : undefined,
        cornerPlot: filters.cornerPlot ? 'true' : undefined,
        gatedSecurity: filters.gatedSecurity ? 'true' : undefined,
        minPlotArea: filters.minPlotArea ? Number(filters.minPlotArea) : undefined,
        maxPlotArea: filters.maxPlotArea ? Number(filters.maxPlotArea) : undefined,
        areaUnit: filters.areaUnit || undefined,
        // New expanded filters
        propertyCategory: filters.propertyCategory || undefined,
        segment: filters.segment || undefined,
        reraApproved: filters.reraApproved ? 'true' : undefined,
        roadFacing: filters.roadFacing ? 'true' : undefined,
        highFootfall: filters.highFootfall ? 'true' : undefined,
        truckAccess: filters.truckAccess ? 'true' : undefined,
        loadingBay: filters.loadingBay ? 'true' : undefined,
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
    const newFilters = { ...filters, [key]: value };
    
    // Clear bedrooms filter when switching to commercial property type
    if (key === 'propertyType' && ['shop', 'office', 'warehouse', 'showroom',
      'co-working', 'commercial-building', 'it-park', 'industrial-shed', 'cold-storage',
      'restaurant', 'clinic', 'hotel', 'educational'
    ].includes(value)) {
      newFilters.bedrooms = '';
    }
    
    // Clear commercial filters when switching to non-commercial
    if (key === 'propertyType' && !['shop', 'office', 'warehouse', 'showroom',
      'co-working', 'commercial-building', 'it-park', 'industrial-shed', 'cold-storage',
      'restaurant', 'clinic', 'hotel', 'educational'
    ].includes(value)) {
      newFilters.roadFacing = false;
      newFilters.highFootfall = false;
      newFilters.truckAccess = false;
      newFilters.loadingBay = false;
    }
    
    // Clear land-specific filters when switching away from plot
    if (key === 'propertyType' && value !== 'plot') {
      newFilters.plotSubType = '';
      newFilters.ownershipType = '';
      newFilters.legalStatus = '';
      newFilters.layoutStatus = '';
      newFilters.zoningClassification = [];
      newFilters.boundaryWall = false;
      newFilters.waterConnection = false;
      newFilters.electricityConnection = false;
      newFilters.cornerPlot = false;
      newFilters.gatedSecurity = false;
      newFilters.minPlotArea = '';
      newFilters.maxPlotArea = '';
    }
    
    // Clear bedrooms when switching to plot
    if (key === 'propertyType' && value === 'plot') {
      newFilters.bedrooms = '';
    }
    
    setFilters(newFilters);
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
      applyAffordability: false,
      // Category & Segment
      propertyCategory: '',
      segment: '',
      // Compliance
      reraApproved: false,
      // Commercial features
      roadFacing: false,
      highFootfall: false,
      truckAccess: false,
      loadingBay: false,
      // Reset land/plot filters
      plotSubType: '',
      ownershipType: '',
      legalStatus: '',
      layoutStatus: '',
      zoningClassification: [],
      boundaryWall: false,
      waterConnection: false,
      electricityConnection: false,
      cornerPlot: false,
      gatedSecurity: false,
      minPlotArea: '',
      maxPlotArea: '',
      areaUnit: 'sqft',
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
    if (filters.applyAffordability) count++;
    // Land/Plot specific filter counts
    if (filters.plotSubType) count++;
    if (filters.ownershipType) count++;
    if (filters.legalStatus) count++;
    if (filters.layoutStatus) count++;
    if (filters.zoningClassification.length > 0) count++;
    if (filters.boundaryWall) count++;
    if (filters.waterConnection) count++;
    if (filters.electricityConnection) count++;
    if (filters.cornerPlot) count++;
    if (filters.gatedSecurity) count++;
    if (filters.minPlotArea || filters.maxPlotArea) count++;
    // New filter counts
    if (filters.propertyCategory) count++;
    if (filters.segment) count++;
    if (filters.reraApproved) count++;
    if (filters.roadFacing) count++;
    if (filters.highFootfall) count++;
    if (filters.truckAccess) count++;
    if (filters.loadingBay) count++;
    return count;
  };

  // Handle zoning classification multi-select toggle
  const handleZoningToggle = (value: string) => {
    const current = filters.zoningClassification;
    const newZoning = current.includes(value)
      ? current.filter(z => z !== value)
      : [...current, value];
    setFilters({ ...filters, zoningClassification: newZoning });
    setPagination({ ...pagination, page: 1 });
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
                    <optgroup label="Residential">
                      <option value="apartment">Apartment / Flat</option>
                      <option value="villa">Villa</option>
                      <option value="independent-house">Independent House</option>
                      <option value="row-house">Row House</option>
                      <option value="duplex">Duplex</option>
                      <option value="triplex">Triplex</option>
                      <option value="builder-floor">Builder Floor</option>
                      <option value="studio">Studio Apartment</option>
                      <option value="serviced-apartment">Serviced Apartment</option>
                      <option value="farmhouse">Farmhouse</option>
                      <option value="vacation-home">Vacation Home</option>
                    </optgroup>
                    <optgroup label="Living">
                      <option value="co-living">Co-living</option>
                      <option value="pg">PG / Hostel</option>
                      <option value="retirement-home">Retirement Home</option>
                    </optgroup>
                    <optgroup label="Land">
                      <option value="plot">Plot / Land</option>
                    </optgroup>
                    <optgroup label="Commercial - Office & Retail">
                      <option value="office">Office Space</option>
                      <option value="co-working">Co-working Space</option>
                      <option value="shop">Retail Shop</option>
                      <option value="showroom">Showroom</option>
                    </optgroup>
                    <optgroup label="Commercial - Industrial">
                      <option value="warehouse">Warehouse / Godown</option>
                      <option value="industrial-shed">Industrial Shed</option>
                      <option value="cold-storage">Cold Storage</option>
                      <option value="it-park">IT Park / SEZ</option>
                    </optgroup>
                    <optgroup label="Commercial - Hospitality">
                      <option value="restaurant">Restaurant / Cafe</option>
                      <option value="hotel">Hotel / Lodge</option>
                      <option value="clinic">Clinic / Hospital</option>
                      <option value="educational">Educational Institute</option>
                    </optgroup>
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
                    <option value="lease">For Lease</option>
                    <option value="pre-leased">Pre-Leased</option>
                    <option value="invest">Investment</option>
                    <option value="fractional">Fractional Ownership</option>
                    <option value="joint-venture">Joint Venture</option>
                    <option value="auction">Auction</option>
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

                {/* Bedrooms - Only show for residential properties (not commercial or plot) */}
                {!isCommercialPropertyType() && !isLandPlotPropertyType() && (
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
                )}
                {/* Segment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                  <select
                    value={filters.segment}
                    onChange={(e) => handleFilterChange('segment', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">All Segments</option>
                    <option value="affordable">Affordable</option>
                    <option value="mid-range">Mid-Range</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                    <option value="ultra-luxury">Ultra-Luxury</option>
                  </select>
                </div>

                {/* RERA Approved */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-primary-300 w-full">
                    <input
                      type="checkbox"
                      checked={filters.reraApproved}
                      onChange={(e) => setFilters({ ...filters, reraApproved: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">RERA Approved Only</span>
                  </label>
                </div>
              </div>

              {/* Commercial Feature Filters - Only show for commercial property types */}
              {isCommercialPropertyType() && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🏢</span> Commercial Features
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.roadFacing}
                        onChange={(e) => setFilters({ ...filters, roadFacing: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Road Facing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.highFootfall}
                        onChange={(e) => setFilters({ ...filters, highFootfall: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">High Footfall</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.truckAccess}
                        onChange={(e) => setFilters({ ...filters, truckAccess: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Truck Access</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.loadingBay}
                        onChange={(e) => setFilters({ ...filters, loadingBay: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Loading Bay</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Land/Plot Specific Filters - Only show when Plot/Land is selected */}
              {isLandPlotPropertyType() && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">🏞️</span> Land/Plot Specific Filters
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Plot Sub-Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plot Type</label>
                      <select
                        value={filters.plotSubType}
                        onChange={(e) => handleFilterChange('plotSubType', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">All Plot Types</option>
                        <option value="residential">Residential Plot</option>
                        <option value="commercial">Commercial Plot</option>
                        <option value="industrial">Industrial Plot</option>
                        <option value="agricultural">Agricultural Land</option>
                        <option value="sez">SEZ Plot</option>
                        <option value="mixed-use">Mixed-Use Land</option>
                      </select>
                    </div>

                    {/* Ownership Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                      <select
                        value={filters.ownershipType}
                        onChange={(e) => handleFilterChange('ownershipType', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Any Ownership</option>
                        <option value="freehold">Freehold</option>
                        <option value="leasehold">Leasehold</option>
                      </select>
                    </div>

                    {/* Legal Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Legal Status</label>
                      <select
                        value={filters.legalStatus}
                        onChange={(e) => handleFilterChange('legalStatus', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Any Status</option>
                        <option value="clear-title">Clear Title</option>
                        <option value="litigated">Litigated</option>
                        <option value="rera-approved">RERA Approved</option>
                      </select>
                    </div>

                    {/* Layout Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Layout Status</label>
                      <select
                        value={filters.layoutStatus}
                        onChange={(e) => handleFilterChange('layoutStatus', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Any Layout</option>
                        <option value="approved-municipal">Approved (Municipal)</option>
                        <option value="approved-rera">Approved (RERA)</option>
                        <option value="unapproved">Unapproved</option>
                        <option value="gated-community">Gated Community</option>
                      </select>
                    </div>

                    {/* Plot Area Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Plot Area</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPlotArea}
                          onChange={(e) => handleFilterChange('minPlotArea', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        />
                        <select
                          value={filters.areaUnit}
                          onChange={(e) => handleFilterChange('areaUnit', e.target.value)}
                          className="w-24 px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        >
                          <option value="sqft">sq.ft</option>
                          <option value="sqm">sq.m</option>
                          <option value="yards">yards</option>
                          <option value="acres">acres</option>
                          <option value="hectares">ha</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Plot Area</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPlotArea}
                        onChange={(e) => handleFilterChange('maxPlotArea', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Zoning Classification - Multi-select */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zoning Classification</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'approved-residential', label: 'Residential' },
                        { value: 'approved-commercial', label: 'Commercial' },
                        { value: 'approved-industrial', label: 'Industrial' },
                        { value: 'agricultural', label: 'Agricultural' },
                        { value: 'it-sez', label: 'IT/SEZ' },
                        { value: 'mixed-use-approved', label: 'Mixed-Use' },
                      ].map((zone) => (
                        <button
                          key={zone.value}
                          type="button"
                          onClick={() => handleZoningToggle(zone.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            filters.zoningClassification.includes(zone.value)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {zone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Land Amenities - Checkboxes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities & Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.boundaryWall}
                          onChange={(e) => setFilters({ ...filters, boundaryWall: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Boundary Wall</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.waterConnection}
                          onChange={(e) => setFilters({ ...filters, waterConnection: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Water Connection</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.electricityConnection}
                          onChange={(e) => setFilters({ ...filters, electricityConnection: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Electricity</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.cornerPlot}
                          onChange={(e) => setFilters({ ...filters, cornerPlot: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Corner Plot</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.gatedSecurity}
                          onChange={(e) => setFilters({ ...filters, gatedSecurity: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Gated Security</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Affordability Filter - Only show for logged-in users */}
              {user && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={filters.applyAffordability}
                        onChange={(e) => setFilters({ ...filters, applyAffordability: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900">Apply My Budget Filter</span>
                        <p className="text-xs text-gray-600 mt-1">
                          Show only properties within my saved budget preferences
                        </p>
                        {userBudget && (userBudget.min || userBudget.max) && (
                          <div className="mt-2 text-xs font-medium text-blue-700">
                            Budget Range: {userBudget.min ? formatPrice(userBudget.min) : 'Any'} - {userBudget.max ? formatPrice(userBudget.max) : 'Any'}
                          </div>
                        )}
                      </div>
                    </label>
                    <button
                      onClick={() => setShowBudgetModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
                    >
                      <Settings className="h-4 w-4" />
                      Set Budget
                    </button>
                  </div>
                </div>
              )}
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

        {/* Budget Filter Active Banner */}
        {!loading && filters.applyAffordability && userBudget && (userBudget.min || userBudget.max) && showBudgetBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Filtering by your budget preferences
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Showing properties between {userBudget.min ? formatPrice(userBudget.min) : 'any amount'} and {userBudget.max ? formatPrice(userBudget.max) : 'any amount'}
                    {properties.length > 0 && ` • ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBudgetBanner(false)}
                className="text-blue-600 hover:text-blue-800 transition"
                aria-label="Dismiss banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

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
                  {property.specs.bathrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span className="text-sm">{property.specs.bathrooms} Bath</span>
                    </div>
                  )}
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

      {/* Budget Preferences Modal */}
      <BudgetPreferencesModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={async () => {
          // Refresh user budget
          try {
            const response = await api.get('/users/me');
            if (response.success && response.data.preferences?.budget) {
              setUserBudget(response.data.preferences.budget);
              setShowBudgetBanner(true); // Show banner after saving
            }
          } catch (error) {
            console.error('Failed to refresh user budget:', error);
          }
          
          // Refresh properties if affordability filter is active
          if (filters.applyAffordability) {
            fetchProperties();
          }
        }}
      />
    </div>
  );
}
