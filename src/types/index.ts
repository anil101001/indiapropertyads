export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    state: string;
    address: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  type: 'residential' | 'commercial';
  category: 'apartment' | 'villa' | 'shop' | 'office' | 'land' | 'house';
  listingType: 'sale' | 'rent';
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    areaUnit: 'sqft' | 'sqm';
    parkingSpaces?: number;
    furnishing?: 'furnished' | 'semi-furnished' | 'unfurnished';
    floor?: number;
    totalFloors?: number;
  };
  amenities: string[];
  images: string[];
  videos?: string[];
  virtualTour?: string;
  agentId: string;
  status: 'active' | 'sold' | 'rented' | 'pending' | 'inactive';
  aiScore?: number;
  aiValuation?: number;
  views: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  featured: boolean;
  boost: boolean;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  company?: string;
  license: string;
  verified: boolean;
  rating: number;
  totalDeals: number;
  activeListings: number;
  commission: {
    earned: number;
    pending: number;
    total: number;
  };
  performance: {
    responseTime: number;
    conversionRate: number;
    customerSatisfaction: number;
  };
  specialization: string[];
  locations: string[];
  kycStatus: 'verified' | 'pending' | 'rejected';
  joinedDate: string;
}

export interface Lead {
  id: string;
  propertyId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  agentId: string;
  status: 'new' | 'contacted' | 'visited' | 'negotiating' | 'closed' | 'lost';
  source: 'website' | 'phone' | 'email' | 'referral' | 'social';
  aiScore: number;
  notes: string[];
  createdAt: string;
  updatedAt: string;
  followUpDate?: string;
}

export interface Commission {
  id: string;
  agentId: string;
  propertyId: string;
  leadId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  transactionDate: string;
  paidDate?: string;
  invoice?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  avatar?: string;
  preferences?: {
    propertyTypes: string[];
    locations: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  savedProperties: string[];
  searches: SearchHistory[];
}

export interface SearchHistory {
  query: string;
  filters: SearchFilters;
  timestamp: string;
}

export interface SearchFilters {
  type?: 'residential' | 'commercial';
  category?: string[];
  listingType?: 'sale' | 'rent';
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string[];
  bedrooms?: number;
  area?: {
    min: number;
    max: number;
  };
}

export interface Analytics {
  totalProperties: number;
  totalAgents: number;
  totalLeads: number;
  conversionRate: number;
  revenue: {
    monthly: number;
    total: number;
  };
  topPerformers: Agent[];
  popularLocations: string[];
}
