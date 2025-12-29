import mongoose, { Document, Schema } from 'mongoose';

// Offer model for discounts, promotions, and special deals

export interface IOffer extends Document {
  project: mongoose.Types.ObjectId;
  tower?: mongoose.Types.ObjectId;
  builder: mongoose.Types.ObjectId;
  
  // Basic Info
  name: string;
  code?: string; // Promo code if applicable
  description: string;
  termsAndConditions?: string;
  
  // Offer Type
  offerType: 'discount' | 'cashback' | 'gift' | 'waiver' | 'upgrade' | 'combo';
  
  // Discount Details
  discount: {
    type: 'percentage' | 'fixed' | 'per-sqft';
    value: number;
    maxDiscount?: number; // Cap for percentage discounts
  };
  
  // Applicable Items (what the discount applies to)
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
  
  // Gift/Upgrade Details
  giftDetails?: {
    items: string[]; // e.g., "Modular Kitchen", "AC in all rooms"
    estimatedValue: number;
  };
  
  // Waiver Details
  waiverDetails?: {
    items: ('carParking' | 'clubMembership' | 'maintenanceDeposit' | 'stampDuty' | 'registration' | 'gst' | 'legalCharges')[];
  };
  
  // Eligibility Criteria
  eligibility: {
    // Unit Type restrictions
    unitTypes?: string[];
    
    // Floor restrictions
    minFloor?: number;
    maxFloor?: number;
    
    // Price restrictions
    minPrice?: number;
    maxPrice?: number;
    
    // Booking restrictions
    minBookingAmount?: number;
    paymentPlanRequired?: string; // Specific payment plan ID
    
    // Customer restrictions
    customerTypes?: ('first-time-buyer' | 'investor' | 'nri' | 'senior-citizen' | 'defense' | 'government')[];
    
    // Quantity restrictions
    maxUsagePerCustomer?: number;
    totalUsageLimit?: number;
  };
  
  // Validity
  validFrom: Date;
  validUntil: Date;
  
  // Usage Tracking
  usage: {
    totalUsed: number;
    totalDiscountGiven: number;
    usedBy: {
      unit: mongoose.Types.ObjectId;
      customer: string;
      discountAmount: number;
      usedAt: Date;
    }[];
  };
  
  // Display Settings
  display: {
    showOnWebsite: boolean;
    highlightBadge?: string; // e.g., "Limited Time", "Festive Offer"
    bannerImage?: string;
    priority: number; // For ordering multiple offers
  };
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'expired' | 'exhausted';
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  tower: {
    type: Schema.Types.ObjectId,
    ref: 'Tower',
    index: true
  },
  builder: {
    type: Schema.Types.ObjectId,
    ref: 'Builder',
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Offer name is required'],
    trim: true,
    maxlength: 200
  },
  code: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true
  },
  description: {
    type: String,
    required: [true, 'Offer description is required'],
    maxlength: 1000
  },
  termsAndConditions: {
    type: String,
    maxlength: 5000
  },
  
  offerType: {
    type: String,
    enum: ['discount', 'cashback', 'gift', 'waiver', 'upgrade', 'combo'],
    required: true
  },
  
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'per-sqft'],
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscount: Number
  },
  
  applicableTo: {
    basePrice: { type: Boolean, default: true },
    floorRise: { type: Boolean, default: false },
    facingPremium: { type: Boolean, default: false },
    carParking: { type: Boolean, default: false },
    clubMembership: { type: Boolean, default: false },
    maintenanceDeposit: { type: Boolean, default: false },
    stampDuty: { type: Boolean, default: false },
    registration: { type: Boolean, default: false },
    gst: { type: Boolean, default: false }
  },
  
  giftDetails: {
    items: [String],
    estimatedValue: Number
  },
  
  waiverDetails: {
    items: [{
      type: String,
      enum: ['carParking', 'clubMembership', 'maintenanceDeposit', 'stampDuty', 'registration', 'gst', 'legalCharges']
    }]
  },
  
  eligibility: {
    unitTypes: [String],
    minFloor: Number,
    maxFloor: Number,
    minPrice: Number,
    maxPrice: Number,
    minBookingAmount: Number,
    paymentPlanRequired: String,
    customerTypes: [{
      type: String,
      enum: ['first-time-buyer', 'investor', 'nri', 'senior-citizen', 'defense', 'government']
    }],
    maxUsagePerCustomer: { type: Number, default: 1 },
    totalUsageLimit: Number
  },
  
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  usage: {
    totalUsed: { type: Number, default: 0 },
    totalDiscountGiven: { type: Number, default: 0 },
    usedBy: [{
      unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
      customer: String,
      discountAmount: Number,
      usedAt: { type: Date, default: Date.now }
    }]
  },
  
  display: {
    showOnWebsite: { type: Boolean, default: true },
    highlightBadge: String,
    bannerImage: String,
    priority: { type: Number, default: 0 }
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'exhausted'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
OfferSchema.index({ project: 1, status: 1, isActive: 1 });
OfferSchema.index({ code: 1 }, { unique: true, sparse: true });
OfferSchema.index({ validFrom: 1, validUntil: 1 });
OfferSchema.index({ 'display.priority': -1 });

// Virtual: Is currently valid
OfferSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
    this.status === 'active' && 
    this.validFrom <= now && 
    this.validUntil >= now;
});

