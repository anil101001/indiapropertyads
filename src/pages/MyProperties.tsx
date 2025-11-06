import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Edit, Trash2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { propertyService, Property } from '../services/propertyService';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
    'draft': { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    'pending-approval': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    'approved': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    'rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    'sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
    'rented': { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle },
  };

  const config = statusConfig[status] || statusConfig['draft'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
};

export default function MyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await propertyService.getMyProperties();
      console.log('📊 My Properties Response:', response);
      if (response.success) {
        const props = response.data.properties || [];
        console.log('🏠 Properties:', props);
        props.forEach((p: Property) => {
          console.log(`Property: ${p.title}, Images:`, p.images);
        });
        setProperties(props);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await propertyService.deleteProperty(id);
      setProperties(properties.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-2">Manage your property listings</p>
          </div>
          <Link
            to="/add-property"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            + List New Property
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't listed any properties yet</p>
            <Link
              to="/add-property"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3">
                    <img
                      src={property.images[0]?.url || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-64 md:h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', property.images[0]?.url);
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', property.images[0]?.url)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h2>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{property.address.city}, {property.address.state}</span>
                        </div>
                      </div>
                      {getStatusBadge(property.status)}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>

                    <div className="flex items-center gap-6 mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(property.pricing.expectedPrice)}
                      </span>
                      <span className="text-gray-600">{property.specs.carpetArea} sqft</span>
                      <span className="text-gray-600">{property.specs.bedrooms} BHK</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        to={`/property/${property._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link
                        to={`/property/${property._id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>

                    {/* Rejection Reason - TODO: Add to Property type */}
                    {/* {property.status === 'rejected' && property.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {property.rejectionReason}
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
