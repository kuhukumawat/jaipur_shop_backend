import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder {
  invoiceNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cod' | 'online' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const orderSchema = new Schema<IOrderDocument>(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        sku: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online', 'upi'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
export default Order;
