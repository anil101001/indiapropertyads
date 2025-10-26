import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  Home,
  Car,
  School,
  ShoppingBag,
  Building2,
} from 'lucide-react';

// Mock property data
const propertyData = {
  id: '1',
  title: 'Luxury 3BHK Apartment in Bandra West',
  price: 12500000,
  location: {
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Hill Road, Bandra West, Mumbai',
    pincode: '400050',
    coordinates: { lat: 19.0596, lng: 72.8295 },
  },
  type: 'residential' as const,
  category: 'apartment' as const,
  listingType: 'sale' as const,
  features: {
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    areaUnit: 'sqft' as const,
    parkingSpaces: 2,
    furnishing: 'semi-furnished' as const,
    floor: 8,
    totalFloors: 15,
  },
  amenities: [
    'Swimming Pool',
    'Gymnasium',
    '24/7 Security',
    'Power Backup',
    'Lift',
    'Club House',
    'Garden',
    'Children Play Area',
  ],
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
  ],
  description:
    'Spacious 3BHK apartment with sea view in prime Bandra West location. This property features modern interiors, ample natural light, and premium fixtures. Located near top schools, hospitals, and shopping centers. Perfect for families looking for luxury living.',
  aiScore: 92,
  aiValuation: 12800000,
  aiValuationRange: { min: 12200000, max: 13500000 },
  views: 245,
  agent: {
    id: 'agent1',
    name: 'Rajesh Kumar',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=3b82f6&color=fff',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@example.com',
    rating: 4.8,
    verified: true,
    totalDeals: 45,
  },
  verificationStatus: 'verified' as const,
  featured: true,
  createdAt: '2024-01-15',
  nearbyPlaces: [
    { name: 'Bandra Station', type: 'transport', distance: '1.2 km' },
    { name: 'Hill Road Market', type: 'shopping', distance: '0.5 km' },
    { name: 'Lilavati Hospital', type: 'hospital', distance: '2.1 km' },
    { name: 'St. Joseph High School', type: 'school', distance: '0.8 km' },
  ],
};

const similarProperties = [
  {
    id: '2',
    title: 'Modern 2BHK in Bandra',
    price: 9500000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    area: 1100,
    bedrooms: 2,
    aiScore: 88,
  },
  {
    id: '3',
    title: '4BHK Penthouse',
    price: 18500000,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
    area: 2200,
    bedrooms: 4,
    aiScore: 95,
  },
  {
    id: '4',
    title: 'Sea View 3BHK Apartment',
    price: 13200000,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
    area: 1500,
    bedrooms: 3,
    aiScore: 90,
  },
];

export default function PropertyDetail() {
  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  const property = propertyData;
  const pricePerSqft = Math.round(property.price / property.features.area);
  const aiValuationDiff = property.aiValuation - property.price;
  const aiValuationPercent = ((aiValuationDiff / property.price) * 100).toFixed(1);

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
              src={property.images[currentImage]}
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
                src={img}
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
                    {property.verificationStatus === 'verified' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    {property.featured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location.address}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    ₹{(property.price / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="text-gray-500">₹{pricePerSqft.toLocaleString()}/sqft</span>
                </div>
              </div>
            </div>

            {/* AI Valuation */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">AI Property Valuation</h2>
                <span className="ml-auto px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                  Score: {property.aiScore}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">AI Estimated Value</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{(property.aiValuation / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Value Range</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{(property.aiValuationRange.min / 10000000).toFixed(2)} - ₹
                    {(property.aiValuationRange.max / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Price Insight</p>
                  <p
                    className={`text-lg font-semibold ${
                      parseFloat(aiValuationPercent) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {parseFloat(aiValuationPercent) > 0 ? '+' : ''}
                    {aiValuationPercent}%
                    {parseFloat(aiValuationPercent) > 0 ? ' Below Market' : ' Above Market'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-700">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                AI analysis based on 500+ comparable properties, market trends, and location data.
                This property is priced {parseFloat(aiValuationPercent) > 0 ? 'below' : 'above'} the AI
                estimated value, making it a {parseFloat(aiValuationPercent) > 0 ? 'good' : 'premium'} deal.
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
                    <p className="font-semibold text-gray-900">{property.features.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold text-gray-900">{property.features.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Maximize className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold text-gray-900">
                      {property.features.area} {property.features.areaUnit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Parking</p>
                    <p className="font-semibold text-gray-900">{property.features.parkingSpaces}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Furnishing</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.features.furnishing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="font-semibold text-gray-900">
                      {property.features.floor}/{property.features.totalFloors}
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

            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                {/* Google Maps Placeholder */}
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.726!2d${property.location.coordinates.lng}!3d${property.location.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Property Location"
                ></iframe>
              </div>

              {/* Nearby Places */}
              <h3 className="font-semibold text-gray-900 mb-3">Nearby Places</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {property.nearbyPlaces.map((place, idx) => {
                  const icons: any = {
                    transport: <Car className="h-5 w-5" />,
                    shopping: <ShoppingBag className="h-5 w-5" />,
                    hospital: <Shield className="h-5 w-5" />,
                    school: <School className="h-5 w-5" />,
                  };
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-primary-600">{icons[place.type]}</div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{place.name}</p>
                        <p className="text-sm text-gray-600">{place.distance}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">AI Recommended Similar Properties</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/property/${prop.id}`}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 mb-1 line-clamp-1">{prop.title}</p>
                      <p className="text-primary-600 font-bold mb-2">
                        ₹{(prop.price / 10000000).toFixed(2)} Cr
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{prop.area} sqft</span>
                        <span className="text-primary-600 font-semibold">AI: {prop.aiScore}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Agent and Contact */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Listed By</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{property.agent.name}</p>
                    {property.agent.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {property.agent.rating} ({property.agent.totalDeals} deals)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Phone className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-900">{property.agent.phone}</span>
                </a>
                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Mail className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-900">{property.agent.email}</span>
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{property.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed On</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-semibold text-gray-900">{property.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
