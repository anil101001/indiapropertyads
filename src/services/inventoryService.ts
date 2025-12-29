import api from './api';

// ============== TYPES ==============

export interface Tower {
  _id: string;
  project: string | { _id: string; name: string; slug: string };
  builder: string | { _id: string; companyName: string; brandName?: string };
  name: string;
  type: 'tower' | 'phase' | 'block' | 'wing';
  displayOrder: number;
  structure: {
    totalFloors: number;
    basementFloors?: number;
    groundFloor: boolean;
    unitsPerFloor: number;
    totalUnits: number;
  };
  floorConfig: {
    floorNumber: number;
    name?: string;
    unitCount: number;
    isParking?: boolean;
    isAmenity?: boolean;
  }[];
  unitTypes: {
    type: string;
    count: number;
    sizeRange: { min: number; max: number; unit: string };
    priceRange: { min: number; max: number };
    floors?: number[];
  }[];
  construction: {
    status: 'not-started' | 'foundation' | 'structure' | 'finishing' | 'completed';
    startDate?: string;
    expectedCompletion?: string;
    actualCompletion?: string;
    progressPercentage: number;
    lastUpdated: string;
  };
  approvals: {
    occupancyCertificate?: { received: boolean; number?: string; date?: string };
    completionCertificate?: { received: boolean; number?: string; date?: string };
  };
  amenities: string[];
  media: {
    images: { url: string; caption?: string; type: string }[];
    floorPlans: { floor: number | string; url: string; unitTypes?: string[] }[];
    videos?: { url: string; title?: string }[];
  };
  inventory: {
    total: number;
    available: number;
    booked: number;
    sold: number;
    blocked: number;
    lastUpdated: string;
  };
  status: 'draft' | 'active' | 'sold-out' | 'archived';
  isActive: boolean;
  unitCounts?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  _id: string;
  project: string | { _id: string; name: string; slug: string };
  tower: string | { _id: string; name: string; type: string };
  builder: string;
  unitNumber: string;
  displayName?: string;
  floor: number;
  floorName?: string;
  unitType: string;
  category: 'apartment' | 'villa' | 'plot' | 'shop' | 'office' | 'studio' | 'penthouse' | 'duplex';
  facing: 'east' | 'west' | 'north' | 'south' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
  area: {
    carpet: number;
    builtUp: number;
    superBuiltUp: number;
    balcony?: number;
    terrace?: number;
    garden?: number;
    unit: 'sqft' | 'sqm' | 'sqyd';
  };
  plotDetails?: {
    length: number;
    width: number;
    plotArea: number;
    unit: string;
    shape: string;
    cornerPlot: boolean;
    roadFacing: string;
  };
  configuration: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    parking: number;
    servantRoom: boolean;
    studyRoom: boolean;
    poojaRoom: boolean;
    storeRoom: boolean;
  };
  pricing: {
    basePrice: number;
    pricePerSqft: number;
    floorRise?: number;
    facingPremium?: number;
    cornerPremium?: number;
    carParking?: number;
    clubMembership?: number;
    maintenanceDeposit?: number;
    legalCharges?: number;
    stampDuty?: number;
    registrationCharges?: number;
    gst?: number;
    totalPrice: number;
    allInclusivePrice?: number;
    amountReceived?: number;
    balanceAmount?: number;
  };
  status: 'available' | 'booked' | 'sold' | 'blocked' | 'hold';
  booking?: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    bookingDate: string;
    bookingAmount: number;
    agreementDate?: string;
    agreementValue?: number;
    registrationDate?: string;
    possessionDate?: string;
    salesPerson?: string;
    broker?: {
      name: string;
      phone: string;
      company?: string;
      commission?: number;
    };
    notes?: string;
  };
  hold?: {
    heldBy: string;
    heldFor: string;
    heldUntil: string;
    reason?: string;
  };
  media: {
    floorPlan?: string;
    images: string[];
    video360?: string;
  };
  features: string[];
  isPremium: boolean;
  isCorner: boolean;
  hasGarden: boolean;
  hasTerrace: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TowerCreateData {
  name: string;
  type: 'tower' | 'phase' | 'block' | 'wing';
  displayOrder?: number;
  structure: {
    totalFloors: number;
    basementFloors?: number;
    groundFloor: boolean;
    unitsPerFloor: number;
    totalUnits?: number;
  };
  unitTypes?: {
    type: string;
    count: number;
    sizeRange: { min: number; max: number; unit?: string };
    priceRange: { min: number; max: number };
    floors?: number[];
  }[];
  construction?: {
    status?: string;
    startDate?: string;
    expectedCompletion?: string;
    progressPercentage?: number;
  };
  amenities?: string[];
}

