import mongoose, { Types } from 'mongoose';
import Product from '../models/Product';
import InventoryTransaction from '../models/InventoryTransaction';

export const getInventoryOverview = async () => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort({ stock: 1 });

  return products.map((p: any) => ({
    _id: p._id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    unit: p.unit,
    price: p.price,
    costPrice: p.costPrice,
    images: p.images,
    isLowStock: p.stock <= p.lowStockThreshold,
    stockValue: p.stock * p.costPrice,
  }));
};

export const getLowStockProducts = async () => {
  return Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  }).populate('category', 'name');
};

export const getTransactions = async (productId: string | null = null, page: number | string = 1, limit = 20) => {
  const query: any = {};
  if (productId) query.product = productId;

  const pNum = typeof page === 'string' ? parseInt(page) : page;
  const skip = (pNum - 1) * limit;

  const [transactions, total] = await Promise.all([
    InventoryTransaction.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InventoryTransaction.countDocuments(query),
  ]);

  return { transactions, total, page: pNum, pages: Math.ceil(total / limit) };
};

interface AdjustStockParams {
  productId: string;
  quantity: number;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'order';
  notes?: string;
  performedBy: string | Types.ObjectId;
}

export const adjustStock = async ({ productId, quantity, type, notes, performedBy }: AdjustStockParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const stockBefore = product.stock;
    const adjustedQty = type === 'stock_out' ? -Math.abs(quantity) : Math.abs(quantity);
    const stockAfter = stockBefore + adjustedQty;

    if (stockAfter < 0) {
      throw Object.assign(new Error('Stock cannot go below 0'), { statusCode: 400 });
    }

    await Product.findByIdAndUpdate(productId, { stock: stockAfter }, { session });

    const [transaction] = await InventoryTransaction.create(
      [{ product: productId, type, quantity: adjustedQty, stockBefore, stockAfter, notes, performedBy, referenceType: 'Manual' }],
      { session }
    );

    await session.commitTransaction();

    return { product: await Product.findById(productId).populate('category', 'name'), transaction };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
