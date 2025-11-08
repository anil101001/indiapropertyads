import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'independent-house' | 'plot';
  listingType: 'sale' | 'rent';
  plotType?: 'gated-community' | 'independent'; // Only for plots
  
  // Methods
  isOwner(userId: string): boolean;
  incrementViews(): Promise<void>;
  
  // Location
  address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  
  // Specifications
  specs: {
    carpetArea: number; // in sqft
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
  
  // Amenities
  amenities: string[];
  
  // Pricing
  pricing: {
    expectedPrice: number;
    priceNegotiable: boolean;
    maintenanceCharges?: number;
    securityDeposit?: number;
  };
  
  // Images
  images: {
    url: string;
    key: string; // S3 key for deletion
    isCover: boolean;
    order: number;
  }[];
  
  // Ownership
  owner: mongoose.Types.ObjectId; // Reference to User
  
  // Status
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'sold' | 'rented';
  rejectionReason?: string;
  
  // Verification
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // AI Valuation
  aiValuation?: {
    suggestedPrice: number;
    confidence: number;
    calculatedAt: Date;
  };
  
  // Stats
  stats: {
    views: number;
    inquiries: number;
    favorites: number;
  };
  
  // Timestamps
  publishedAt?: Date;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'independent-house', 'plot'],
      required: [true, 'Property type is required']
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      required: [true, 'Listing type is required']
    },
    plotType: {
      type: String,
      enum: ['gated-community', 'independent'],
      required: false // Only required for plots
    },
    
    // Location
    address: {
      fullAddress: {
        type: String,
        required: [true, 'Full address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[1-9][0-9]{5}$/, 'Please provide a valid Indian pincode']
      },
      landmark: String
    },
    
    // Specifications
    specs: {
      carpetArea: {
        type: Number,
        required: [true, 'Carpet area is required'],
        min: [100, 'Carpet area must be at least 100 sqft'],
        max: [50000, 'Carpet area cannot exceed 50000 sqft']
      },
      bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative'],
        max: [20, 'Bedrooms cannot exceed 20']
      },
      bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [1, 'At least 1 bathroom is required'],
        max: [20, 'Bathrooms cannot exceed 20']
      },
      balconies: {
        type: Number,
        default: 0,
        min: [0, 'Balconies cannot be negative'],
        max: [10, 'Balconies cannot exceed 10']
      },
      parking: {
        covered: {
          type: Number,
          default: 0,
          min: [0, 'Covered parking cannot be negative']
        },
        open: {
          type: Number,
          default: 0,
          min: [0, 'Open parking cannot be negative']
        }
      },
      floor: Number,
      totalFloors: Number,
      propertyAge: {
        type: String,
        enum: ['<1', '1-5', '5-10', '10+'],
        required: [true, 'Property age is required']
      },
      furnishing: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        required: [true, 'Furnishing status is required']
      },
      possession: {
        type: String,
        enum: ['immediate', '1-month', '3-months', 'under-construction'],
        required: [true, 'Possession status is required']
      }
    },
    
    // Amenities
    amenities: {
      type: [String],
      default: []
    },
    
    // Pricing
    pricing: {
      expectedPrice: {
        type: Number,
        required: [true, 'Expected price is required'],
        min: [10000, 'Price must be at least ₹10,000'],
        max: [1000000000, 'Price cannot exceed ₹100 crores']
      },
      priceNegotiable: {
        type: Boolean,
        default: true
      },
      maintenanceCharges: {
        type: Number,
        min: [0, 'Maintenance charges cannot be negative']
      },
      securityDeposit: {
        type: Number,
        min: [0, 'Security deposit cannot be negative']
      }
    },
    
    // Images
    images: [{
      url: {
        type: String,
        required: true
      },
      key: {
        type: String,
        required: true
      },
      isCover: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        required: true
      }
    }],
    
    // Ownership
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'pending-approval', 'approved', 'rejected', 'sold', 'rented'],
      default: 'draft'
    },
    rejectionReason: String,
    
    // Verification
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // AI Valuation
    aiValuation: {
      suggestedPrice: Number,
      confidence: Number,
      calculatedAt: Date
    },
    
    // Stats
    stats: {
      views: {
        type: Number,
        default: 0
      },
      inquiries: {
        type: Number,
        default: 0
      },
      favorites: {
        type: Number,
        default: 0
      }
    },
    
    // Timestamps
    publishedAt: Date,
    soldAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
PropertySchema.index({ owner: 1, status: 1 });
PropertySchema.index({ 'address.city': 1, listingType: 1 });
PropertySchema.index({ propertyType: 1, listingType: 1 });
PropertySchema.index({ 'pricing.expectedPrice': 1 });
PropertySchema.index({ status: 1, publishedAt: -1 });
PropertySchema.index({ createdAt: -1 });

// Text search index
PropertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

// Virtual for BHK configuration
PropertySchema.virtual('bhk').get(function() {
  return `${this.specs.bedrooms}BHK`;
});

// Method to check if user is owner
PropertySchema.methods.isOwner = function(userId: string): boolean {
  return this.owner.toString() === userId;
};

// Method to increment views
PropertySchema.methods.incrementViews = async function(): Promise<void> {
  this.stats.views += 1;
  await this.save();
};

const Property = mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
