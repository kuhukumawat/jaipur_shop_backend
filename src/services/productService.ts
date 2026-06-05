import Product, { IProduct } from '../models/Product';

export const createProduct = async (data: Partial<IProduct>) => {
  const product = await Product.create(data);
  return Product.findById(product._id).populate('category', 'name slug');
};

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number | string;
  limit?: number | string;
  isAdmin?: boolean;
}

export const getProducts = async ({
  search,
  category,
  page = 1,
  limit = 12,
  isAdmin = false,
}: GetProductsParams = {}) => {
  const query: any = {};
  if (!isAdmin) query.isActive = true;
  if (category) query.category = category;
  if (search) {
    const safe = escapeRegex(search);
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { sku: { $regex: safe, $options: 'i' } },
    ];
  }

  const pNum = typeof page === 'string' ? parseInt(page) : page;
  const lNum = typeof limit === 'string' ? parseInt(limit) : limit;

  const skip = (pNum - 1) * lNum;
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lNum),
    Product.countDocuments(query),
  ]);

  return {
    products,
    total,
    page: pNum,
    pages: Math.ceil(total / lNum),
  };
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }
  return product;
};

export const updateProduct = async (id: string, data: Partial<IProduct>) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }
  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }
  return product;
};

export const getLowStockProducts = async () => {
  return Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  }).populate('category', 'name slug');
};
