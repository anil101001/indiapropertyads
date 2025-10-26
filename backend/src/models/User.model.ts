import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  role: 'buyer' | 'owner' | 'agent' | 'admin';
  profile: {
    name: string;
    avatar?: string;
    location?: {
      city: string;
      state: string;
      pincode?: string;
    };
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    emailOTP?: string;
    emailOTPExpires?: Date;
    kycStatus?: 'pending' | 'approved' | 'rejected';
  };
  subscription?: {
    plan: 'free' | 'starter' | 'professional';
    validUntil?: Date;
    autoRenew: boolean;
  };
  stats?: {
    propertiesListed: number;
    propertiesSold: number;
    totalCommission: number;
    rating?: number;
    reviewCount: number;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    role: {
      type: String,
      enum: ['buyer', 'owner', 'agent', 'admin'],
      default: 'buyer'
    },
    profile: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
      },
      avatar: String,
      location: {
        city: String,
        state: String,
        pincode: String
      }
    },
    verification: {
      emailVerified: {
        type: Boolean,
        default: false
      },
      phoneVerified: {
        type: Boolean,
        default: false
      },
      emailOTP: String,
      emailOTPExpires: Date,
      kycStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional'],
        default: 'free'
      },
      validUntil: Date,
      autoRenew: {
        type: Boolean,
        default: false
      }
    },
    stats: {
      propertiesListed: {
        type: Number,
        default: 0
      },
      propertiesSold: {
        type: Number,
        default: 0
      },
      totalCommission: {
        type: Number,
        default: 0
      },
      rating: Number,
      reviewCount: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: Date
  },
  {
    timestamps: true
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'verification.emailVerified': 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
