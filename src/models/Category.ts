import mongoose, { Document, Schema } from 'mongoose';

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

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: ['income', 'expense', 'investment']
  },
  icon: {
    type: String,
    default: 'tag'
  },
  color: {
    type: String,
    default: '#6B7280'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: ICategory) {
      return !this.isDefault;
    }
  },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
CategorySchema.index({ userId: 1, type: 1 });
CategorySchema.index({ isDefault: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);