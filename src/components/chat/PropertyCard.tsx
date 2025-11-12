/**
 * Property Card Component
 * Displays property suggestions in chat
 */

import React from 'react';
import { MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';
import { PropertySuggestion } from '../../types/chat';

interface PropertyCardProps {
  property: PropertySuggestion;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  // Format price in Indian format
  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        {/* Property Image */}
        {property.image ? (
          <img
            src={property.image}
            alt={property.title}
            className="w-20 h-20 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Property Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
            {property.title}
          </h4>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Price and Details */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
              <DollarSign className="w-3 h-3" />
              {formatPrice(property.price)}
            </div>
            {property.bedrooms && (
              <span className="text-gray-600 dark:text-gray-400">
                • {property.bedrooms} BHK
              </span>
            )}
            {property.area && (
              <span className="text-gray-600 dark:text-gray-400">
                • {property.area} sqft
              </span>
            )}
          </div>

          {/* Match Score */}
          {property.score !== undefined && property.score > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600 dark:text-green-400">
                {Math.round(property.score * 100)}% match
              </span>
            </div>
          )}

          {/* Reason */}
          {property.reason && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {property.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
