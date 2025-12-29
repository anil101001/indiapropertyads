import mongoose, { Document, Schema } from 'mongoose';

// Tower/Phase represents a building block within a project
// A project can have multiple towers (for apartments) or phases (for villas/plots)

export interface ITower extends Document {
  project: mongoose.Types.ObjectId;
  builder: mongoose.Types.ObjectId;
  
  // Basic Info
  name: string; // e.g., "Tower A", "Phase 1", "Block B"
  type: 'tower' | 'phase' | 'block' | 'wing';
  displayOrder: number; // For sorting in UI
  
  // Structure Details
  structure: {
    totalFloors: number;
    basementFloors?: number;
    groundFloor: boolean; // Whether ground floor has units
    unitsPerFloor: number;
    totalUnits: number;
  };
  
  // Floor Configuration
  floorConfig: {
    floorNumber: number;
    name?: string; // e.g., "Ground Floor", "Podium Level"
    unitCount: number;
    isParking?: boolean;
    isAmenity?: boolean;
  }[];
  
  // Unit Types Available in this Tower
  unitTypes: {
    type: string; // e.g., "2 BHK", "3 BHK", "Penthouse"
    count: number;
    sizeRange: {
      min: number;
      max: number;
      unit: 'sqft' | 'sqm' | 'sqyd';
    };
    priceRange: {
      min: number;
      max: number;
    };
    floors?: number[]; // Which floors have this unit type
  }[];
  
  // Construction Status
  construction: {
    status: 'not-started' | 'foundation' | 'structure' | 'finishing' | 'completed';
    startDate?: Date;
    expectedCompletion?: Date;
    actualCompletion?: Date;
    progressPercentage: number;
    lastUpdated: Date;
  };
  
  // Approvals specific to this tower
  approvals: {
    occupancyCertificate?: {
      received: boolean;
      number?: string;
      date?: Date;
    };
    completionCertificate?: {
      received: boolean;
      number?: string;
      date?: Date;
    };
  };
  
  // Amenities specific to this tower
  amenities: string[];
  
  // Specifications
  specifications: {
    structureType?: string; // e.g., "RCC Framed Structure"
    wallType?: string;
    flooringType?: string;
    fittings?: string;
    electricals?: string;
  };
  
  // Media
  media: {
    images: {
      url: string;
      caption?: string;
      type: 'exterior' | 'lobby' | 'amenity' | 'floor-plan' | 'other';
    }[];
    floorPlans: {
      floor: number | string;
      url: string;
      unitTypes?: string[];
    }[];
    videos?: {
      url: string;
      title?: string;
    }[];
  };
  
  // Inventory Summary (auto-calculated)
  inventory: {
    total: number;
    available: number;
    booked: number;
    sold: number;
    blocked: number;
    lastUpdated: Date;
  };
  
  // Status
  status: 'draft' | 'active' | 'sold-out' | 'archived';
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const TowerSchema = new Schema<ITower>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
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
    required: [true, 'Tower/Phase name is required'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['tower', 'phase', 'block', 'wing'],
    default: 'tower'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  structure: {
    totalFloors: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    basementFloors: {
      type: Number,
      default: 0,
      min: 0
    },
    groundFloor: {
      type: Boolean,
      default: true
    },
    unitsPerFloor: {
      type: Number,
      required: true,
      min: 1
    },
    totalUnits: {
      type: Number,
      required: true,
      min: 1
    }
  },
  
  floorConfig: [{
    floorNumber: {
      type: Number,
      required: true
    },
    name: String,
    unitCount: {
      type: Number,
      required: true,
      min: 0
    },
    isParking: {
      type: Boolean,
      default: false
    },
    isAmenity: {
      type: Boolean,
      default: false
    }
  }],
  
  unitTypes: [{
    type: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    sizeRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      unit: {
        type: String,
        enum: ['sqft', 'sqm', 'sqyd'],
        default: 'sqft'
      }
    },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    floors: [Number]
  }],
  
  construction: {
    status: {
      type: String,
      enum: ['not-started', 'foundation', 'structure', 'finishing', 'completed'],
      default: 'not-started'
    },
    startDate: Date,
    expectedCompletion: Date,
    actualCompletion: Date,
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  approvals: {
    occupancyCertificate: {
      received: { type: Boolean, default: false },
      number: String,
      date: Date
    },
    completionCertificate: {
      received: { type: Boolean, default: false },
      number: String,
      date: Date
    }
  },
  
  amenities: [String],
  
  specifications: {
    structureType: String,
    wallType: String,
    flooringType: String,
    fittings: String,
    electricals: String
  },
  
  media: {
    images: [{
      url: { type: String, required: true },
      caption: String,
      type: {
        type: String,
        enum: ['exterior', 'lobby', 'amenity', 'floor-plan', 'other'],
        default: 'other'
      }
    }],
    floorPlans: [{
      floor: Schema.Types.Mixed, // Can be number or string like "G", "Terrace"
      url: { type: String, required: true },
      unitTypes: [String]
    }],
    videos: [{
      url: String,
      title: String
    }]
  },
  
  inventory: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'sold-out', 'archived'],
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
TowerSchema.index({ project: 1, name: 1 }, { unique: true });
TowerSchema.index({ project: 1, displayOrder: 1 });
TowerSchema.index({ builder: 1, status: 1 });
TowerSchema.index({ 'construction.status': 1 });

// Pre-save: Calculate total units if not provided
TowerSchema.pre('save', function(next) {
  if (this.isModified('structure') && !this.structure.totalUnits) {
    // Calculate based on floors and units per floor
    const floors = this.structure.totalFloors + (this.structure.groundFloor ? 1 : 0);
    this.structure.totalUnits = floors * this.structure.unitsPerFloor;
  }
  
  // Initialize inventory total
  if (this.isNew && this.structure.totalUnits) {
    this.inventory.total = this.structure.totalUnits;
    this.inventory.available = this.structure.totalUnits;
  }
  
  next();
});

// Virtual: Availability percentage
TowerSchema.virtual('availabilityPercentage').get(function() {
  if (this.inventory.total === 0) return 0;
  return Math.round((this.inventory.available / this.inventory.total) * 100);
});

// Virtual: Is sold out
TowerSchema.virtual('isSoldOut').get(function() {
  return this.inventory.available === 0;
});

// Method: Update inventory counts
TowerSchema.methods.updateInventory = async function() {
  const Unit = mongoose.model('Unit');
  
  const counts = await Unit.aggregate([
    { $match: { tower: this._id, isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const statusMap: Record<string, number> = {
    available: 0,
    booked: 0,
    sold: 0,
    blocked: 0
  };
  
  counts.forEach((c: { _id: string; count: number }) => {
    statusMap[c._id] = c.count;
  });
  
  this.inventory = {
    total: Object.values(statusMap).reduce((a, b) => a + b, 0),
    available: statusMap.available,
    booked: statusMap.booked,
    sold: statusMap.sold,
    blocked: statusMap.blocked,
    lastUpdated: new Date()
  };
  
  // Update status if sold out
  if (this.inventory.available === 0 && this.inventory.total > 0) {
    this.status = 'sold-out';
  }
  
  await this.save();
};

// Ensure virtuals are included in JSON
TowerSchema.set('toJSON', { virtuals: true });
TowerSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITower>('Tower', TowerSchema);
