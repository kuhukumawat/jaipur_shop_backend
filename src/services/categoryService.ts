import Category from '../models/Category';

export const getAllCategories = async () => {
  return Category.find().sort({ title: 1 });
};

export const createCategory = async (title: string) => {
  return Category.create({ title });
};

export const updateCategory = async (id: string, title: string) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { title },
    { new: true, runValidators: true }
  );
  if (!category) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  }
  return category;
};

export const deleteCategory = async (id: string) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  }
  return category;
};
