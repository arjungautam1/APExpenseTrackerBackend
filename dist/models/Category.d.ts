import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    type: 'income' | 'expense' | 'investment';
    icon: string;
    color: string;
    userId?: mongoose.Types.ObjectId;
    parentCategoryId?: mongoose.Types.ObjectId;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Category.d.ts.map