import { Response } from 'express';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const budgets = await Budget.find({
      userId: req.userId,
      month,
      year,
    }).populate('categoryId', 'name icon type');

    // Calculate spent amount for each budget
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
    });

    const budgetData = budgets.map(budget => {
      const budgetCat = budget.categoryId as any;
      const spent = transactions
        .filter(t => t.categoryId?.toString() === budget.categoryId.toString())
        .reduce((sum, t) => sum + t.amount, 0);

      const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      let status = 'safe';
      if (usagePercent >= 100) status = 'exceeded';
      else if (usagePercent >= 90) status = 'critical';
      else if (usagePercent >= 70) status = 'warning';

      return {
        id: budget._id.toString(),
        categoryId: budget.categoryId.toString(),
        category: {
          id: budgetCat._id.toString(),
          name: budgetCat.name,
          icon: budgetCat.icon,
          type: budgetCat.type,
        },
        amount: budget.amount,
        spent,
        usagePercent,
        status,
        month: budget.month,
        year: budget.year,
      };
    });

    res.json(budgetData);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to get budgets' });
  }
};

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId, amount, month, year } = req.body;

    if (!categoryId || !amount || !month || !year) {
      res.status(400).json({ error: 'Category, amount, month, and year are required' });
      return;
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({
      userId: req.userId,
      categoryId,
      month,
      year,
    });

    if (existingBudget) {
      res.status(400).json({ error: 'Budget already exists for this category and month' });
      return;
    }

    const budget = new Budget({
      userId: req.userId,
      categoryId,
      amount,
      month,
      year,
    });

    await budget.save();
    await budget.populate('categoryId', 'name icon type');

    const budgetCat = budget.categoryId as any;

    res.status(201).json({
      id: budget._id.toString(),
      categoryId: budget.categoryId.toString(),
      category: {
        id: budgetCat._id.toString(),
        name: budgetCat.name,
        icon: budgetCat.icon,
        type: budgetCat.type,
      },
      amount: budget.amount,
      spent: 0,
      usagePercent: 0,
      status: 'safe',
      month: budget.month,
      year: budget.year,
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoryId, amount, month, year } = req.body;

    const budget = await Budget.findOne({ _id: id, userId: req.userId });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    if (categoryId !== undefined) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      budget.categoryId = categoryId;
    }
    if (amount !== undefined) budget.amount = amount;
    if (month !== undefined) budget.month = month;
    if (year !== undefined) budget.year = year;

    await budget.save();
    await budget.populate('categoryId', 'name icon type');

    // Recalculate spent amount
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      categoryId: budget.categoryId,
      date: { $gte: startDate, $lte: endDate },
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    let status = 'safe';
    if (usagePercent >= 100) status = 'exceeded';
    else if (usagePercent >= 90) status = 'critical';
    else if (usagePercent >= 70) status = 'warning';

    const budgetCat = budget.categoryId as any;

    res.json({
      id: budget._id.toString(),
      categoryId: budget.categoryId.toString(),
      category: {
        id: budgetCat._id.toString(),
        name: budgetCat.name,
        icon: budgetCat.icon,
        type: budgetCat.type,
      },
      amount: budget.amount,
      spent,
      usagePercent,
      status,
      month: budget.month,
      year: budget.year,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, userId: req.userId });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    await Budget.deleteOne({ _id: id });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};