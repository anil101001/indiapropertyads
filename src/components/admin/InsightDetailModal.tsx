import { X } from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  price?: number;
  address?: {
    city?: string;
    state?: string;
    fullAddress?: string;
  };
  stats?: {
    views?: number;
  };
  propertyType?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Property[];
  loading: boolean;
}

export default function InsightDetailModal({ isOpen, onClose, title, data, loading }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No properties found
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((property) => (
                  <div
                    key={property._id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {property.title || 'Untitled Property'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {property.address?.city && property.address?.state && (
                            <span>📍 {property.address.city}, {property.address.state}</span>
                          )}
                          {property.price && (
                            <span>💰 ₹{(property.price / 100000).toFixed(2)} L</span>
                          )}
                          {property.stats?.views !== undefined && (
                            <span>👁️ {property.stats.views} views</span>
                          )}
                          {property.propertyType && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium capitalize">
                              {property.propertyType}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={`/property/${property._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium whitespace-nowrap"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {data.length} properties
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
