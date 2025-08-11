import mongoose, { Document, Schema } from 'mongoose';

export interface IMonthlyExpense extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
  amount: number;
  dueDate: number; // Day of month (1-31)
  description: string;
  isActive: boolean;
  lastPaidDate?: Date;
  nextDueDate: Date;
  autoDeduct: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const monthlyExpenseSchema = new Schema<IMonthlyExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['home', 'mobile', 'internet', 'gym', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastPaidDate: {
    type: Date
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  autoDeduct: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
}, {
  timestamps: true
});

// Index for efficient queries
monthlyExpenseSchema.index({ userId: 1, category: 1 });
monthlyExpenseSchema.index({ userId: 1, isActive: 1 });
monthlyExpenseSchema.index({ userId: 1, nextDueDate: 1 });

export default mongoose.model<IMonthlyExpense>('MonthlyExpense', monthlyExpenseSchema);
