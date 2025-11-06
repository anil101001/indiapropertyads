import { useState, useEffect } from 'react';
import { MapPin, Eye, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { propertyService, Property } from '../services/propertyService';
import { Link } from 'react-router-dom';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminPendingProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Fetching pending properties with status: pending-approval');
      const response = await propertyService.getProperties({
        status: 'pending-approval',
        limit: 50,
      });
      console.log('📊 API Response:', response);
      if (response.success) {
        console.log('✅ Properties found:', response.data.properties?.length || 0);
        console.log('Properties data:', response.data.properties);
        setProperties(response.data.properties || []);
      }
    } catch (err: any) {
      console.error('❌ Error fetching pending properties:', err);
      setError(err.message || 'Failed to load pending properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this property?')) return;

    setProcessingId(id);
    try {
      await propertyService.updatePropertyStatus(id, 'approved');
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to approve property');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedPropertyId(id);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessingId(selectedPropertyId!);
    try {
      await propertyService.updatePropertyStatus(
        selectedPropertyId!,
        'rejected',
        rejectionReason
      );
      setProperties(properties.filter((p) => p._id !== selectedPropertyId));
      setShowRejectModal(false);
      setSelectedPropertyId(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject property');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pending Properties</h1>
          </div>
          <p className="text-gray-600">Review and approve property listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>
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
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600">No pending properties to review</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3">
                    <img
                      src={property.images[0]?.url || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {property.title}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {property.address.city}, {property.address.state}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Submitted on {formatDate(property.createdAt)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock className="h-3 w-3" />
                        PENDING
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-6 mb-6">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(property.pricing.expectedPrice)}
                      </span>
                      <span className="text-gray-600">
                        {property.specs.carpetArea} sqft
                      </span>
                      <span className="text-gray-600">
                        {property.specs.bedrooms} BHK
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        to={`/property/${property._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleApprove(property._id)}
                        disabled={processingId === property._id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === property._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openRejectModal(property._id)}
                        disabled={processingId === property._id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Reject Property
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejection:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none mb-4"
                rows={4}
                placeholder="e.g., Missing required documents, unclear images..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPropertyId(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processingId !== null}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
