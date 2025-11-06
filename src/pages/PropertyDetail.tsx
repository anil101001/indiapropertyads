import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  Share2,
  Phone,
  Mail,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Home,
  Car,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { propertyService, Property } from '../services/propertyService';

// Format price in Indian format
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  // Fetch property from backend
  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await propertyService.getPropertyById(id!);
      if (response.success) {
        setProperty(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            to="/properties"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const pricePerSqft = Math.round(property.pricing.expectedPrice / property.specs.carpetArea);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[500px]">
            <img
              src={property.images[currentImage]?.url || '/placeholder.jpg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white transition"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white transition"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentImage + 1} / {property.images.length}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-white/90 p-3 rounded-full hover:bg-white transition">
                <Heart className="h-5 w-5 text-gray-900" />
              </button>
              <button className="bg-white/90 p-3 rounded-full hover:bg-white transition">
                <Share2 className="h-5 w-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
            {property.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`View ${idx + 1}`}
                onClick={() => setCurrentImage(idx)}
                className={`h-20 w-32 object-cover rounded cursor-pointer border-2 ${
                  currentImage === idx ? 'border-primary-500' : 'border-transparent'
                } hover:border-primary-300 transition`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {property.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {property.status}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address.city}, {property.address.state}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(property.pricing.expectedPrice)}
                  </span>
                  <span className="text-gray-500">₹{pricePerSqft.toLocaleString()}/sqft</span>
                </div>
                {property.pricing.priceNegotiable && (
                  <span className="text-sm text-green-600">Price Negotiable</span>
                )}
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Property Statistics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {property.stats.views}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Inquiries</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {property.stats.inquiries}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Favorites</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {property.stats.favorites}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-700">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                This property has been viewed {property.stats.views} times with {property.stats.inquiries} inquiries.
              </p>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold text-gray-900">{property.specs.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold text-gray-900">{property.specs.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Maximize className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold text-gray-900">
                      {property.specs.carpetArea} sqft
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Parking</p>
                    <p className="font-semibold text-gray-900">{property.specs.parking.covered + property.specs.parking.open} Spaces</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Furnishing</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.specs.furnishing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="font-semibold text-gray-900">
                      {property.specs.floor || 'N/A'}/{property.specs.totalFloors || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">{property.address.fullAddress}</p>
                  <p className="text-sm text-gray-600">{property.address.city}, {property.address.state} - {property.address.pincode}</p>
                  {property.address.landmark && (
                    <p className="text-sm text-gray-600 mt-1">Near: {property.address.landmark}</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Owner Contact */}
          <div className="space-y-6">
            {/* Owner Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Listed By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">{property.owner.profile?.name?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{property.owner.profile?.name || 'Property Owner'}</p>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{property.owner.role}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${property.owner.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Phone className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-900">{property.owner.phone}</span>
                </a>
                <a
                  href={`mailto:${property.owner.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Mail className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-900">{property.owner.email}</span>
                </a>
              </div>

              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Schedule Viewing
              </button>

              {showContactForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <textarea
                    placeholder="Message (Optional)"
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                  ></textarea>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                    Submit Request
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{property.stats.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed On</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-semibold text-gray-900 text-xs">{property._id.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{property.propertyType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
