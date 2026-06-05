import { Request, Response } from 'express';
import * as productService from '../services/productService';

export const createProduct = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const images = files.map((f) => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
  }));

  const data = { ...req.body, images };
  if (req.body.tags && typeof req.body.tags === 'string') {
    data.tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  const product = await productService.createProduct(data);
  res.status(201).json({ success: true, data: product, message: 'Product created' });
};

export const getProducts = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const isAdmin = req.user?.role === 'admin';
  const result = await productService.getProducts({
    search: search as string,
    page: page as string,
    limit: limit as string,
    isAdmin,
  });
  res.json({ success: true, data: result });
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const data = { ...req.body };
  if (req.body.tags && typeof req.body.tags === 'string') {
    data.tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  const files = (req.files as Express.Multer.File[]) || [];
  if (files && files.length > 0) {
    data.$push = {
      images: {
        $each: files.map((f) => ({ url: `/uploads/${f.filename}`, filename: f.filename })),
      },
    };
    delete data.images;
  }
  const product = await productService.updateProduct(req.params.id, data);
  res.json({ success: true, data: product, message: 'Product updated' });
};

export const deleteProduct = async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  const products = await productService.getLowStockProducts();
  res.json({ success: true, data: products });
};
