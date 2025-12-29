import mongoose, { Document, Schema } from 'mongoose';

export interface IBuilder extends Document {
  // User reference (builder account)
  user: mongoose.Types.ObjectId;
  
  // Company Information
  companyName: string;
  brandName?: string;
  logo?: string;
  coverImage?: string;
  
  // Company Details
  companyType: 'proprietorship' | 'partnership' | 'pvt-ltd' | 'ltd' | 'llp';
  establishedYear: number;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  
  // Registration & Compliance
  rera: {
    registrationNumber: string;
    state: string;
    validUntil: Date;
    certificateUrl?: string;
  };
  gst?: {
    number: string;
    certificateUrl?: string;
  };
  pan?: {
    number: string;
  };
  
  // Contact Information
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
    website?: string;
  };
  
  // Address
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
  
  // About & Description
  about: {
    shortDescription: string; // 200 chars
    fullDescription?: string; // 2000 chars
    vision?: string;
    mission?: string;
  };
  
  // Portfolio & Experience
  portfolio: {
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    upcomingProjects: number;
    totalSqftDelivered?: number;
    citiesPresent: string[];
  };
  
  // Specialization
  specialization: {
    propertyTypes: ('residential' | 'commercial' | 'mixed-use' | 'township' | 'villa' | 'plotted-development')[];
    segments: ('affordable' | 'mid-range' | 'premium' | 'luxury' | 'ultra-luxury')[];
  };
  
  // Awards & Certifications
  awards?: {
    title: string;
    year: number;
    issuedBy: string;
  }[];
  
  certifications?: {
    name: string;
    issuedBy: string;
    validUntil?: Date;
  }[];
  
  // Social Media
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Sales Team
  salesTeam?: {
    user: mongoose.Types.ObjectId;
    role: 'sales-head' | 'sales-manager' | 'sales-executive';
    assignedProjects?: mongoose.Types.ObjectId[];
    isActive: boolean;
  }[];
  
  // Verification & Status
  verification: {
    status: 'pending' | 'under-review' | 'verified' | 'rejected';
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    documents?: {
      type: 'rera-certificate' | 'gst-certificate' | 'pan-card' | 'company-registration' | 'other';
      url: string;
      uploadedAt: Date;
      verified: boolean;
    }[];
  };
  
  // Subscription & Plan
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    maxProjects: number;
    maxUnitsPerProject: number;
    featuresEnabled: string[];
    validUntil: Date;
    autoRenew: boolean;
  };
  
  // Stats
  stats: {
    totalViews: number;
    totalInquiries: number;
    totalLeads: number;
    avgRating?: number;
    reviewCount: number;
  };
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BuilderSchema = new Schema<IBuilder>(
  {
    // User reference
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    
    // Company Information
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [3, 'Company name must be at least 3 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters']
    },
    brandName: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    logo: String,
    coverImage: String,
    
    // Company Details
    companyType: {
      type: String,
      enum: ['proprietorship', 'partnership', 'pvt-ltd', 'ltd', 'llp'],
      required: [true, 'Company type is required']
    },
    establishedYear: {
      type: Number,
      required: [true, 'Established year is required'],
      min: [1900, 'Invalid year'],
      max: [new Date().getFullYear(), 'Year cannot be in future']
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    
    // RERA Registration
    rera: {
      registrationNumber: {
        type: String,
        required: [true, 'RERA registration number is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'RERA state is required']
      },
      validUntil: {
        type: Date,
        required: [true, 'RERA validity date is required']
      },
      certificateUrl: String
    },
    
    // GST
    gst: {
      number: {
        type: String,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format']
      },
      certificateUrl: String
    },
    
    // PAN
    pan: {
      number: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
      }
    },
    
    // Contact
    contact: {
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        match: [/^[6-9]\d{9}$/, 'Invalid phone number']
      },
      alternatePhone: {
        type: String,
        match: [/^[6-9]\d{9}$/, 'Invalid phone number']
      },
      website: String
    },
    
    // Address
    address: {
      registered: {
        fullAddress: {
          type: String,
          required: [true, 'Registered address is required']
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
        }
      },
      corporate: {
        fullAddress: String,
        city: String,
        state: String,
        pincode: String
      }
    },
    
    // About
    about: {
      shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: [300, 'Short description cannot exceed 300 characters']
      },
      fullDescription: {
        type: String,
        maxlength: [3000, 'Full description cannot exceed 3000 characters']
      },
      vision: {
        type: String,
        maxlength: [500, 'Vision cannot exceed 500 characters']
      },
      mission: {
        type: String,
        maxlength: [500, 'Mission cannot exceed 500 characters']
      }
    },
    
    // Portfolio
    portfolio: {
      totalProjects: {
        type: Number,
        default: 0,
        min: 0
      },
      completedProjects: {
        type: Number,
        default: 0,
        min: 0
      },
      ongoingProjects: {
        type: Number,
        default: 0,
        min: 0
      },
      upcomingProjects: {
        type: Number,
        default: 0,
        min: 0
      },
      totalSqftDelivered: {
        type: Number,
        min: 0
      },
      citiesPresent: {
        type: [String],
        default: []
      }
    },
    
    // Specialization
    specialization: {
      propertyTypes: {
        type: [String],
        enum: ['residential', 'commercial', 'mixed-use', 'township', 'villa', 'plotted-development'],
        default: ['residential']
      },
      segments: {
        type: [String],
        enum: ['affordable', 'mid-range', 'premium', 'luxury', 'ultra-luxury'],
        default: ['mid-range']
      }
    },
    
    // Awards
    awards: [{
      title: { type: String, required: true },
      year: { type: Number, required: true },
      issuedBy: { type: String, required: true }
    }],
    
    // Certifications
    certifications: [{
      name: { type: String, required: true },
      issuedBy: { type: String, required: true },
      validUntil: Date
    }],
    
    // Social Media
    socialMedia: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
      youtube: String
    },
    
    // Sales Team
    salesTeam: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['sales-head', 'sales-manager', 'sales-executive'],
        required: true
      },
      assignedProjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
      }],
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    
    // Verification
    verification: {
      status: {
        type: String,
        enum: ['pending', 'under-review', 'verified', 'rejected'],
        default: 'pending'
      },
      verifiedAt: Date,
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectionReason: String,
      documents: [{
        type: {
          type: String,
          enum: ['rera-certificate', 'gst-certificate', 'pan-card', 'company-registration', 'other'],
          required: true
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
      }]
    },
    
    // Subscription
    subscription: {
      plan: {
        type: String,
        enum: ['starter', 'professional', 'enterprise'],
        default: 'starter'
      },
      maxProjects: {
        type: Number,
        default: 5
      },
      maxUnitsPerProject: {
        type: Number,
        default: 100
      },
      featuresEnabled: {
        type: [String],
        default: ['basic-listing', 'lead-management']
      },
      validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
      },
      autoRenew: {
        type: Boolean,
        default: false
      }
    },
    
    // Stats
    stats: {
      totalViews: { type: Number, default: 0 },
      totalInquiries: { type: Number, default: 0 },
      totalLeads: { type: Number, default: 0 },
      avgRating: { type: Number, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 }
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: Date
  },
  {
    timestamps: true
  }
);

// Indexes
BuilderSchema.index({ user: 1 });
BuilderSchema.index({ companyName: 'text', brandName: 'text' });
BuilderSchema.index({ 'address.registered.city': 1 });
BuilderSchema.index({ 'address.registered.state': 1 });
BuilderSchema.index({ 'verification.status': 1 });
BuilderSchema.index({ 'rera.registrationNumber': 1 });
BuilderSchema.index({ isActive: 1, isFeatured: -1 });
BuilderSchema.index({ 'specialization.propertyTypes': 1 });
BuilderSchema.index({ 'specialization.segments': 1 });
BuilderSchema.index({ createdAt: -1 });

// Virtual for years of experience
BuilderSchema.virtual('yearsOfExperience').get(function() {
  return new Date().getFullYear() - this.establishedYear;
});

// Virtual to check if RERA is valid
BuilderSchema.virtual('isReraValid').get(function() {
  return this.rera.validUntil > new Date();
});

const Builder = mongoose.model<IBuilder>('Builder', BuilderSchema);

export default Builder;
