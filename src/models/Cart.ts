import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {}

const cartSchema = new Schema<ICartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICartDocument>('Cart', cartSchema);
export default Cart;
