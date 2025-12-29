import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  // Builder reference
  builder: mongoose.Types.ObjectId;
  
  // Basic Information
  name: string;
  slug: string; // URL-friendly name
  tagline?: string;
  
  // Project Type & Category
  projectType: 'residential' | 'commercial' | 'mixed-use' | 'township' | 'villa' | 'plotted-development';
  segment: 'affordable' | 'mid-range' | 'premium' | 'luxury' | 'ultra-luxury';
  
  // Location
  location: {
    fullAddress: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    micromarket?: string; // e.g., "Gachibowli", "Whitefield"
  };
  
  // Project Details
  details: {
    totalArea: number; // in acres
    totalTowers?: number;
    totalFloors?: number;
    totalUnits: number;
    unitTypes: string[]; // e.g., ['1BHK', '2BHK', '3BHK', '4BHK']
    sizeRange: {
      min: number; // in sqft
      max: number;
    };
    priceRange: {
      min: number;
      max: number;
    };
  };
  
  // Approvals & Compliance
  approvals: {
    rera: {
      registrationNumber: string;
      validUntil: Date;
      certificateUrl?: string;
    };
    environmentClearance?: boolean;
    buildingPermit?: boolean;
    occupancyCertificate?: boolean;
    otherApprovals?: {
      name: string; // e.g., 'HMDA', 'GHMC', 'DTCP'
      number?: string;
      date?: Date;
    }[];
  };
  
  // Construction Status
  construction: {
    status: 'pre-launch' | 'new-launch' | 'under-construction' | 'nearing-possession' | 'ready-to-move';
    startDate?: Date;
    expectedCompletion?: Date;
    actualCompletion?: Date;
    progressPercentage?: number; // 0-100
    lastUpdated?: Date;
  };
  
  // Possession
  possession: {
    status: 'future' | 'ongoing' | 'ready';
    expectedDate?: Date;
    actualDate?: Date;
  };
  
  // Amenities
  amenities: {
    category: 'basic' | 'lifestyle' | 'sports' | 'safety' | 'convenience' | 'eco-friendly';
    name: string;
    icon?: string;
  }[];
  
  // Specifications
  specifications?: {
    category: string; // e.g., 'Flooring', 'Kitchen', 'Bathroom'
    items: {
      name: string;
      description: string;
    }[];
  }[];
  
  // Media
  media: {
    images: {
      url: string;
      key: string;
      type: 'exterior' | 'interior' | 'amenity' | 'floor-plan' | 'master-plan' | 'location' | 'other';
      caption?: string;
      order: number;
    }[];
    videos?: {
      url: string;
      type: 'youtube' | 'vimeo' | 'direct';
      title?: string;
    }[];
    virtualTour?: string;
    brochureUrl?: string;
  };
  
  // Documents
  documents?: {
    type: 'brochure' | 'floor-plan' | 'master-plan' | 'price-list' | 'rera-certificate' | 'legal-documents' | 'other';
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  
  // Pricing
  pricing: {
    basePricePerSqft?: number;
    floorRise?: {
      startFloor: number;
      risePerFloor: number; // amount per floor
    };
    plc?: { // Premium Location Charges
      type: string; // e.g., 'Corner', 'Park-facing', 'Road-facing'
      percentage?: number;
      flatAmount?: number;
    }[];
    otherCharges?: {
      name: string;
      amount: number;
      type: 'per-sqft' | 'flat' | 'percentage';
    }[];
  };
  
  // Offers & Schemes
  offers?: {
    title: string;
    description: string;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
  }[];
  
  // Payment Plans
  paymentPlans?: {
    name: string;
    description: string;
    milestones: {
      stage: string;
      percentage: number;
    }[];
    isActive: boolean;
  }[];
  
  // Bank Approvals
  bankApprovals?: {
    bankName: string;
    loanAvailable: boolean;
  }[];
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  
  // Status & Visibility
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  rejectionReason?: string;
  
  // Featured
  isFeatured: boolean;
  featuredUntil?: Date;
  featuredOrder?: number;
  
  // Stats
  stats: {
    views: number;
    inquiries: number;
    favorites: number;
    shares: number;
  };
  
  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    // Builder reference
    builder: {
      type: Schema.Types.ObjectId,
      ref: 'Builder',
      required: [true, 'Builder is required'],
      index: true
    },
    
    // Basic Information
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters'],
      maxlength: [200, 'Project name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      maxlength: [150, 'Tagline cannot exceed 150 characters']
    },
    
    // Project Type
    projectType: {
      type: String,
      enum: ['residential', 'commercial', 'mixed-use', 'township', 'villa', 'plotted-development'],
      required: [true, 'Project type is required']
    },
    segment: {
      type: String,
      enum: ['affordable', 'mid-range', 'premium', 'luxury', 'ultra-luxury'],
      required: [true, 'Segment is required']
    },
    
    // Location
    location: {
      fullAddress: {
        type: String,
        required: [true, 'Address is required']
      },
      locality: {
        type: String,
        required: [true, 'Locality is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[1-9][0-9]{5}$/, 'Invalid pincode']
      },
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      micromarket: String
    },
    
    // Project Details
    details: {
      totalArea: {
        type: Number,
        required: [true, 'Total area is required'],
        min: [0.1, 'Total area must be at least 0.1 acres']
      },
      totalTowers: {
        type: Number,
        min: 1
      },
      totalFloors: {
        type: Number,
        min: 1
      },
      totalUnits: {
        type: Number,
        required: [true, 'Total units is required'],
        min: [1, 'Must have at least 1 unit']
      },
      unitTypes: {
        type: [String],
        default: []
      },
      sizeRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
      },
      priceRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
      }
    },
    
    // Approvals
    approvals: {
      rera: {
        registrationNumber: {
          type: String,
          required: [true, 'RERA registration is required']
        },
        validUntil: {
          type: Date,
          required: [true, 'RERA validity is required']
        },
        certificateUrl: String
      },
      environmentClearance: { type: Boolean, default: false },
      buildingPermit: { type: Boolean, default: false },
      occupancyCertificate: { type: Boolean, default: false },
      otherApprovals: [{
        name: { type: String, required: true },
        number: String,
        date: Date
      }]
    },
    
    // Construction
    construction: {
      status: {
        type: String,
        enum: ['pre-launch', 'new-launch', 'under-construction', 'nearing-possession', 'ready-to-move'],
        required: [true, 'Construction status is required']
      },
      startDate: Date,
      expectedCompletion: Date,
      actualCompletion: Date,
      progressPercentage: {
        type: Number,
        min: 0,
        max: 100
      },
      lastUpdated: Date
    },
    
    // Possession
    possession: {
      status: {
        type: String,
        enum: ['future', 'ongoing', 'ready'],
        default: 'future'
      },
      expectedDate: Date,
      actualDate: Date
    },
    
    // Amenities
    amenities: [{
      category: {
        type: String,
        enum: ['basic', 'lifestyle', 'sports', 'safety', 'convenience', 'eco-friendly'],
        required: true
      },
      name: { type: String, required: true },
      icon: String
    }],
    
    // Specifications
    specifications: [{
      category: { type: String, required: true },
      items: [{
        name: { type: String, required: true },
        description: { type: String, required: true }
      }]
    }],
    
    // Media
    media: {
      images: [{
        url: { type: String, required: true },
        key: { type: String, required: true },
        type: {
          type: String,
          enum: ['exterior', 'interior', 'amenity', 'floor-plan', 'master-plan', 'location', 'other'],
          default: 'other'
        },
        caption: String,
        order: { type: Number, default: 0 }
      }],
      videos: [{
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['youtube', 'vimeo', 'direct'],
          default: 'youtube'
        },
        title: String
      }],
      virtualTour: String,
      brochureUrl: String
    },
    
    // Documents
    documents: [{
      type: {
        type: String,
        enum: ['brochure', 'floor-plan', 'master-plan', 'price-list', 'rera-certificate', 'legal-documents', 'other'],
        required: true
      },
      name: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Pricing
    pricing: {
      basePricePerSqft: Number,
      floorRise: {
        startFloor: Number,
        risePerFloor: Number
      },
      plc: [{
        type: { type: String, required: true },
        percentage: Number,
        flatAmount: Number
      }],
      otherCharges: [{
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        type: {
          type: String,
          enum: ['per-sqft', 'flat', 'percentage'],
          required: true
        }
      }]
    },
    
    // Offers
    offers: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      validFrom: { type: Date, required: true },
      validUntil: { type: Date, required: true },
      isActive: { type: Boolean, default: true }
    }],
    
    // Payment Plans
    paymentPlans: [{
      name: { type: String, required: true },
      description: String,
      milestones: [{
        stage: { type: String, required: true },
        percentage: { type: Number, required: true }
      }],
      isActive: { type: Boolean, default: true }
    }],
    
    // Bank Approvals
    bankApprovals: [{
      bankName: { type: String, required: true },
      loanAvailable: { type: Boolean, default: true }
    }],
    
    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'pending-approval', 'approved', 'rejected', 'archived'],
      default: 'draft'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'private'
    },
    rejectionReason: String,
    
    // Featured
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: Date,
    featuredOrder: Number,
    
    // Stats
    stats: {
      views: { type: Number, default: 0 },
      inquiries: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
      shares: { type: Number, default: 0 }
    },
    
    // Published
    publishedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
