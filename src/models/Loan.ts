import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number; // annual in %
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'defaulted';
  nextEmiDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    principalAmount: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
    nextEmiDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>('Loan', LoanSchema);


