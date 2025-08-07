import Category from '../models/Category.js';

export const createCategory = async (categoryName) => {
  const newCategory = new Category({ categoryName });
  return await newCategory.save();
};

export const getAllCategories = async () => {
  return await Category.find({});
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const updateCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
