import mongoose, { Document } from 'mongoose';
export interface ITransfer extends Document {
    userId: mongoose.Types.ObjectId;
    recipientName: string;
    amount: number;
    purpose: string;
    destinationCountry: string;
    transferMethod: string;
    fees: number;
    exchangeRate?: number;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITransfer, {}, {}, {}, mongoose.Document<unknown, {}, ITransfer, {}, {}> & ITransfer & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Transfer.d.ts.map