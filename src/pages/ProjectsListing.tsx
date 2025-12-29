import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2, MapPin, Search, Filter, Heart, CheckCircle
} from 'lucide-react';
import { projectService, Project, getConstructionStatusColor, getConstructionStatusLabel, getSegmentLabel, getProjectTypeLabel, formatPrice, formatArea } from '../services/builderService';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal'
];

const PROJECT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed-use', label: 'Mixed Use' },
  { value: 'township', label: 'Township' },
  { value: 'villa', label: 'Villa' },
  { value: 'plotted-development', label: 'Plotted Development' }
];

const SEGMENTS = [
  { value: '', label: 'All Segments' },
  { value: 'affordable', label: 'Affordable' },
  { value: 'mid-range', label: 'Mid Range' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'ultra-luxury', label: 'Ultra Luxury' }
];

const CONSTRUCTION_STATUS = [
  { value: '', label: 'All Status' },
  { value: 'pre-launch', label: 'Pre-Launch' },
  { value: 'new-launch', label: 'New Launch' },
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'nearing-possession', label: 'Nearing Possession' },
  { value: 'ready-to-move', label: 'Ready to Move' }
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' }
];

export default function ProjectsListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    projectType: searchParams.get('projectType') || '',
    segment: searchParams.get('segment') || '',
    constructionStatus: searchParams.get('constructionStatus') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt:desc'
  });

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [sortField, sortOrder] = filters.sortBy.split(':');
      
      const data = await projectService.getProjects({
        search: filters.search || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        projectType: filters.projectType || undefined,
        segment: filters.segment || undefined,
        constructionStatus: filters.constructionStatus || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortField,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      setProjects(data.projects);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      state: '',
      projectType: '',
      segment: '',
      constructionStatus: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt:desc'
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.projectType) count++;
    if (filters.segment) count++;
    if (filters.constructionStatus) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  };

  const getBuilderInfo = (project: Project) => {
    if (typeof project.builder === 'string') {
      return { name: 'Builder', logo: null };
    }
    return {
      name: project.builder.brandName || project.builder.companyName,
      logo: project.builder.logo
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore New Projects</h1>
          <p className="text-primary-100 mb-6">Discover premium residential and commercial projects from verified builders</p>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by project name, location..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="px-4 py-3 rounded-lg text-gray-900 bg-white min-w-[150px]"
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Filter className="h-5 w-5" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={filters.projectType}
                  onChange={(e) => handleFilterChange('projectType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                <select
                  value={filters.segment}
                  onChange={(e) => handleFilterChange('segment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {SEGMENTS.map(seg => (
                    <option key={seg.value} value={seg.value}>{seg.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Construction Status</label>
                <select
                  value={filters.constructionStatus}
                  onChange={(e) => handleFilterChange('constructionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {CONSTRUCTION_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Min</option>
                  <option value="2000000">₹20 Lakhs</option>
                  <option value="3000000">₹30 Lakhs</option>
                  <option value="5000000">₹50 Lakhs</option>
                  <option value="7500000">₹75 Lakhs</option>
                  <option value="10000000">₹1 Crore</option>
                  <option value="20000000">₹2 Crores</option>
                  <option value="50000000">₹5 Crores</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Max</option>
                  <option value="3000000">₹30 Lakhs</option>
                  <option value="5000000">₹50 Lakhs</option>
                  <option value="7500000">₹75 Lakhs</option>
                  <option value="10000000">₹1 Crore</option>
                  <option value="20000000">₹2 Crores</option>
                  <option value="50000000">₹5 Crores</option>
                  <option value="100000000">₹10 Crores</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${pagination.total} projects found`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const builder = getBuilderInfo(project);
              return (
                <Link
                  key={project._id}
                  to={`/projects/${project.slug || project._id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    {project.media.images[0] ? (
                      <img
                        src={project.media.images[0].url}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConstructionStatusColor(project.construction.status)}`}>
                        {getConstructionStatusLabel(project.construction.status)}
                      </span>
                      {project.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Builder */}
                    <div className="flex items-center gap-2 mb-2">
                      {builder.logo ? (
                        <img src={builder.logo} alt={builder.name} className="h-6 w-6 rounded object-cover" />
                      ) : (
                        <div className="h-6 w-6 bg-primary-100 rounded flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-primary-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-500">{builder.name}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition mb-1">
                      {project.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      {project.location.locality}, {project.location.city}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {getProjectTypeLabel(project.projectType)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {getSegmentLabel(project.segment)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {project.details.totalUnits} Units
                      </span>
                    </div>

                    {/* Size & Price */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="text-sm font-medium">
                            {formatArea(project.details.sizeRange.min)} - {formatArea(project.details.sizeRange.max)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm font-semibold text-primary-600">
                            {formatPrice(project.details.priceRange.min)} - {formatPrice(project.details.priceRange.max)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RERA */}
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      RERA: {project.approvals.rera.registrationNumber}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-10 h-10 rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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
