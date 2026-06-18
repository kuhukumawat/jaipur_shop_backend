import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory {
  title: string;
}

export interface ICategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    title: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
export default Category;
