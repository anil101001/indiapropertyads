import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'independent-house' | 'plot' | 'shop' | 'office' | 'warehouse' | 'showroom';
  listingType: 'sale' | 'rent';
  plotType?: 'gated-community' | 'independent'; // Only for plots (legacy - use landDetails.layoutStatus instead)
  
  // Land/Plot Specific Details (required when propertyType is 'plot')
  landDetails?: {
    plotSubType: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'sez' | 'mixed-use';
    zoningClassification: string[];  // Multi-select: 'approved-residential', 'approved-commercial', 'approved-industrial', 'agricultural', 'it-sez', 'mixed-use-approved'
    layoutStatus: 'approved-municipal' | 'approved-rera' | 'unapproved' | 'gated-community';
    ownershipType: 'freehold' | 'leasehold';
    legalStatus: 'clear-title' | 'litigated' | 'rera-approved';
    areaUnit: 'sqft' | 'sqm' | 'yards' | 'acres' | 'hectares';
    plotArea: number; // Area in the selected unit
    roadAccess?: string;  // e.g., "Highway facing", "4-lane road", "Internal road"
    boundaryWall: boolean;
    waterConnection: boolean;
    electricityConnection: boolean;
    cornerPlot?: boolean;
    gatedSecurity?: boolean;
  };
  
  // Vector Search (AI/ML)
  embedding?: number[]; // 1536-dimensional vector for semantic search
  embeddingMetadata?: {
    model: string; // e.g., 'text-embedding-3-small'
    generatedAt: Date;
    textUsed: string; // What text was vectorized
  };
  
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
  
  // Social Media Links
  socialMedia?: {
    youtube?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  
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
      enum: ['apartment', 'villa', 'independent-house', 'plot', 'shop', 'office', 'warehouse', 'showroom'],
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
      required: false // Legacy field - use landDetails.layoutStatus instead
    },
    
    // Land/Plot Specific Details
    landDetails: {
      plotSubType: {
        type: String,
        enum: ['residential', 'commercial', 'industrial', 'agricultural', 'sez', 'mixed-use'],
        required: function(this: any) { return this.propertyType === 'plot'; }
      },
      zoningClassification: {
        type: [String],
        enum: ['approved-residential', 'approved-commercial', 'approved-industrial', 'agricultural', 'it-sez', 'mixed-use-approved'],
        default: []
      },
      layoutStatus: {
        type: String,
        enum: ['approved-municipal', 'approved-rera', 'unapproved', 'gated-community'],
        required: function(this: any) { return this.propertyType === 'plot'; }
      },
      ownershipType: {
        type: String,
        enum: ['freehold', 'leasehold'],
        required: function(this: any) { return this.propertyType === 'plot'; }
      },
      legalStatus: {
        type: String,
        enum: ['clear-title', 'litigated', 'rera-approved'],
        required: function(this: any) { return this.propertyType === 'plot'; }
      },
      areaUnit: {
        type: String,
        enum: ['sqft', 'sqm', 'yards', 'acres', 'hectares'],
        default: 'sqft'
      },
      plotArea: {
        type: Number,
        min: [1, 'Plot area must be at least 1']
      },
      roadAccess: {
        type: String,
        trim: true
      },
      boundaryWall: {
        type: Boolean,
        default: false
      },
      waterConnection: {
        type: Boolean,
        default: false
      },
      electricityConnection: {
        type: Boolean,
        default: false
      },
      cornerPlot: {
        type: Boolean,
        default: false
      },
      gatedSecurity: {
        type: Boolean,
        default: false
      }
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
        min: [0, 'Bathrooms cannot be negative'],
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
    
    // Social Media Links
    socialMedia: {
      youtube: {
        type: String,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
          },
          message: 'Please enter a valid YouTube URL'
        }
      },
      facebook: {
        type: String,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/.test(v);
          },
          message: 'Please enter a valid Facebook URL'
        }
      },
      instagram: {
        type: String,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/.test(v);
          },
          message: 'Please enter a valid Instagram URL'
        }
      },
      twitter: {
        type: String,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/.test(v);
          },
          message: 'Please enter a valid Twitter/X URL'
        }
      },
      website: {
        type: String,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(v);
          },
          message: 'Please enter a valid website URL'
        }
      }
    },
    
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
    
    // Vector Search (AI/ML) - Optional for backwards compatibility
    embedding: {
      type: [Number],
      required: false,
      select: false // Don't return in queries by default (large array)
    },
    embeddingMetadata: {
      model: String,
      generatedAt: Date,
      textUsed: String
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

// Land/Plot specific indexes
PropertySchema.index({ 'landDetails.plotSubType': 1 });
PropertySchema.index({ 'landDetails.ownershipType': 1 });
PropertySchema.index({ 'landDetails.legalStatus': 1 });
PropertySchema.index({ 'landDetails.layoutStatus': 1 });

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

// Post-save hook: Auto-vectorize property for AI search
PropertySchema.post('save', async function(doc) {
  // Only vectorize if embedding doesn't exist or property content changed
  const needsVectorization = !doc.embedding || doc.isModified('title') || doc.isModified('description') || doc.isModified('address');
  
  if (needsVectorization) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 AUTO-VECTORIZATION TRIGGERED');
    console.log(`   Property ID: ${doc._id}`);
    console.log(`   Title: ${doc.title}`);
    console.log(`   Reason: ${!doc.embedding ? 'New property (no embedding)' : 'Content updated'}`);
    console.log('   Status: Starting vectorization...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Import dynamically to avoid circular dependency
      const { generatePropertyEmbedding } = await import('../services/embedding.service');
      
      // Generate embedding asynchronously (don't block save)
      generatePropertyEmbedding(doc).then(() => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ AUTO-VECTORIZATION COMPLETE');
        console.log(`   Property ID: ${doc._id}`);
        console.log(`   Title: ${doc.title}`);
        console.log('   Status: Ready for AI search!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }).catch(error => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ AUTO-VECTORIZATION FAILED');
        console.log(`   Property ID: ${doc._id}`);
        console.log(`   Title: ${doc.title}`);
        console.log(`   Error: ${error.message}`);
        console.log('   Impact: Property saved but NOT searchable by AI');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
      
    } catch (error: any) {
      // Log error but don't fail the save operation
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ AUTO-VECTORIZATION ERROR');
      console.log(`   Property ID: ${doc._id}`);
      console.log(`   Error: ${error.message}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } else {
    console.log(`⏭️  Skipping vectorization for property ${doc._id} - no changes to searchable content`);
  }
});

const Property = mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
