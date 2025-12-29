import api from './api';

// ============================================
// TYPES
// ============================================

export interface BuilderProfile {
  _id: string;
  user: {
    _id: string;
    profile: { name: string };
    email: string;
    phone: string;
  };
  companyName: string;
  brandName?: string;
  logo?: string;
  coverImage?: string;
  companyType: 'proprietorship' | 'partnership' | 'pvt-ltd' | 'ltd' | 'llp';
  establishedYear: number;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  rera: {
    registrationNumber: string;
    state: string;
    validUntil: string;
    certificateUrl?: string;
  };
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
    website?: string;
  };
  address: {
    registered: {
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
    };
    corporate?: {
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  about: {
    shortDescription: string;
    fullDescription?: string;
    vision?: string;
    mission?: string;
  };
  portfolio: {
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    upcomingProjects: number;
    totalSqftDelivered?: number;
    citiesPresent: string[];
  };
  specialization: {
    propertyTypes: string[];
    segments: string[];
  };
  awards?: {
    title: string;
    year: number;
    issuedBy: string;
  }[];
  certifications?: {
    name: string;
    issuedBy: string;
    validUntil?: string;
  }[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  verification: {
    status: 'pending' | 'under-review' | 'verified' | 'rejected';
    verifiedAt?: string;
    rejectionReason?: string;
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    maxProjects: number;
    maxUnitsPerProject: number;
    validUntil: string;
  };
  stats: {
    totalViews: number;
    totalInquiries: number;
    totalLeads: number;
    avgRating?: number;
    reviewCount: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  builder: {
    _id: string;
    companyName: string;
    brandName?: string;
    logo?: string;
    verification?: { status: string };
  } | string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  projectType: 'residential' | 'commercial' | 'mixed-use' | 'township' | 'villa' | 'plotted-development';
  segment: 'affordable' | 'mid-range' | 'premium' | 'luxury' | 'ultra-luxury';
  location: {
    fullAddress: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
    micromarket?: string;
  };
  details: {
    totalArea: number;
    totalTowers?: number;
    totalFloors?: number;
    totalUnits: number;
    unitTypes: string[];
    sizeRange: { min: number; max: number };
    priceRange: { min: number; max: number };
  };
  approvals: {
    rera: {
      registrationNumber: string;
      validUntil: string;
      certificateUrl?: string;
    };
    environmentClearance?: boolean;
    buildingPermit?: boolean;
    occupancyCertificate?: boolean;
    otherApprovals?: { name: string; number?: string; date?: string }[];
  };
  construction: {
    status: 'pre-launch' | 'new-launch' | 'under-construction' | 'nearing-possession' | 'ready-to-move';
    startDate?: string;
    expectedCompletion?: string;
    actualCompletion?: string;
    progressPercentage?: number;
  };
  possession: {
    status: 'future' | 'ongoing' | 'ready';
    expectedDate?: string;
    actualDate?: string;
  };
  amenities: {
    category: string;
    name: string;
    icon?: string;
  }[];
  media: {
    images: {
      url: string;
      key: string;
      type: string;
      caption?: string;
      order: number;
    }[];
    videos?: { url: string; type: string; title?: string }[];
    virtualTour?: string;
    brochureUrl?: string;
  };
  pricing?: {
    basePricePerSqft?: number;
    floorRise?: { startFloor: number; risePerFloor: number };
    plc?: { type: string; percentage?: number; flatAmount?: number }[];
    otherCharges?: { name: string; amount: number; type: string }[];
  };
  offers?: {
    title: string;
    description: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
  }[];
  paymentPlans?: {
    name: string;
    description: string;
    milestones: { stage: string; percentage: number }[];
    isActive: boolean;
  }[];
  bankApprovals?: { bankName: string; loanAvailable: boolean }[];
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  rejectionReason?: string;
  isFeatured: boolean;
  stats: {
    views: number;
    inquiries: number;
    favorites: number;
    shares: number;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderRegistrationData {
  companyName: string;
  brandName?: string;
  companyType: string;
  establishedYear: number;
  employeeCount?: string;
  rera: {
    registrationNumber: string;
    state: string;
    validUntil: string;
  };
  gst?: { number: string };
  pan?: { number: string };
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
    website?: string;
  };
  address: {
    registered: {
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  about: {
    shortDescription: string;
    fullDescription?: string;
  };
  specialization?: {
    propertyTypes: string[];
    segments: string[];
  };
}

export interface ProjectCreateData {
  name: string;
  tagline?: string;
  projectType: string;
  segment: string;
  location: {
    fullAddress: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  details: {
    totalArea: number;
    totalTowers?: number;
    totalFloors?: number;
    totalUnits: number;
    unitTypes: string[];
    sizeRange: { min: number; max: number };
    priceRange: { min: number; max: number };
  };
  approvals: {
    rera: {
      registrationNumber: string;
      validUntil: string;
    };
  };
  construction: {
    status: string;
    expectedCompletion?: string;
  };
  amenities?: { category: string; name: string }[];
}

// ============================================
// BUILDER API CALLS
// ============================================

export const builderService = {
  // Register as builder
  register: async (data: BuilderRegistrationData): Promise<BuilderProfile> => {
    const response = await api.post('/builders/register', data);
    return response.data.data;
  },

  // Get my builder profile
  getMyProfile: async (): Promise<{ builder: BuilderProfile; projectCounts: Record<string, number> }> => {
    const response = await api.get('/builders/me/profile');
    return response.data.data;
  },

  // Update my builder profile
  updateProfile: async (data: Partial<BuilderProfile>): Promise<BuilderProfile> => {
    const response = await api.patch('/builders/me/profile', data);
    return response.data.data;
  },

  // Get all builders (public)
  getBuilders: async (params?: {
    city?: string;
    state?: string;
    propertyType?: string;
    segment?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ builders: BuilderProfile[]; pagination: any }> => {
    const response = await api.get('/builders', { params });
    return response.data.data;
  },

  // Get builder by ID (public)
  getBuilderById: async (id: string): Promise<{ builder: BuilderProfile; projects: Project[] }> => {
    const response = await api.get(`/builders/${id}`);
    return response.data.data;
  },

  // Add team member
  addTeamMember: async (userId: string, role: string, assignedProjects?: string[]): Promise<void> => {
    await api.post('/builders/me/team', { userId, role, assignedProjects });
  },

  // Remove team member
  removeTeamMember: async (userId: string): Promise<void> => {
    await api.delete(`/builders/me/team/${userId}`);
  },

  // Admin: Get pending builders
  getPendingBuilders: async (): Promise<BuilderProfile[]> => {
    const response = await api.get('/builders/admin/pending');
    return response.data.data;
  },

  // Admin: Verify builder
  verifyBuilder: async (id: string, status: 'verified' | 'rejected', rejectionReason?: string): Promise<void> => {
    await api.patch(`/builders/admin/${id}/verify`, { status, rejectionReason });
  }
};

// ============================================
// PROJECT API CALLS
// ============================================

export const projectService = {
  // Create project
  create: async (data: ProjectCreateData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data.data;
  },

  // Get all projects (public)
  getProjects: async (params?: {
    city?: string;
    state?: string;
    locality?: string;
    projectType?: string;
    segment?: string;
    constructionStatus?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
    builderId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ projects: Project[]; pagination: any }> => {
    const response = await api.get('/projects', { params });
    return response.data.data;
  },

  // Get project by ID or slug
  getProject: async (idOrSlug: string): Promise<Project> => {
    const response = await api.get(`/projects/${idOrSlug}`);
    return response.data.data;
  },

  // Get my projects (builder)
  getMyProjects: async (params?: { status?: string; page?: number; limit?: number }): Promise<{
    projects: Project[];
    statusCounts: Record<string, number>;
    pagination: any;
  }> => {
    const response = await api.get('/projects/builder/me', { params });
    return response.data.data;
  },

  // Update project
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data.data;
  },

  // Update project status
  updateStatus: async (id: string, status: string): Promise<void> => {
    await api.patch(`/projects/${id}/status`, { status });
  },

  // Delete project (archive)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Admin: Get pending projects
  getPendingProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/admin/pending');
    return response.data.data;
  },

  // Admin: Approve/reject project
  approveProject: async (id: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<void> => {
    await api.patch(`/projects/admin/${id}/approve`, { status, rejectionReason });
  },

  // Admin: Feature project
  featureProject: async (id: string, isFeatured: boolean, featuredUntil?: string, featuredOrder?: number): Promise<void> => {
    await api.patch(`/projects/admin/${id}/feature`, { isFeatured, featuredUntil, featuredOrder });
  },

  // Get project by slug (public)
  getBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get(`/projects/${slug}`);
    return response.data.data;
  },

  // Submit inquiry for a project
  submitInquiry: async (projectId: string, data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    unitType?: string;
  }): Promise<void> => {
    await api.post(`/projects/${projectId}/inquiry`, data);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getConstructionStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pre-launch': 'Pre-Launch',
    'new-launch': 'New Launch',
    'under-construction': 'Under Construction',
    'nearing-possession': 'Nearing Possession',
    'ready-to-move': 'Ready to Move'
  };
  return labels[status] || status;
};

export const getConstructionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pre-launch': 'bg-purple-100 text-purple-800',
    'new-launch': 'bg-blue-100 text-blue-800',
    'under-construction': 'bg-yellow-100 text-yellow-800',
    'nearing-possession': 'bg-orange-100 text-orange-800',
    'ready-to-move': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getSegmentLabel = (segment: string): string => {
  const labels: Record<string, string> = {
    'affordable': 'Affordable',
    'mid-range': 'Mid Range',
    'premium': 'Premium',
    'luxury': 'Luxury',
    'ultra-luxury': 'Ultra Luxury'
  };
  return labels[segment] || segment;
};

export const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'residential': 'Residential',
    'commercial': 'Commercial',
    'mixed-use': 'Mixed Use',
    'township': 'Township',
    'villa': 'Villa',
    'plotted-development': 'Plotted Development'
  };
  return labels[type] || type;
};

export const getVerificationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'under-review': 'bg-blue-100 text-blue-800',
    'verified': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (area: number, unit: string = 'sqft'): string => {
  return `${area.toLocaleString('en-IN')} ${unit}`;
};
