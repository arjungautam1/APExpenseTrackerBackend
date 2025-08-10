import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
  amountInvested: number;
  currentValue?: number;
  purchaseDate: Date;
  quantity?: number;
  symbol?: string;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Investment name is required'],
    trim: true,
    maxlength: [100, 'Investment name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Investment type is required'],
    enum: {
      values: ['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'],
      message: '{VALUE} is not a valid investment type'
    }
  },
  amountInvested: {
    type: Number,
    required: [true, 'Amount invested is required'],
    min: [0, 'Amount invested must be positive']
  },
  currentValue: {
    type: Number,
    min: [0, 'Current value must be positive']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  quantity: {
    type: Number,
    min: [0, 'Quantity must be positive']
  },
  symbol: {
    type: String,
    trim: true,
    maxlength: [10, 'Symbol cannot exceed 10 characters']
  },
  platform: {
    type: String,
    trim: true,
    maxlength: [50, 'Platform name cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
investmentSchema.index({ userId: 1, createdAt: -1 });
investmentSchema.index({ userId: 1, type: 1 });

// Virtual for gain/loss calculation
investmentSchema.virtual('gainLoss').get(function(this: IInvestment) {
  if (!this.currentValue) return 0;
  return this.currentValue - this.amountInvested;
});

investmentSchema.virtual('gainLossPercentage').get(function(this: IInvestment) {
  if (!this.currentValue || this.amountInvested === 0) return 0;
  return ((this.currentValue - this.amountInvested) / this.amountInvested) * 100;
});

// Ensure virtual fields are serialized
investmentSchema.set('toJSON', { virtuals: true });

export const Investment = mongoose.model<IInvestment>('Investment', investmentSchema);