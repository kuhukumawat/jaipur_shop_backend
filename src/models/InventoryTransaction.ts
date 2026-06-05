import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction {
  product: mongoose.Types.ObjectId;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'order';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryTransactionDocument extends IInventoryTransaction, Document {}

const inventoryTransactionSchema = new Schema<IInventoryTransactionDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'order'],
      required: true,
    },
    quantity: { type: Number, required: true },
    stockBefore: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
    notes: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const InventoryTransaction = mongoose.model<IInventoryTransactionDocument>('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
