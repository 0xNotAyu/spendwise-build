import { Response } from 'express';
import Transaction from '../models/Transaction';
import Budget from '../models/Budget';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get transactions for the month
    const transactions = await Transaction.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('categoryId', 'name icon type');

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savings = Math.max(0, balance);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId: req.userId })
      .populate('categoryId', 'name icon type')
      .sort({ date: -1 })
      .limit(5);

    const recentTxData = recentTransactions.map(t => {
      const cat = t.categoryId as any;
      return {
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        description: t.description,
        merchant: t.merchant,
        date: t.date,
        paymentMethod: t.paymentMethod,
        category: cat ? {
          id: cat._id.toString(),
          name: cat.name,
          icon: cat.icon,
          type: cat.type,
        } : null,
      };
    });

    // Calculate spending trend (daily)
    const spendingTrend = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
      
      const dayExpenses = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= dayStart && tDate <= dayEnd;
      });
      
      const dayTotal = dayExpenses.reduce((sum, t) => sum + t.amount, 0);
      spendingTrend.push({
        date: dayStart.toISOString(),
        amount: dayTotal,
      });
    }

    // Category breakdown
    const categoryBreakdown: any[] = [];
    const categoryMap = new Map();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catId = t.categoryId?._id?.toString() || 'uncategorized';
        const cat = t.categoryId as any;
        const catName = cat?.name || 'Uncategorized';
        const catIcon = cat?.icon || '📦';
        
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, { categoryId: catId, categoryName: catName, icon: catIcon, amount: 0 });
        }
        categoryMap.get(catId).amount += t.amount;
      });

    const totalExpenses = expenses || 1; // Avoid division by zero
    categoryMap.forEach((value) => {
      categoryBreakdown.push({
        categoryId: value.categoryId,
        categoryName: value.categoryName,
        amount: value.amount,
        percent: (value.amount / totalExpenses) * 100,
      });
    });

    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    // Budget progress
    const budgets = await Budget.find({
      userId: req.userId,
      month,
      year,
    }).populate('categoryId', 'name icon type');

    const budgetProgress = budgets.map(budget => {
      const budgetCat = budget.categoryId as any;
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId?.toString() === budget.categoryId.toString())
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
      };
    });

    res.json({
      balance,
      income,
      expenses,
      savings,
      savingsRate,
      recentTransactions: recentTxData,
      spendingTrend,
      categoryBreakdown,
      budgetProgress,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Get transactions for the period
    const transactions = await Transaction.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).populate('categoryId', 'name icon type');

    // Monthly spending data
    const monthlyData = new Map();
    
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.set(monthKey, {
        month: monthDate.toLocaleString('default', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    const monthlySpending = Array.from(monthlyData.values()).reverse();

    // Category breakdown for the entire period
    const categoryMap = new Map();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.categoryId as any;
        const catName = cat?.name || 'Uncategorized';
        if (!categoryMap.has(catName)) {
          categoryMap.set(catName, { categoryName: catName, amount: 0 });
        }
        categoryMap.get(catName).amount += t.amount;
      });

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 1;

    const categoryBreakdown: any[] = Array.from(categoryMap.values())
      .map(value => ({
        categoryName: value.categoryName,
        amount: value.amount,
        percent: (value.amount / totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Savings rate by month
    const savingsRate = monthlySpending.map(data => ({
      month: data.month,
      rate: data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0,
    }));

    res.json({
      monthlySpending,
      categoryBreakdown,
      savingsRate,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics data' });
  }
};