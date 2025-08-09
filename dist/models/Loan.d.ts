import mongoose, { Document } from 'mongoose';
export interface ILoan extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    principalAmount: number;
    currentBalance: number;
    interestRate: number;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'defaulted';
    nextEmiDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILoan, {}, {}, {}, mongoose.Document<unknown, {}, ILoan, {}, {}> & ILoan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Loan.d.ts.map