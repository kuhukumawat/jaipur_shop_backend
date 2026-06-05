import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
export default Category;
