import mongoose, { Document, Schema } from 'mongoose';

// Unit represents an individual sellable unit (apartment, villa, plot, shop, office)

export interface IUnit extends Document {
  project: mongoose.Types.ObjectId;
  tower: mongoose.Types.ObjectId;
  builder: mongoose.Types.ObjectId;
  
  // Unit Identification
  unitNumber: string; // e.g., "A-101", "Villa 5", "Plot 23"
  displayName?: string; // Optional friendly name
  floor: number;
  floorName?: string; // e.g., "Ground Floor", "1st Floor"
  
  // Unit Type
  unitType: string; // e.g., "2 BHK", "3 BHK", "Penthouse", "Villa", "Plot"
  category: 'apartment' | 'villa' | 'plot' | 'shop' | 'office' | 'studio' | 'penthouse' | 'duplex';
  facing: 'east' | 'west' | 'north' | 'south' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
  
  // Area Details
  area: {
    carpet: number;
    builtUp: number;
    superBuiltUp: number;
    balcony?: number;
    terrace?: number;
    garden?: number;
    unit: 'sqft' | 'sqm' | 'sqyd';
  };
  
  // For Plots
  plotDetails?: {
    length: number;
    width: number;
    plotArea: number;
    unit: 'sqft' | 'sqm' | 'sqyd' | 'acres' | 'guntha';
    frontage?: number;
    depth?: number;
    shape: 'regular' | 'irregular' | 'corner' | 'triangular';
    cornerPlot: boolean;
    roadFacing: string;
  };
  
  // Configuration (for apartments/villas)
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
  
  // Pricing
  pricing: {
    basePrice: number; // Total base price
    pricePerSqft: number;
    
    // Additional Charges
    floorRise?: number; // Per floor premium
    facingPremium?: number;
    cornerPremium?: number;
    
    // Other Charges
    carParking?: number;
    clubMembership?: number;
    maintenanceDeposit?: number;
    legalCharges?: number;
    
    // Government Charges
    stampDuty?: number;
    registrationCharges?: number;
    gst?: number;
    
    // Totals
    totalPrice: number;
    allInclusivePrice?: number;
    
    // Payment received (for booked/sold units)
    amountReceived?: number;
    balanceAmount?: number;
  };
  
  // Status
  status: 'available' | 'booked' | 'sold' | 'blocked' | 'hold';
  statusHistory: {
    status: string;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;
    reason?: string;
    customerName?: string;
  }[];
  
  // Booking Details (when booked/sold)
  booking?: {
    customerId?: mongoose.Types.ObjectId;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    bookingDate: Date;
    bookingAmount: number;
    agreementDate?: Date;
    agreementValue?: number;
    registrationDate?: Date;
    possessionDate?: Date;
    salesPerson?: mongoose.Types.ObjectId;
    broker?: {
      name: string;
      phone: string;
      company?: string;
      commission?: number;
    };
    notes?: string;
  };
  
  // Hold Details (temporary hold)
  hold?: {
    heldBy: mongoose.Types.ObjectId;
    heldFor: string; // Customer name
    heldUntil: Date;
    reason?: string;
  };
  
  // Floor Plan & Media
  media: {
    floorPlan?: string;
    images: string[];
    video360?: string;
  };
  
  // Features & Specifications
  features: string[];
  specifications?: {
    flooring?: string;
    walls?: string;
    ceiling?: string;
    doors?: string;
    windows?: string;
    kitchen?: string;
    bathroom?: string;
    electrical?: string;
    plumbing?: string;
  };
  
  // Offers applicable to this unit
  applicableOffers: mongoose.Types.ObjectId[];
  
