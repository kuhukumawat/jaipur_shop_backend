import mongoose, { Document, Schema } from 'mongoose';

export interface IProductImage {
  url: string;
  filename: string;
}

export interface IProduct {
  name: string;
  description?: string;
  sku: string;

  price: number;
  costPrice: number;
  images: IProductImage[];
  stock: number;
  lowStockThreshold: number;
  unit: string;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },

    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    unit: { type: String, default: 'pcs' },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model<IProductDocument>('Product', productSchema);
export default Product;
