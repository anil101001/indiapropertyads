import api from './api';

export interface Inquiry {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: { url: string }[];
    address: { city: string };
    pricing: { expectedPrice: number };
    listingType: string;
  };
  buyer: {
    _id: string;
    profile?: { name: string };
    email: string;
    phone: string;
  };
  owner: {
    _id: string;
    profile?: { name: string };
    email: string;
    phone: string;
    role: string;
  };
  message: string;
  contactMethod: 'call' | 'email' | 'whatsapp';
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'closed';
  response?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

export interface CreateInquiryData {
  propertyId: string;
  message: string;
  contactMethod: 'call' | 'email' | 'whatsapp';
}

export interface InquiryFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export const inquiryService = {
  // Create new inquiry
  createInquiry: async (data: CreateInquiryData) => {
    const response = await api.post('/inquiries', data);
    return response.data;
  },

  // Get my inquiries (buyer's sent inquiries)
  getMyInquiries: async (filters: InquiryFilters = {}) => {
    const response = await api.get('/inquiries/my-inquiries', { params: filters });
    return response.data;
  },

  // Get received inquiries (owner/agent)
  getReceivedInquiries: async (filters: InquiryFilters = {}) => {
    const response = await api.get('/inquiries/received', { params: filters });
    return response.data;
  },

  // Get single inquiry
  getInquiry: async (id: string) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },

  // Update inquiry status/response
  updateInquiry: async (id: string, data: { status?: string; response?: string }) => {
    const response = await api.patch(`/inquiries/${id}`, data);
    return response.data;
  },

  // Delete inquiry
  deleteInquiry: async (id: string) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
  }
};