  // Flags
  isPremium: boolean;
  isCorner: boolean;
  hasGarden: boolean;
  hasTerrace: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  tower: {
    type: Schema.Types.ObjectId,
    ref: 'Tower',
    required: true,
    index: true
  },
  builder: {
    type: Schema.Types.ObjectId,
    ref: 'Builder',
    required: true,
    index: true
  },
  
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true
  },
  displayName: String,
  floor: {
    type: Number,
    required: true
  },
  floorName: String,
  
  unitType: {
    type: String,
    required: [true, 'Unit type is required']
  },
  category: {
    type: String,
    enum: ['apartment', 'villa', 'plot', 'shop', 'office', 'studio', 'penthouse', 'duplex'],
    required: true
  },
  facing: {
    type: String,
    enum: ['east', 'west', 'north', 'south', 'north-east', 'north-west', 'south-east', 'south-west'],
    required: true
  },
  
  area: {
    carpet: { type: Number, required: true, min: 0 },
    builtUp: { type: Number, required: true, min: 0 },
    superBuiltUp: { type: Number, required: true, min: 0 },
    balcony: { type: Number, min: 0 },
    terrace: { type: Number, min: 0 },
    garden: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft'
    }
  },
  
  plotDetails: {
    length: Number,
    width: Number,
    plotArea: Number,
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd', 'acres', 'guntha']
    },
    frontage: Number,
    depth: Number,
    shape: {
      type: String,
      enum: ['regular', 'irregular', 'corner', 'triangular']
    },
    cornerPlot: Boolean,
    roadFacing: String
  },
  
  configuration: {
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    balconies: { type: Number, default: 0, min: 0 },
    parking: { type: Number, default: 0, min: 0 },
    servantRoom: { type: Boolean, default: false },
    studyRoom: { type: Boolean, default: false },
    poojaRoom: { type: Boolean, default: false },
    storeRoom: { type: Boolean, default: false }
  },
  
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    pricePerSqft: { type: Number, required: true, min: 0 },
    floorRise: { type: Number, default: 0 },
    facingPremium: { type: Number, default: 0 },
    cornerPremium: { type: Number, default: 0 },
    carParking: { type: Number, default: 0 },
    clubMembership: { type: Number, default: 0 },
    maintenanceDeposit: { type: Number, default: 0 },
    legalCharges: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    registrationCharges: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    allInclusivePrice: Number,
    amountReceived: { type: Number, default: 0 },
    balanceAmount: Number
  },
  
  status: {
    type: String,
    enum: ['available', 'booked', 'sold', 'blocked', 'hold'],
    default: 'available',
    index: true
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    customerName: String
  }],
  
  booking: {
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    bookingDate: Date,
    bookingAmount: Number,
    agreementDate: Date,
    agreementValue: Number,
    registrationDate: Date,
    possessionDate: Date,
    salesPerson: { type: Schema.Types.ObjectId, ref: 'User' },
    broker: {
      name: String,
      phone: String,
      company: String,
      commission: Number
    },
    notes: String
  },
  
  hold: {
    heldBy: { type: Schema.Types.ObjectId, ref: 'User' },
    heldFor: String,
    heldUntil: Date,
    reason: String
  },
  
  media: {
    floorPlan: String,
    images: [String],
    video360: String
  },
  
  features: [String],
  specifications: {
    flooring: String,
    walls: String,
    ceiling: String,
    doors: String,
    windows: String,
    kitchen: String,
    bathroom: String,
    electrical: String,
    plumbing: String
  },
  
  applicableOffers: [{ type: Schema.Types.ObjectId, ref: 'Offer' }],
  
  isPremium: { type: Boolean, default: false },
  isCorner: { type: Boolean, default: false },
  hasGarden: { type: Boolean, default: false },
  hasTerrace: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
UnitSchema.index({ project: 1, tower: 1, unitNumber: 1 }, { unique: true });
UnitSchema.index({ project: 1, status: 1 });
UnitSchema.index({ tower: 1, floor: 1 });
UnitSchema.index({ builder: 1, status: 1 });
UnitSchema.index({ unitType: 1, status: 1 });
UnitSchema.index({ 'pricing.totalPrice': 1 });
UnitSchema.index({ 'area.superBuiltUp': 1 });
UnitSchema.index({ facing: 1 });
UnitSchema.index({ category: 1 });

