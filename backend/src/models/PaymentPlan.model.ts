import mongoose, { Document, Schema } from 'mongoose';

// PaymentPlan model for EMI, milestone-based, and custom payment schedules

export interface IPaymentPlan extends Document {
  project: mongoose.Types.ObjectId;
  tower?: mongoose.Types.ObjectId;
  builder: mongoose.Types.ObjectId;
  
  // Basic Info
  name: string;
  description: string;
  planType: 'construction-linked' | 'time-linked' | 'down-payment' | 'flexi' | 'subvention' | 'custom';
  
  // Booking Amount
  bookingAmount: {
    type: 'percentage' | 'fixed';
    value: number;
    dueWithin: number; // Days from booking
  };
  
  // Milestones/Installments
  milestones: {
    name: string;
    description?: string;
    
    // When is this due
    dueType: 'on-booking' | 'days-from-booking' | 'construction-stage' | 'fixed-date' | 'on-possession';
    dueValue?: number | string | Date; // Days, stage name, or date
    
    // Amount
    amountType: 'percentage' | 'fixed';
    amountValue: number;
    
    // For construction-linked
    constructionStage?: string; // e.g., "Foundation", "Plinth", "1st Slab"
    
    order: number;
  }[];
  
  // Subvention Scheme (Builder pays EMI until possession)
  subvention?: {
    enabled: boolean;
    bankPartners: string[];
    interestRate: number;
    tenure: number; // Months
    builderContribution: number; // Percentage of EMI builder pays
    validUntilPossession: boolean;
  };
  
  // Down Payment Scheme
  downPayment?: {
    enabled: boolean;
    percentage: number; // e.g., 10%, 20%
    discount: {
      type: 'percentage' | 'fixed' | 'per-sqft';
      value: number;
    };
  };
  
  // Flexi Payment
  flexiPayment?: {
    enabled: boolean;
    minDownPayment: number; // Percentage
    maxTenure: number; // Months
    interestFree: boolean;
    interestRate?: number;
  };
  
  // Benefits/Incentives for this plan
  benefits: {
    description: string;
    value?: number;
  }[];
  
  // Eligibility
  eligibility: {
    unitTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    customerTypes?: string[];
  };
  
  // Display
  display: {
    isRecommended: boolean;
    highlightText?: string;
    priority: number;
  };
  
  // Status
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PaymentPlanSchema = new Schema<IPaymentPlan>({
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
    required: [true, 'Payment plan name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  planType: {
    type: String,
    enum: ['construction-linked', 'time-linked', 'down-payment', 'flexi', 'subvention', 'custom'],
    required: true
  },
  
  bookingAmount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    dueWithin: {
      type: Number,
      default: 7 // 7 days
    }
  },
  
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    dueType: {
      type: String,
      enum: ['on-booking', 'days-from-booking', 'construction-stage', 'fixed-date', 'on-possession'],
      required: true
    },
    dueValue: Schema.Types.Mixed,
    amountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    amountValue: {
      type: Number,
      required: true,
      min: 0
    },
    constructionStage: String,
    order: {
      type: Number,
      required: true
    }
  }],
  
  subvention: {
    enabled: { type: Boolean, default: false },
    bankPartners: [String],
    interestRate: Number,
    tenure: Number,
    builderContribution: Number,
    validUntilPossession: { type: Boolean, default: true }
  },
  
  downPayment: {
    enabled: { type: Boolean, default: false },
    percentage: Number,
    discount: {
      type: { type: String, enum: ['percentage', 'fixed', 'per-sqft'] },
      value: Number
    }
  },
  
  flexiPayment: {
    enabled: { type: Boolean, default: false },
    minDownPayment: Number,
    maxTenure: Number,
    interestFree: { type: Boolean, default: false },
    interestRate: Number
  },
  
  benefits: [{
    description: { type: String, required: true },
    value: Number
  }],
  
  eligibility: {
    unitTypes: [String],
    minPrice: Number,
    maxPrice: Number,
    customerTypes: [String]
  },
  
  display: {
    isRecommended: { type: Boolean, default: false },
    highlightText: String,
    priority: { type: Number, default: 0 }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date
}, {
  timestamps: true
});

