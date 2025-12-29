import mongoose, { Document, Schema } from 'mongoose';

// PricingRule defines dynamic pricing rules for a project/tower
// This allows builders to set base prices and various premiums

export interface IPricingRule extends Document {
  project: mongoose.Types.ObjectId;
  tower?: mongoose.Types.ObjectId;
  builder: mongoose.Types.ObjectId;
  
  name: string;
  description?: string;
  
  // Base Pricing
  basePricing: {
    pricePerSqft: number;
    currency: string;
  };
  
  // Floor Rise - Price increase per floor
  floorRise: {
    enabled: boolean;
    type: 'fixed' | 'percentage';
    value: number; // Fixed amount per sqft per floor OR percentage
    startFromFloor: number; // Floor from which to start applying
    maxFloor?: number; // Optional cap
  };
  
  // Facing Premium
  facingPremium: {
    enabled: boolean;
    premiums: {
      facing: 'east' | 'west' | 'north' | 'south' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
      type: 'fixed' | 'percentage';
      value: number;
    }[];
  };
  
  // Corner Unit Premium
  cornerPremium: {
    enabled: boolean;
    type: 'fixed' | 'percentage';
    value: number;
  };
  
  // Unit Type Premium (e.g., Penthouse, Duplex)
  unitTypePremium: {
    enabled: boolean;
    premiums: {
      unitType: string;
      type: 'fixed' | 'percentage';
      value: number;
    }[];
  };
  
  // View Premium (Garden view, Pool view, etc.)
  viewPremium: {
    enabled: boolean;
    premiums: {
      viewType: string;
      type: 'fixed' | 'percentage';
      value: number;
    }[];
  };
  
  // Additional Charges
  additionalCharges: {
    carParking: {
      covered: number;
      open: number;
    };
    clubMembership: number;
    maintenanceDeposit: {
      type: 'fixed' | 'per-sqft' | 'months';
      value: number;
      months?: number; // If type is 'months', how many months
    };
    legalCharges: number;
    developmentCharges?: number;
    infrastructureCharges?: number;
  };
  
  // Government Charges (for information/calculation)
  governmentCharges: {
    stampDutyPercentage: number;
    registrationPercentage: number;
    gstPercentage: number; // Usually 5% for under-construction, 0% for ready
    tdsPercentage?: number;
  };
  
  // Price Escalation (for future phases)
  escalation: {
    enabled: boolean;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    type: 'fixed' | 'percentage';
    value: number;
    nextEscalationDate?: Date;
  };
  
  // Validity
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PricingRuleSchema = new Schema<IPricingRule>({
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
    required: true,
    trim: true
  },
  description: String,
  
  basePricing: {
    pricePerSqft: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  floorRise: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    value: { type: Number, default: 0 },
    startFromFloor: { type: Number, default: 1 },
    maxFloor: Number
  },
  
  facingPremium: {
    enabled: { type: Boolean, default: false },
    premiums: [{
      facing: {
        type: String,
        enum: ['east', 'west', 'north', 'south', 'north-east', 'north-west', 'south-east', 'south-west']
      },
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      value: { type: Number, default: 0 }
    }]
  },
  
  cornerPremium: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    value: { type: Number, default: 0 }
  },
  
  unitTypePremium: {
    enabled: { type: Boolean, default: false },
    premiums: [{
      unitType: String,
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      value: { type: Number, default: 0 }
    }]
  },
  
  viewPremium: {
    enabled: { type: Boolean, default: false },
    premiums: [{
      viewType: String,
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      value: { type: Number, default: 0 }
    }]
  },
  
  additionalCharges: {
    carParking: {
      covered: { type: Number, default: 0 },
      open: { type: Number, default: 0 }
    },
    clubMembership: { type: Number, default: 0 },
    maintenanceDeposit: {
      type: { type: String, enum: ['fixed', 'per-sqft', 'months'], default: 'fixed' },
      value: { type: Number, default: 0 },
      months: Number
    },
    legalCharges: { type: Number, default: 0 },
    developmentCharges: Number,
    infrastructureCharges: Number
  },
  
  governmentCharges: {
    stampDutyPercentage: { type: Number, default: 5 },
    registrationPercentage: { type: Number, default: 1 },
    gstPercentage: { type: Number, default: 5 },
    tdsPercentage: Number
  },
  
  escalation: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    type: { type: String, enum: ['fixed', 'percentage'] },
    value: Number,
    nextEscalationDate: Date
  },
  
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
PricingRuleSchema.index({ project: 1, isActive: 1 });
PricingRuleSchema.index({ project: 1, tower: 1, isActive: 1 });
PricingRuleSchema.index({ validFrom: 1, validUntil: 1 });

