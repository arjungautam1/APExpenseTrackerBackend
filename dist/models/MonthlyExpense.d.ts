import mongoose, { Document } from 'mongoose';
export interface IMonthlyExpense extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
    amount: number;
    dueDate: number;
    description: string;
    isActive: boolean;
    lastPaidDate?: Date;
    nextDueDate: Date;
    autoDeduct: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMonthlyExpense, {}, {}, {}, mongoose.Document<unknown, {}, IMonthlyExpense, {}, {}> & IMonthlyExpense & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=MonthlyExpense.d.ts.map