// Pre-save: Calculate total price and balance
UnitSchema.pre('save', function(next) {
  // Calculate total price
  const p = this.pricing;
  const calculatedTotal = p.basePrice + 
    (p.floorRise || 0) + 
    (p.facingPremium || 0) + 
    (p.cornerPremium || 0) + 
    (p.carParking || 0) + 
    (p.clubMembership || 0) + 
    (p.maintenanceDeposit || 0) + 
    (p.legalCharges || 0);
  
  if (!p.totalPrice || this.isModified('pricing')) {
    this.pricing.totalPrice = calculatedTotal;
  }
  
  // Calculate all-inclusive price
  const govtCharges = (p.stampDuty || 0) + (p.registrationCharges || 0) + (p.gst || 0);
  this.pricing.allInclusivePrice = this.pricing.totalPrice + govtCharges;
  
  // Calculate balance
  this.pricing.balanceAmount = this.pricing.totalPrice - (this.pricing.amountReceived || 0);
  
  // Add to status history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: (this as any)._statusChangedBy,
      reason: (this as any)._statusChangeReason,
      customerName: this.booking?.customerName
    });
  }
  
  next();
});

// Post-save: Update tower inventory
UnitSchema.post('save', async function() {
  try {
    const Tower = mongoose.model('Tower');
    const tower = await Tower.findById(this.tower);
    if (tower && typeof tower.updateInventory === 'function') {
      await tower.updateInventory();
    }
  } catch (error) {
    console.error('Error updating tower inventory:', error);
  }
});

// Virtual: Is available
UnitSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

// Virtual: Price per sqft formatted
UnitSchema.virtual('formattedPricePerSqft').get(function() {
  return `₹${this.pricing.pricePerSqft.toLocaleString('en-IN')}/sqft`;
});

// Method: Book unit
UnitSchema.methods.book = async function(bookingData: any, userId: mongoose.Types.ObjectId) {
  if (this.status !== 'available' && this.status !== 'hold') {
    throw new Error('Unit is not available for booking');
  }
  
  this.status = 'booked';
  this.booking = {
    ...bookingData,
    bookingDate: new Date()
  };
  (this as any)._statusChangedBy = userId;
  (this as any)._statusChangeReason = 'Booked by customer';
  
  await this.save();
  return this;
};

// Method: Mark as sold
UnitSchema.methods.markSold = async function(saleData: any, userId: mongoose.Types.ObjectId) {
  if (this.status !== 'booked') {
    throw new Error('Unit must be booked before marking as sold');
  }
  
  this.status = 'sold';
  this.booking = {
    ...this.booking,
    ...saleData,
    registrationDate: saleData.registrationDate || new Date()
  };
  (this as any)._statusChangedBy = userId;
  (this as any)._statusChangeReason = 'Sale completed';
  
  await this.save();
  return this;
};

// Method: Release unit (cancel booking)
UnitSchema.methods.release = async function(reason: string, userId: mongoose.Types.ObjectId) {
  if (this.status === 'sold') {
    throw new Error('Cannot release a sold unit');
  }
  
  const previousStatus = this.status;
  this.status = 'available';
  this.booking = undefined;
  this.hold = undefined;
  (this as any)._statusChangedBy = userId;
  (this as any)._statusChangeReason = `Released from ${previousStatus}: ${reason}`;
  
  await this.save();
  return this;
};

// Method: Hold unit temporarily
UnitSchema.methods.holdUnit = async function(holdData: any, userId: mongoose.Types.ObjectId) {
  if (this.status !== 'available') {
    throw new Error('Unit is not available for hold');
  }
  
  this.status = 'hold';
  this.hold = {
    heldBy: userId,
    heldFor: holdData.customerName,
    heldUntil: holdData.holdUntil,
    reason: holdData.reason
  };
  (this as any)._statusChangedBy = userId;
  (this as any)._statusChangeReason = `Held for ${holdData.customerName}`;
  
  await this.save();
  return this;
};

// Ensure virtuals are included in JSON
UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUnit>('Unit', UnitSchema);