export interface UnitCreateData {
  unitNumber: string;
  displayName?: string;
  floor: number;
  floorName?: string;
  unitType: string;
  category: string;
  facing: string;
  area: {
    carpet: number;
    builtUp: number;
    superBuiltUp: number;
    balcony?: number;
    terrace?: number;
    garden?: number;
    unit?: string;
  };
  configuration?: {
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    parking?: number;
    servantRoom?: boolean;
    studyRoom?: boolean;
    poojaRoom?: boolean;
    storeRoom?: boolean;
  };
  pricing: {
    basePrice: number;
    pricePerSqft: number;
    floorRise?: number;
    facingPremium?: number;
    cornerPremium?: number;
    carParking?: number;
    totalPrice?: number;
  };
  features?: string[];
  isPremium?: boolean;
  isCorner?: boolean;
  hasGarden?: boolean;
  hasTerrace?: boolean;
}

export interface UnitGenerateConfig {
  unitType: string;
  category: string;
  facing: string;
  carpetArea: number;
  builtUpArea: number;
  superBuiltUpArea: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parking: number;
  pricePerSqft: number;
  floorRisePerFloor: number;
  floors?: number[];
  unitPositions?: number[];
}

export interface InventorySummary {
  project: { id: string; name: string };
  towers: Tower[];
  summary: {
    total: number;
    available: number;
    booked: number;
    sold: number;
    blocked: number;
    hold: number;
    totalValue: number;
    availableValue: number;
    soldValue: number;
  };
  unitTypeStats: { _id: { unitType: string; status: string }; count: number; avgPrice: number }[];
  floorStats: { _id: number; available: number; minPrice: number; maxPrice: number }[];
}

// ============== TOWER SERVICE ==============

export const towerService = {
  // Get all towers for a project
  getProjectTowers: async (projectId: string, includeUnits = false): Promise<Tower[]> => {
    const response = await api.get(`/inventory/projects/${projectId}/towers`, {
      params: { includeUnits }
    });
    return response.data.data;
  },

  // Get single tower
  getTower: async (towerId: string): Promise<Tower> => {
    const response = await api.get(`/inventory/towers/${towerId}`);
    return response.data.data;
  },

  // Create tower
  create: async (projectId: string, data: TowerCreateData): Promise<Tower> => {
    const response = await api.post(`/inventory/projects/${projectId}/towers`, data);
    return response.data.data;
  },

  // Update tower
  update: async (towerId: string, data: Partial<TowerCreateData>): Promise<Tower> => {
    const response = await api.put(`/inventory/towers/${towerId}`, data);
    return response.data.data;
  },

  // Delete tower
  delete: async (towerId: string): Promise<void> => {
    await api.delete(`/inventory/towers/${towerId}`);
  },

  // Update construction progress
  updateProgress: async (towerId: string, status: string, progressPercentage: number): Promise<Tower> => {
    const response = await api.patch(`/inventory/towers/${towerId}/progress`, {
      status,
      progressPercentage
    });
    return response.data.data;
  }
};

// ============== UNIT SERVICE ==============