// Method: Calculate unit price based on this rule
PricingRuleSchema.methods.calculateUnitPrice = function(unit: {
  area: { superBuiltUp: number };
  floor: number;
  facing: string;
  isCorner: boolean;
  unitType: string;
  viewType?: string;
  parking?: { covered: number; open: number };
}) {
  let basePrice = this.basePricing.pricePerSqft * unit.area.superBuiltUp;
  let totalPremiums = 0;
  const breakdown: Record<string, number> = {
    basePrice
  };
  
  // Floor Rise
  if (this.floorRise.enabled && unit.floor >= this.floorRise.startFromFloor) {
    const applicableFloors = unit.floor - this.floorRise.startFromFloor + 1;
    const maxFloors = this.floorRise.maxFloor 
      ? Math.min(applicableFloors, this.floorRise.maxFloor - this.floorRise.startFromFloor + 1)
      : applicableFloors;
    
    if (this.floorRise.type === 'fixed') {
      breakdown.floorRise = this.floorRise.value * unit.area.superBuiltUp * maxFloors;
    } else {
      breakdown.floorRise = basePrice * (this.floorRise.value / 100) * maxFloors;
    }
    totalPremiums += breakdown.floorRise;
  }
  
  // Facing Premium
  if (this.facingPremium.enabled) {
    const facingConfig = this.facingPremium.premiums.find(
      (p: { facing: string }) => p.facing === unit.facing
    );
    if (facingConfig) {
      if (facingConfig.type === 'fixed') {
        breakdown.facingPremium = facingConfig.value * unit.area.superBuiltUp;
      } else {
        breakdown.facingPremium = basePrice * (facingConfig.value / 100);
      }
      totalPremiums += breakdown.facingPremium;
    }
  }
  
  // Corner Premium
  if (this.cornerPremium.enabled && unit.isCorner) {
    if (this.cornerPremium.type === 'fixed') {
      breakdown.cornerPremium = this.cornerPremium.value * unit.area.superBuiltUp;
    } else {
      breakdown.cornerPremium = basePrice * (this.cornerPremium.value / 100);
    }
    totalPremiums += breakdown.cornerPremium;
  }
  
  // Unit Type Premium
  if (this.unitTypePremium.enabled) {
    const typeConfig = this.unitTypePremium.premiums.find(
      (p: { unitType: string }) => p.unitType === unit.unitType
    );
    if (typeConfig) {
      if (typeConfig.type === 'fixed') {
        breakdown.unitTypePremium = typeConfig.value;
      } else {
        breakdown.unitTypePremium = basePrice * (typeConfig.value / 100);
      }
      totalPremiums += breakdown.unitTypePremium;
    }
  }
  
  // View Premium
  if (this.viewPremium.enabled && unit.viewType) {
    const viewConfig = this.viewPremium.premiums.find(
      (p: { viewType: string }) => p.viewType === unit.viewType
    );
    if (viewConfig) {
      if (viewConfig.type === 'fixed') {
        breakdown.viewPremium = viewConfig.value;
      } else {
        breakdown.viewPremium = basePrice * (viewConfig.value / 100);
      }
      totalPremiums += breakdown.viewPremium;
    }
  }
  
  // Additional Charges
  let additionalCharges = 0;
  
  if (unit.parking) {
    breakdown.carParking = 
      (unit.parking.covered * this.additionalCharges.carParking.covered) +
      (unit.parking.open * this.additionalCharges.carParking.open);
    additionalCharges += breakdown.carParking;
  }
  
  breakdown.clubMembership = this.additionalCharges.clubMembership;
  additionalCharges += breakdown.clubMembership;
  
  if (this.additionalCharges.maintenanceDeposit.type === 'per-sqft') {
    breakdown.maintenanceDeposit = this.additionalCharges.maintenanceDeposit.value * unit.area.superBuiltUp;
  } else {
    breakdown.maintenanceDeposit = this.additionalCharges.maintenanceDeposit.value;
  }
  additionalCharges += breakdown.maintenanceDeposit;
  
  breakdown.legalCharges = this.additionalCharges.legalCharges;
  additionalCharges += breakdown.legalCharges;
  
  const totalPrice = basePrice + totalPremiums + additionalCharges;
  
  // Government Charges
  const govCharges = {
    stampDuty: totalPrice * (this.governmentCharges.stampDutyPercentage / 100),
    registration: totalPrice * (this.governmentCharges.registrationPercentage / 100),
    gst: totalPrice * (this.governmentCharges.gstPercentage / 100)
  };
  
  const allInclusivePrice = totalPrice + govCharges.stampDuty + govCharges.registration + govCharges.gst;
  
  return {
    breakdown,
    totalPremiums,
    additionalCharges,
    totalPrice,
    governmentCharges: govCharges,
    allInclusivePrice,
    pricePerSqft: Math.round(totalPrice / unit.area.superBuiltUp)
  };
};

export default mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);
