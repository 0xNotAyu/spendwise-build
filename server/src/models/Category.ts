import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  userId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Category type is required'],
    },
    icon: {
      type: String,
      default: '📦',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
