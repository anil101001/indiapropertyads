import { api } from './api';

export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'independent-house' | 'plot';
  listingType: 'sale' | 'rent';
  address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  specs: {
    carpetArea: number;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    parking: {
      covered: number;
      open: number;
    };
    floor?: number;
    totalFloors?: number;
    propertyAge: '<1' | '1-5' | '5-10' | '10+';
    furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
    possession: 'immediate' | '1-month' | '3-months' | 'under-construction';
  };
  amenities: string[];
  pricing: {
    expectedPrice: number;
    priceNegotiable: boolean;
    maintenanceCharges?: number;
    securityDeposit?: number;
  };
  images: {
    url: string;
    key: string;
    isCover: boolean;
    order: number;
  }[];
  owner: {
    _id: string;
    profile: {
      name: string;
    };
    email: string;
    phone: string;
    role: string;
  };
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'sold' | 'rented';
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
