import api from './api';

// ============== TYPES ==============

export interface PricingRule {
  _id: string;
  project: string | { _id: string; name: string };
  tower?: string | { _id: string; name: string; type: string };
  builder: string;
  name: string;
  description?: string;
  basePricing: {
    pricePerSqft: number;
    currency: string;
  };
  floorRise: {
    enabled: boolean;
    type: 'fixed' | 'percentage';
    value: number;
    startFromFloor: number;
    maxFloor?: number;
  };
  facingPremium: {
    enabled: boolean;
    premiums: {
      facing: string;
      type: 'fixed' | 'percentage';
      value: number;
    }[];
  };
  cornerPremium: {
    enabled: boolean;
    type: 'fixed' | 'percentage';
    value: number;
  };
  unitTypePremium: {
    enabled: boolean;
    premiums: {
      unitType: string;
      type: 'fixed' | 'percentage';
      value: number;
    }[];
  };
  additionalCharges: {
    carParking: { covered: number; open: number };
    clubMembership: number;
    maintenanceDeposit: { type: string; value: number; months?: number };
    legalCharges: number;
  };
  governmentCharges: {
    stampDutyPercentage: number;
    registrationPercentage: number;
    gstPercentage: number;
  };
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  _id: string;
  project: string | { _id: string; name: string };
  tower?: string | { _id: string; name: string };
  builder: string;
  name: string;
  code?: string;
  description: string;
  termsAndConditions?: string;
  offerType: 'discount' | 'cashback' | 'gift' | 'waiver' | 'upgrade' | 'combo';
  discount: {
    type: 'percentage' | 'fixed' | 'per-sqft';
    value: number;
    maxDiscount?: number;
  };
  applicableTo: {
    basePrice: boolean;
    floorRise: boolean;
    facingPremium: boolean;
    carParking: boolean;
    clubMembership: boolean;
    maintenanceDeposit: boolean;
    stampDuty: boolean;
    registration: boolean;
    gst: boolean;
  };
  giftDetails?: {
    items: string[];
    estimatedValue: number;
  };
  waiverDetails?: {
    items: string[];
  };
  eligibility: {
    unitTypes?: string[];
    minFloor?: number;
    maxFloor?: number;
    minPrice?: number;
    maxPrice?: number;
    totalUsageLimit?: number;
  };
  validFrom: string;
  validUntil: string;
  usage: {
    totalUsed: number;
    totalDiscountGiven: number;
  };
  display: {
    showOnWebsite: boolean;
    highlightBadge?: string;
    bannerImage?: string;
    priority: number;
  };
  status: 'draft' | 'active' | 'paused' | 'expired' | 'exhausted';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPlan {
  _id: string;
  project: string | { _id: string; name: string };
  tower?: string | { _id: string; name: string };
  builder: string;
  name: string;
  description: string;
  planType: 'construction-linked' | 'time-linked' | 'down-payment' | 'flexi' | 'subvention' | 'custom';
  bookingAmount: {
    type: 'percentage' | 'fixed';
    value: number;
    dueWithin: number;
  };
  milestones: {
    name: string;
    description?: string;
    dueType: 'on-booking' | 'days-from-booking' | 'construction-stage' | 'fixed-date' | 'on-possession';
    dueValue?: number | string;
    amountType: 'percentage' | 'fixed';
    amountValue: number;
    constructionStage?: string;
    order: number;
  }[];
  subvention?: {
    enabled: boolean;
    bankPartners: string[];
    interestRate: number;
    tenure: number;
    builderContribution: number;
  };
  downPayment?: {
    enabled: boolean;
    percentage: number;
    discount: { type: string; value: number };
  };
  flexiPayment?: {
    enabled: boolean;
    minDownPayment: number;
    maxTenure: number;
    interestFree: boolean;
    interestRate?: number;
  };
  benefits: { description: string; value?: number }[];
  display: {
    isRecommended: boolean;
    highlightText?: string;
    priority: number;
  };
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCalculation {
  breakdown: Record<string, number>;
  totalPremiums: number;
  additionalCharges: number;
  totalPrice: number;
  governmentCharges: {
    stampDuty: number;
    registration: number;
    gst: number;
  };
  allInclusivePrice: number;
  pricePerSqft: number;
}

export interface PaymentSchedule {
  plan: { _id: string; name: string; planType: string };
  unitPrice: number;
  schedule: {
    name: string;
    description?: string;
    dueDate: string | null;
    amount: number;
    percentage: number;
    status: 'pending' | 'due' | 'paid';
    constructionStage?: string;
  }[];
  totalAmount: number;
  milestoneCount: number;
}

// ============== PRICING RULE SERVICE ==============

export const pricingRuleService = {
  getProjectRules: async (projectId: string, towerId?: string): Promise<PricingRule[]> => {
    const params: any = {};
    if (towerId) params.towerId = towerId;
    const response = await api.get(`/pricing/projects/${projectId}/pricing-rules`, { params });
    return response.data.data;
  },

  getRule: async (ruleId: string): Promise<PricingRule> => {
    const response = await api.get(`/pricing/pricing-rules/${ruleId}`);
    return response.data.data;
  },

  create: async (projectId: string, data: Partial<PricingRule>): Promise<PricingRule> => {
    const response = await api.post(`/pricing/projects/${projectId}/pricing-rules`, data);
    return response.data.data;
  },

  update: async (ruleId: string, data: Partial<PricingRule>): Promise<PricingRule> => {
    const response = await api.put(`/pricing/pricing-rules/${ruleId}`, data);
    return response.data.data;
  },

  delete: async (ruleId: string): Promise<void> => {
    await api.delete(`/pricing/pricing-rules/${ruleId}`);
  },

  calculatePrice: async (ruleId: string, unitData: any): Promise<PriceCalculation> => {
    const response = await api.post(`/pricing/pricing-rules/${ruleId}/calculate`, unitData);
    return response.data.data;
  },

  applyToTower: async (ruleId: string, towerId: string): Promise<{ updatedCount: number }> => {
    const response = await api.post(`/pricing/pricing-rules/${ruleId}/apply/${towerId}`);
    return response.data.data;
  }
};

// ============== OFFER SERVICE ==============

export const offerService = {
  getProjectOffers: async (projectId: string, status?: string): Promise<Offer[]> => {
    const params: any = {};
    if (status) params.status = status;
    const response = await api.get(`/pricing/projects/${projectId}/offers`, { params });
    return response.data.data;
  },

  getPublicOffers: async (projectId: string): Promise<Offer[]> => {
    const response = await api.get(`/pricing/projects/${projectId}/offers/public`);
    return response.data.data;
  },

  getOffer: async (offerId: string): Promise<Offer> => {
    const response = await api.get(`/pricing/offers/${offerId}`);
    return response.data.data;
  },

  create: async (projectId: string, data: Partial<Offer>): Promise<Offer> => {
    const response = await api.post(`/pricing/projects/${projectId}/offers`, data);
    return response.data.data;
  },

  update: async (offerId: string, data: Partial<Offer>): Promise<Offer> => {
    const response = await api.put(`/pricing/offers/${offerId}`, data);
    return response.data.data;
  },

  delete: async (offerId: string): Promise<void> => {
    await api.delete(`/pricing/offers/${offerId}`);
  },

  validateCode: async (code: string, unitId?: string): Promise<any> => {
    const response = await api.post('/pricing/offers/validate', { code, unitId });
    return response.data.data;
  }
};

// ============== PAYMENT PLAN SERVICE ==============

export const paymentPlanService = {
  getProjectPlans: async (projectId: string, planType?: string): Promise<PaymentPlan[]> => {
    const params: any = {};
    if (planType) params.planType = planType;
    const response = await api.get(`/pricing/projects/${projectId}/payment-plans`, { params });
    return response.data.data;
  },

  getPublicPlans: async (projectId: string): Promise<PaymentPlan[]> => {
    const response = await api.get(`/pricing/projects/${projectId}/payment-plans/public`);
    return response.data.data;
  },

  getPlan: async (planId: string): Promise<PaymentPlan> => {
    const response = await api.get(`/pricing/payment-plans/${planId}`);
    return response.data.data;
  },

  create: async (projectId: string, data: Partial<PaymentPlan>): Promise<PaymentPlan> => {
    const response = await api.post(`/pricing/projects/${projectId}/payment-plans`, data);
    return response.data.data;
  },

  update: async (planId: string, data: Partial<PaymentPlan>): Promise<PaymentPlan> => {
    const response = await api.put(`/pricing/payment-plans/${planId}`, data);
    return response.data.data;
  },

  delete: async (planId: string): Promise<void> => {
    await api.delete(`/pricing/payment-plans/${planId}`);
  },

  generateSchedule: async (planId: string, data: {
    unitId?: string;
    unitPrice?: number;
    bookingDate?: string;
    possessionDate?: string;
  }): Promise<PaymentSchedule> => {
    const response = await api.post(`/pricing/payment-plans/${planId}/schedule`, data);
    return response.data.data;
  },

  calculateEMI: async (planId: string, data: {
    loanAmount: number;
    tenure?: number;
    interestRate?: number;
  }): Promise<{
    emi: number;
    totalPayment: number;
    totalInterest: number;
    tenure: number;
    interestRate: number;
  }> => {
    const response = await api.post(`/pricing/payment-plans/${planId}/emi`, data);
    return response.data.data;
  }
};

// ============== HELPER FUNCTIONS ==============

export const getOfferTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'discount': 'Discount',
    'cashback': 'Cashback',
    'gift': 'Free Gift',
    'waiver': 'Waiver',
    'upgrade': 'Free Upgrade',
    'combo': 'Combo Offer'
  };
  return labels[type] || type;
};

export const getOfferTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'discount': 'bg-green-100 text-green-800',
    'cashback': 'bg-blue-100 text-blue-800',
    'gift': 'bg-purple-100 text-purple-800',
    'waiver': 'bg-orange-100 text-orange-800',
    'upgrade': 'bg-pink-100 text-pink-800',
    'combo': 'bg-indigo-100 text-indigo-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getOfferStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'expired': 'bg-red-100 text-red-800',
    'exhausted': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPlanTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'construction-linked': 'Construction Linked',
    'time-linked': 'Time Linked',
    'down-payment': 'Down Payment',
    'flexi': 'Flexi Payment',
    'subvention': 'Subvention Scheme',
    'custom': 'Custom Plan'
  };
  return labels[type] || type;
};

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatDiscount = (discount: { type: string; value: number }): string => {
  switch (discount.type) {
    case 'percentage':
      return `${discount.value}% Off`;
    case 'fixed':
      return `${formatPrice(discount.value)} Off`;
    case 'per-sqft':
      return `₹${discount.value}/sqft Off`;
    default:
      return `${discount.value}`;
  }
};