// Virtual: Remaining usage
OfferSchema.virtual('remainingUsage').get(function() {
  if (!this.eligibility.totalUsageLimit) return null;
  return this.eligibility.totalUsageLimit - this.usage.totalUsed;
});

// Method: Check if offer is applicable to a unit
OfferSchema.methods.isApplicableToUnit = function(unit: {
  unitType: string;
  floor: number;
  pricing: { totalPrice: number };
}) {
  const e = this.eligibility;
  
  // Check unit type
  if (e.unitTypes && e.unitTypes.length > 0 && !e.unitTypes.includes(unit.unitType)) {
    return { applicable: false, reason: 'Unit type not eligible' };
  }
  
  // Check floor
  if (e.minFloor && unit.floor < e.minFloor) {
    return { applicable: false, reason: `Minimum floor ${e.minFloor} required` };
  }
  if (e.maxFloor && unit.floor > e.maxFloor) {
    return { applicable: false, reason: `Maximum floor ${e.maxFloor} allowed` };
  }
  
  // Check price
  if (e.minPrice && unit.pricing.totalPrice < e.minPrice) {
    return { applicable: false, reason: `Minimum price ₹${e.minPrice.toLocaleString()} required` };
  }
  if (e.maxPrice && unit.pricing.totalPrice > e.maxPrice) {
    return { applicable: false, reason: `Maximum price ₹${e.maxPrice.toLocaleString()} allowed` };
  }
  
  // Check usage limit
  if (e.totalUsageLimit && this.usage.totalUsed >= e.totalUsageLimit) {
    return { applicable: false, reason: 'Offer usage limit reached' };
  }
  
  return { applicable: true };
};

// Method: Calculate discount amount
OfferSchema.methods.calculateDiscount = function(priceBreakdown: {
  basePrice: number;
  floorRise?: number;
  facingPremium?: number;
  carParking?: number;
  clubMembership?: number;
  maintenanceDeposit?: number;
  stampDuty?: number;
  registration?: number;
  gst?: number;
  totalPrice: number;
  area: number;
}) {
  let applicableAmount = 0;
  
  if (this.applicableTo.basePrice) applicableAmount += priceBreakdown.basePrice || 0;
  if (this.applicableTo.floorRise) applicableAmount += priceBreakdown.floorRise || 0;
  if (this.applicableTo.facingPremium) applicableAmount += priceBreakdown.facingPremium || 0;
  if (this.applicableTo.carParking) applicableAmount += priceBreakdown.carParking || 0;
  if (this.applicableTo.clubMembership) applicableAmount += priceBreakdown.clubMembership || 0;
  if (this.applicableTo.maintenanceDeposit) applicableAmount += priceBreakdown.maintenanceDeposit || 0;
  if (this.applicableTo.stampDuty) applicableAmount += priceBreakdown.stampDuty || 0;
  if (this.applicableTo.registration) applicableAmount += priceBreakdown.registration || 0;
  if (this.applicableTo.gst) applicableAmount += priceBreakdown.gst || 0;
  
  let discountAmount = 0;
  
  switch (this.discount.type) {
    case 'percentage':
      discountAmount = applicableAmount * (this.discount.value / 100);
      break;
    case 'fixed':
      discountAmount = this.discount.value;
      break;
    case 'per-sqft':
      discountAmount = this.discount.value * priceBreakdown.area;
      break;
  }
  
  // Apply max discount cap
  if (this.discount.maxDiscount && discountAmount > this.discount.maxDiscount) {
    discountAmount = this.discount.maxDiscount;
  }
  
  return {
    applicableAmount,
    discountAmount: Math.round(discountAmount),
    discountPercentage: applicableAmount > 0 ? (discountAmount / applicableAmount) * 100 : 0
  };
};

// Method: Apply offer to a booking
OfferSchema.methods.applyToBooking = async function(
  unitId: mongoose.Types.ObjectId,
  customerName: string,
  discountAmount: number
) {
  this.usage.totalUsed += 1;
  this.usage.totalDiscountGiven += discountAmount;
  this.usage.usedBy.push({
    unit: unitId,
    customer: customerName,
    discountAmount,
    usedAt: new Date()
  });
  
  // Check if exhausted
  if (this.eligibility.totalUsageLimit && this.usage.totalUsed >= this.eligibility.totalUsageLimit) {
    this.status = 'exhausted';
  }
  
  await this.save();
};

// Pre-save: Update status based on dates
OfferSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status !== 'draft' && this.status !== 'paused' && this.status !== 'exhausted') {
    if (now > this.validUntil) {
      this.status = 'expired';
    } else if (now >= this.validFrom && now <= this.validUntil) {
      this.status = 'active';
    }
  }
  
  next();
});

// Ensure virtuals are included in JSON
OfferSchema.set('toJSON', { virtuals: true });
OfferSchema.set('toObject', { virtuals: true });

export default mongoose.model<IOffer>('Offer', OfferSchema);