export const unitService = {
  // Get units for a tower
  getTowerUnits: async (towerId: string, params?: {
    status?: string;
    unitType?: string;
    floor?: number;
    facing?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ units: Unit[]; statusCounts: Record<string, number>; pagination: any }> => {
    const response = await api.get(`/inventory/towers/${towerId}/units`, { params });
    return response.data.data;
  },

  // Get single unit
  getUnit: async (unitId: string): Promise<Unit> => {
    const response = await api.get(`/inventory/units/${unitId}`);
    return response.data.data;
  },

  // Create unit
  create: async (towerId: string, data: UnitCreateData): Promise<Unit> => {
    const response = await api.post(`/inventory/towers/${towerId}/units`, data);
    return response.data.data;
  },

  // Bulk create units
  bulkCreate: async (towerId: string, units: UnitCreateData[]): Promise<{ count: number }> => {
    const response = await api.post(`/inventory/towers/${towerId}/units/bulk`, { units });
    return response.data.data;
  },

  // Generate units automatically
  generateUnits: async (towerId: string, unitConfig: UnitGenerateConfig[]): Promise<{ count: number }> => {
    const response = await api.post(`/inventory/towers/${towerId}/units/generate`, { unitConfig });
    return response.data.data;
  },

  // Update unit
  update: async (unitId: string, data: Partial<UnitCreateData>): Promise<Unit> => {
    const response = await api.put(`/inventory/units/${unitId}`, data);
    return response.data.data;
  },

  // Update unit status
  updateStatus: async (unitId: string, action: 'book' | 'sell' | 'release' | 'hold' | 'block', data?: any): Promise<Unit> => {
    const response = await api.patch(`/inventory/units/${unitId}/status`, { action, ...data });
    return response.data.data;
  },

  // Bulk update prices
  bulkUpdatePrices: async (towerId: string, data: {
    pricePerSqft?: number;
    floorRise?: number;
    facingPremiums?: Record<string, number>;
    unitTypeFilter?: string;
  }): Promise<{ updatedCount: number }> => {
    const response = await api.patch(`/inventory/towers/${towerId}/units/prices`, data);
    return response.data.data;
  }
};

// ============== INVENTORY SERVICE ==============

export const inventoryService = {
  // Get project inventory summary
  getProjectInventory: async (projectId: string): Promise<InventorySummary> => {
    const response = await api.get(`/inventory/projects/${projectId}/inventory`);
    return response.data.data;
  }
};

// ============== HELPER FUNCTIONS ==============

export const getUnitStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'available': 'bg-green-100 text-green-800',
    'booked': 'bg-yellow-100 text-yellow-800',
    'sold': 'bg-blue-100 text-blue-800',
    'blocked': 'bg-red-100 text-red-800',
    'hold': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getUnitStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'available': 'Available',
    'booked': 'Booked',
    'sold': 'Sold',
    'blocked': 'Blocked',
    'hold': 'On Hold'
  };
  return labels[status] || status;
};

export const getConstructionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'not-started': 'bg-gray-100 text-gray-800',
    'foundation': 'bg-yellow-100 text-yellow-800',
    'structure': 'bg-blue-100 text-blue-800',
    'finishing': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getConstructionStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'not-started': 'Not Started',
    'foundation': 'Foundation',
    'structure': 'Structure',
    'finishing': 'Finishing',
    'completed': 'Completed'
  };
  return labels[status] || status;
};

export const getFacingLabel = (facing: string): string => {
  const labels: Record<string, string> = {
    'east': 'East',
    'west': 'West',
    'north': 'North',
    'south': 'South',
    'north-east': 'North-East',
    'north-west': 'North-West',
    'south-east': 'South-East',
    'south-west': 'South-West'
  };
  return labels[facing] || facing;
};

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (area: number, unit = 'sqft'): string => {
  return `${area.toLocaleString('en-IN')} ${unit}`;
};