ProjectSchema.index({ builder: 1, status: 1 });
ProjectSchema.index({ 'location.city': 1, projectType: 1 });
ProjectSchema.index({ 'location.state': 1 });
ProjectSchema.index({ 'location.locality': 1 });
ProjectSchema.index({ projectType: 1, segment: 1 });
ProjectSchema.index({ 'construction.status': 1 });
ProjectSchema.index({ 'details.priceRange.min': 1, 'details.priceRange.max': 1 });
ProjectSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
ProjectSchema.index({ isFeatured: -1, featuredOrder: 1 });
ProjectSchema.index({ 'approvals.rera.registrationNumber': 1 });
ProjectSchema.index({ createdAt: -1 });

// Text search
ProjectSchema.index({
  name: 'text',
  tagline: 'text',
  'location.locality': 'text',
  'location.city': 'text'
});

// Pre-save: Generate slug
ProjectSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    const idSuffix = (this._id as any)?.toString().slice(-6) || Math.random().toString(36).slice(-6);
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + 
      '-' + idSuffix;
  }
  next();
});

// Virtual: Check if project has active offers
ProjectSchema.virtual('hasActiveOffers').get(function() {
  if (!this.offers) return false;
  const now = new Date();
  return this.offers.some(offer => 
    offer.isActive && offer.validFrom <= now && offer.validUntil >= now
  );
});

// Virtual: Is RERA valid
ProjectSchema.virtual('isReraValid').get(function() {
  return this.approvals.rera.validUntil > new Date();
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
