import { api } from './api';

// Land/Plot specific details interface
export interface LandDetails {
  plotSubType: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'sez' | 'mixed-use';
  zoningClassification: string[];
  layoutStatus: 'approved-municipal' | 'approved-rera' | 'unapproved' | 'gated-community';
  ownershipType: 'freehold' | 'leasehold';
  legalStatus: 'clear-title' | 'litigated' | 'rera-approved';
  areaUnit: 'sqft' | 'sqm' | 'yards' | 'acres' | 'hectares';
  plotArea: number;
  roadAccess?: string;
  boundaryWall: boolean;
  waterConnection: boolean;
  electricityConnection: boolean;
  cornerPlot?: boolean;
  gatedSecurity?: boolean;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'independent-house' | 'plot' | 'shop' | 'office' | 'warehouse' | 'showroom'
    | 'row-house' | 'duplex' | 'triplex' | 'builder-floor' | 'studio' | 'serviced-apartment'
    | 'farmhouse' | 'retirement-home' | 'co-living' | 'pg' | 'vacation-home'
    | 'co-working' | 'commercial-building' | 'it-park' | 'industrial-shed' | 'cold-storage'
    | 'restaurant' | 'clinic' | 'hotel' | 'educational';
  listingType: 'sale' | 'rent' | 'lease' | 'pre-leased' | 'invest' | 'joint-venture' | 'fractional' | 'auction';
  plotType?: 'gated-community' | 'independent';
  propertyCategory?: 'residential' | 'commercial' | 'land' | 'special';
  segment?: 'affordable' | 'mid-range' | 'premium' | 'luxury' | 'ultra-luxury';
  tags?: string[];
  landDetails?: LandDetails;
  address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    country?: string;
    locality?: string;
    zone?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    nearbyLandmarks?: {
      type: string;
      name: string;
      distance: string;
    }[];
  };
  specs: {
    carpetArea: number;
    builtUpArea?: number;
    superBuiltUpArea?: number;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    parking: {
      covered: number;
      open: number;
    };
    floor?: number;
    totalFloors?: number;
    propertyAge: '<1' | '1-5' | '5-10' | '10+' | 'new-launch' | 'under-construction' | 'ready-to-move';
    furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
    possession: 'immediate' | '1-month' | '3-months' | 'under-construction';
  };
  amenities: string[];
  pricing: {
    expectedPrice: number;
    priceNegotiable: boolean;
    maintenanceCharges?: number;
    securityDeposit?: number;
    pricePerSqft?: number;
    expectedRent?: number;
  };
  leaseDetails?: {
    tenantName?: string;
    tenantType?: 'bank' | 'nbfc' | 'automobile' | 'fmcg' | 'corporate-it' | 'retail-brand' | 'healthcare' | 'education' | 'government' | 'other';
    leaseTenure?: number;
    lockInPeriod?: number;
    annualEscalation?: number;
    currentMonthlyRent?: number;
    leaseStartDate?: string;
    leaseEndDate?: string;
    tenantVerified?: boolean;
    occupancyStatus?: 'occupied' | 'vacant' | 'partially-occupied';
  };
  investmentMetrics?: {
    rentalYield?: number;
    capRate?: number;
    roi?: number;
    expectedAppreciation?: number;
    assetGrade?: 'A' | 'B' | 'C';
  };
  compliance?: {
    reraApproved?: boolean;
    reraNumber?: string;
    ghmcPermission?: boolean;
    industrialZone?: 'orange' | 'red' | 'green';
    environmentNOC?: boolean;
    fireNOC?: boolean;
    sezApproval?: boolean;
    gstReady?: boolean;
  };
  commercialFeatures?: {
    roadFacing?: boolean;
    highFootfall?: boolean;
    truckAccess?: boolean;
    loadingBay?: boolean;
    ceilingHeight?: number;
    powerLoad?: number;
    floorCapacity?: number;
    parkingSpaces?: number;
  };
  images: {
    url: string;
    key: string;
    isCover: boolean;
    order: number;
  }[];
  socialMedia?: {
    youtube?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  owner: {
    _id: string;
    profile: {
      name: string;
    };
    email: string;
    phone: string;
    role: string;
  };
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'sold' | 'rented' | 'leased';
  verified: boolean;
  stats: {
    views: number;
    inquiries: number;
    favorites: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  applyAffordability?: string;
  // Land/Plot specific filters
  plotSubType?: string;
  ownershipType?: string;
  legalStatus?: string;
  layoutStatus?: string;
  zoningClassification?: string; // comma-separated for multi-select
  boundaryWall?: string;
  waterConnection?: string;
  electricityConnection?: string;
  cornerPlot?: string;
  gatedSecurity?: string;
  minPlotArea?: number;
  maxPlotArea?: number;
  areaUnit?: string;
  // New expanded filters
  propertyCategory?: string;
  segment?: string;
  tags?: string; // comma-separated
  locality?: string;
  // Lease / Investment filters
  tenantType?: string;
  occupancyStatus?: string;
  minRentalYield?: number;
  maxRentalYield?: number;
  assetGrade?: string;
  // Compliance filters
  reraApproved?: string;
  // Commercial filters
  roadFacing?: string;
  highFootfall?: string;
  truckAccess?: string;
  loadingBay?: string;
}

export interface PropertyListResponse {
  success: boolean;
  data: {
    properties: Property[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PropertyResponse {
  success: boolean;
  data: Property;
  message?: string;
}

class PropertyService {
  // Get all properties with filters
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<PropertyListResponse>(url);
    return response;
  }

  // Get single property by ID
  async getPropertyById(id: string): Promise<PropertyResponse> {
    const response = await api.get<PropertyResponse>(`/properties/${id}`);
    return response;
  }

  // Create new property
  async createProperty(data: Partial<Property>): Promise<PropertyResponse> {
    const response = await api.post<PropertyResponse>('/properties', data);
    return response;
  }

  // Update property
  async updateProperty(id: string, data: Partial<Property>): Promise<PropertyResponse> {
    const response = await api.patch<PropertyResponse>(`/properties/${id}`, data);
    return response;
  }

  // Delete property
  async deleteProperty(id: string): Promise<any> {
    const response = await api.delete(`/properties/${id}`);
    return response;
  }

  // Get my properties
  async getMyProperties(filters: PropertyFilters = {}): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/properties/my/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<PropertyListResponse>(url);
    return response;
  }

  // Mark property as sold/rented
  async markPropertySold(id: string): Promise<PropertyResponse> {
    const response = await api.patch<PropertyResponse>(`/properties/${id}/mark-sold`);
    return response;
  }

  // Upload images
  async uploadImages(files: File[], onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await api.upload('/upload/images', formData, onProgress);
    return response;
  }

  // Upload single image
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.upload('/upload/image', formData, onProgress);
    return response;
  }

  // Admin: Update property status
  async updatePropertyStatus(id: string, status: string, rejectionReason?: string): Promise<PropertyResponse> {
    const response = await api.patch<PropertyResponse>(`/properties/${id}/status`, {
      status,
      rejectionReason,
    });
    return response;
  }
}

export const propertyService = new PropertyService();
