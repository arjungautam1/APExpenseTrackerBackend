import mongoose, { Document } from 'mongoose';
export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    categoryId: mongoose.Types.ObjectId;
    description?: string;
    date: Date;
    location?: string;
    tags?: string[];
    receipt?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}, {}> & ITransaction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Transaction.d.ts.map