// Indexes
PaymentPlanSchema.index({ project: 1, isActive: 1 });
PaymentPlanSchema.index({ planType: 1 });
PaymentPlanSchema.index({ 'display.priority': -1 });

// Virtual: Total percentage (should equal 100%)
PaymentPlanSchema.virtual('totalPercentage').get(function() {
  let total = 0;
  if (this.bookingAmount.type === 'percentage') {
    total += this.bookingAmount.value;
  }
  this.milestones.forEach(m => {
    if (m.amountType === 'percentage') {
      total += m.amountValue;
    }
  });
  return total;
});

// Method: Generate payment schedule for a unit
PaymentPlanSchema.methods.generateSchedule = function(
  unitPrice: number,
  bookingDate: Date,
  possessionDate?: Date
) {
  const schedule: {
    name: string;
    description?: string;
    dueDate: Date | null;
    amount: number;
    percentage: number;
    status: 'pending' | 'due' | 'paid';
    constructionStage?: string;
  }[] = [];
  
  // Booking Amount
  const bookingAmount = this.bookingAmount.type === 'percentage'
    ? (unitPrice * this.bookingAmount.value / 100)
    : this.bookingAmount.value;
  
  const bookingDueDate = new Date(bookingDate);
  bookingDueDate.setDate(bookingDueDate.getDate() + this.bookingAmount.dueWithin);
  
  schedule.push({
    name: 'Booking Amount',
    dueDate: bookingDueDate,
    amount: Math.round(bookingAmount),
    percentage: this.bookingAmount.type === 'percentage' ? this.bookingAmount.value : (bookingAmount / unitPrice) * 100,
    status: 'due'
  });
  
  // Milestones
  const sortedMilestones = [...this.milestones].sort((a, b) => a.order - b.order);
  
  for (const milestone of sortedMilestones) {
    const amount = milestone.amountType === 'percentage'
      ? (unitPrice * milestone.amountValue / 100)
      : milestone.amountValue;
    
    let dueDate: Date | null = null;
    
    switch (milestone.dueType) {
      case 'on-booking':
        dueDate = new Date(bookingDate);
        break;
      case 'days-from-booking':
        dueDate = new Date(bookingDate);
        dueDate.setDate(dueDate.getDate() + (milestone.dueValue as number));
        break;
      case 'fixed-date':
        dueDate = new Date(milestone.dueValue as Date);
        break;
      case 'on-possession':
        dueDate = possessionDate ? new Date(possessionDate) : null;
        break;
      case 'construction-stage':
        // Date will be determined when construction reaches this stage
        dueDate = null;
        break;
    }
    
    schedule.push({
      name: milestone.name,
      description: milestone.description,
      dueDate,
      amount: Math.round(amount),
      percentage: milestone.amountType === 'percentage' ? milestone.amountValue : (amount / unitPrice) * 100,
      status: 'pending',
      constructionStage: milestone.constructionStage
    });
  }
  
  return {
    schedule,
    totalAmount: schedule.reduce((sum, s) => sum + s.amount, 0),
    milestoneCount: schedule.length
  };
};

// Method: Calculate EMI for subvention/flexi plans
PaymentPlanSchema.methods.calculateEMI = function(
  loanAmount: number,
  tenure?: number,
  interestRate?: number
) {
  const rate = interestRate || this.subvention?.interestRate || this.flexiPayment?.interestRate || 8.5;
  const months = tenure || this.subvention?.tenure || this.flexiPayment?.maxTenure || 240;
  
  const monthlyRate = rate / 12 / 100;
  const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(emi * months),
    totalInterest: Math.round((emi * months) - loanAmount),
    tenure: months,
    interestRate: rate
  };
};

// Ensure virtuals are included in JSON
PaymentPlanSchema.set('toJSON', { virtuals: true });
PaymentPlanSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPaymentPlan>('PaymentPlan', PaymentPlanSchema);
