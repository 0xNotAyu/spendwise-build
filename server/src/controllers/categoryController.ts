import { Response } from 'express';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({
      $or: [
        { userId: req.userId },
        { isDefault: true },
      ],
    }).sort({ isDefault: -1, name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, icon } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Name and type are required' });
      return;
    }

    const category = new Category({
      name,
      type,
      icon: icon || '📦',
      userId: req.userId,
      isDefault: false,
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    const category = await Category.findOne({ _id: id, userId: req.userId });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.isDefault) {
      res.status(403).json({ error: 'Cannot modify default categories' });
      return;
    }

    if (name !== undefined) category.name = name;
    if (icon !== undefined) category.icon = icon;

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId: req.userId });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.isDefault) {
      res.status(403).json({ error: 'Cannot delete default categories' });
      return;
    }

    await Category.deleteOne({ _id: id });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const seedDefaultCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income', icon: '💰', isDefault: true },
      { name: 'Freelance', type: 'income', icon: '💼', isDefault: true },
      { name: 'Investments', type: 'income', icon: '📈', isDefault: true },
      { name: 'Gifts', type: 'income', icon: '🎁', isDefault: true },
      { name: 'Other Income', type: 'income', icon: '💵', isDefault: true },
      // Expense categories
      { name: 'Food', type: 'expense', icon: '🍔', isDefault: true },
      { name: 'Transport', type: 'expense', icon: '🚗', isDefault: true },
      { name: 'Shopping', type: 'expense', icon: '🛍️', isDefault: true },
      { name: 'Entertainment', type: 'expense', icon: '🎬', isDefault: true },
      { name: 'Bills', type: 'expense', icon: '📄', isDefault: true },
      { name: 'Health', type: 'expense', icon: '🏥', isDefault: true },
      { name: 'Education', type: 'expense', icon: '📚', isDefault: true },
      { name: 'Rent', type: 'expense', icon: '🏠', isDefault: true },
      { name: 'Utilities', type: 'expense', icon: '💡', isDefault: true },
      { name: 'Other', type: 'expense', icon: '📦', isDefault: true },
    ];

    const existingCount = await Category.countDocuments({ isDefault: true });
    
    if (existingCount > 0) {
      res.json({ message: 'Default categories already exist' });
      return;
    }

    await Category.insertMany(defaultCategories);

    res.json({ message: 'Default categories seeded successfully' });
  } catch (error) {
    console.error('Seed categories error:', error);
    res.status(500).json({ error: 'Failed to seed default categories' });
  }
};
