import mongoose, { Document } from 'mongoose';
export interface IInvestment extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    type: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
    amountInvested: number;
    currentValue: number;
    purchaseDate: Date;
    quantity?: number;
    symbol?: string;
    platform?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Investment: mongoose.Model<IInvestment, {}, {}, {}, mongoose.Document<unknown, {}, IInvestment, {}, {}> & IInvestment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Investment.d.ts.map