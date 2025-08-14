import mongoose, { Document, Schema } from 'mongoose';

export interface ITransfer extends Document {
  userId: mongoose.Types.ObjectId;
  recipientName: string;
  amount: number;
  purpose: string;
  destinationCountry: string;
  transferMethod: string; // e.g., bank, wallet, wire
  fees: number;
  exchangeRate?: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: mongoose.Types.ObjectId; // optional linkage to a transaction
  createdAt: Date;
  updatedAt: Date;
}

const TransferSchema = new Schema<ITransfer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientName: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0 },
    purpose: { type: String, required: true, trim: true, maxlength: 200 },
    destinationCountry: { type: String, required: true, trim: true, maxlength: 2 },
    transferMethod: { type: String, required: true, trim: true, maxlength: 50 },
    fees: { type: Number, required: true, min: 0 },
    exchangeRate: { type: Number, required: false, min: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

TransferSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITransfer>('Transfer', TransferSchema);










