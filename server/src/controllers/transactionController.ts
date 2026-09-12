import { Response } from 'express';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { serializeTransaction } from '../utils/serializers';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    // Client sends `pageSize`; keep `limit` as a fallback for direct API callers.
    const limit =
      parseInt(req.query.pageSize as string) || parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { userId: req.userId };

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.search) {
      filter.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { merchant: { $regex: req.query.search, $options: 'i' } },
        { notes: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate as string);
      }
    }

    // Sorting
    const sort: any = {};
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = sortOrder;
    } else {
      sort.date = -1;
    }

    const transactions = await Transaction.find(filter)
      .populate('categoryId', 'name icon type')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    // Client expects `Paginated<Transaction>`: { items, total, page, pageSize, totalPages }.
    res.json({
      items: transactions.map(serializeTransaction),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

export const getTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('categoryId', 'name icon type');

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(serializeTransaction(transaction));
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type,
      amount,
      categoryId,
      description,
      merchant,
      date,
      paymentMethod,
      tags,
      notes,
    } = req.body;

    if (!type || !amount || !categoryId || !description || !paymentMethod) {
      res.status(400).json({
        error: 'Type, amount, category, description, and payment method are required',
      });
      return;
    }

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      categoryId,
      description,
      merchant,
      date: date || new Date(),
      paymentMethod,
      tags: tags || [],
      notes,
    });

    await transaction.save();
    await transaction.populate('categoryId', 'name icon type');

    res.status(201).json(serializeTransaction(transaction));
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type,
      amount,
      categoryId,
      description,
      merchant,
      date,
      paymentMethod,
      tags,
      notes,
    } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (categoryId !== undefined) transaction.categoryId = categoryId;
    if (description !== undefined) transaction.description = description;
    if (merchant !== undefined) transaction.merchant = merchant;
    if (date !== undefined) transaction.date = new Date(date);
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (tags !== undefined) transaction.tags = tags;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();
    await transaction.populate('categoryId', 'name icon type');

    res.json(serializeTransaction(transaction));
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    await Transaction.deleteOne({ _id: req.params.id });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
