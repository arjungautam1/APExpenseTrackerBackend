import { Request, Response } from 'express';
import Transaction, { ITransaction } from '../models/Transaction';
import Category from '../models/Category';
import { Investment } from '../models/Investment';
import mongoose from 'mongoose';

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const categoryId = req.query.categoryId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: req.user?.id };

    if (type && ['income', 'expense', 'transfer', 'investment'].includes(type)) {
      query.type = type;
    }

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = categoryId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get transactions with category details
    const transactions = await Transaction.find(query)
      .populate('categoryId', 'name type icon color')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get transactions'
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?.id
    }).populate('categoryId', 'name type icon color');

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get transaction'
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating transaction with data:', req.body);
    console.log('User ID:', req.user?.id);
    const { amount, type, categoryId, description, date, location, tags } = req.body;

    console.log('Validating category:', categoryId);

    // Validate category exists and belongs to user or is default
    const category = await Category.findOne({
      _id: categoryId,
      $or: [
        { userId: req.user?.id },
        { isDefault: true }
      ]
    });

    console.log('Found category:', category);

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
      return;
    }

    // Validate transaction type matches category type
    if (category.type !== type) {
      console.log('Type mismatch:', { transactionType: type, categoryType: category.type });
      res.status(400).json({
        success: false,
        message: `Transaction type '${type}' does not match category type '${category.type}'`
      });
      return;
    }

    const transactionData = {
      userId: req.user?.id,
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date: date ? new Date(date) : new Date(),
      location,
      tags: tags || []
    };

    console.log('Creating transaction with data:', transactionData);

    const transaction = await Transaction.create(transactionData);

    // Populate category details
    await transaction.populate('categoryId', 'name type icon color');

    // Auto-create investment if transaction is from Investment category
    if (category.name === 'Investment' && type === 'investment') {
      try {
        const investmentData = {
          userId: req.user?.id,
          name: description || 'Investment from transaction',
          type: 'other' as const,
          amountInvested: parseFloat(amount),
          purchaseDate: date ? new Date(date) : new Date(),
          platform: 'From Quick Add'
        };

        await Investment.create(investmentData);
        console.log('Auto-created investment for transaction:', transaction._id);
      } catch (investmentError) {
        console.error('Failed to auto-create investment:', investmentError);
        // Don't fail the transaction if investment creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create transaction'
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type, categoryId, description, date, location, tags } = req.body;

    // Find transaction
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    // If categoryId is being updated, validate it
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        $or: [
          { userId: req.user?.id },
          { isDefault: true }
        ]
      });

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
        return;
      }

      // Validate transaction type matches category type
      const transactionType = type || transaction.type;
      if (category.type !== transactionType) {
        res.status(400).json({
          success: false,
          message: `Transaction type '${transactionType}' does not match category type '${category.type}'`
        });
        return;
      }
    }

    // Update transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount: amount ? parseFloat(amount) : transaction.amount,
        type: type || transaction.type,
        categoryId: categoryId || transaction.categoryId,
        description: description || transaction.description,
        date: date ? new Date(date) : transaction.date,
        location: location !== undefined ? location : transaction.location,
        tags: tags !== undefined ? tags : transaction.tags
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name type icon color');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update transaction'
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete transaction'
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build date query
    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    // Get income and expense totals
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user?.id),
          ...dateQuery
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'income') {
        formattedStats.totalIncome = stat.total;
        formattedStats.incomeCount = stat.count;
      } else if (stat._id === 'expense') {
        formattedStats.totalExpenses = stat.total;
        formattedStats.expenseCount = stat.count;
      }
    });

    formattedStats.totalSavings = formattedStats.totalIncome - formattedStats.totalExpenses;
    formattedStats.transactionCount = formattedStats.incomeCount + formattedStats.expenseCount;

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get transaction statistics'
    });
  }
};

// @desc    Get expense breakdown by category
// @route   GET /api/transactions/expense-breakdown
// @access  Private
export const getExpenseBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const limit = parseInt(req.query.limit as string) || 10;

    // Build date query
    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    // Get expense breakdown by category
    const expenseBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user?.id),
          type: 'expense',
          ...dateQuery
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$categoryId', 'unknown'] },
          categoryName: { $first: { $ifNull: ['$category.name', 'Other Expenses'] } },
          categoryIcon: { $first: { $ifNull: ['$category.icon', 'more-horizontal'] } },
          categoryColor: { $first: { $ifNull: ['$category.color', '#6B7280'] } },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          lastTransaction: { $max: '$date' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Get total expenses for percentage calculation
    const totalExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user?.id),
          type: 'expense',
          ...dateQuery
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenseAmount = totalExpenses[0]?.total || 0;

    // Add percentage to each category
    const breakdownWithPercentage = expenseBreakdown.map(item => ({
      categoryId: item._id,
      categoryName: item.categoryName,
      categoryIcon: item.categoryIcon,
      categoryColor: item.categoryColor,
      totalAmount: item.totalAmount,
      transactionCount: item.transactionCount,
      avgAmount: item.avgAmount,
      lastTransaction: item.lastTransaction,
      percentage: totalExpenseAmount > 0 ? (item.totalAmount / totalExpenseAmount) * 100 : 0
    }));

    // Get monthly trend for top 3 categories
    const topCategories = breakdownWithPercentage.slice(0, 3);
    const monthlyTrends = await Promise.all(
      topCategories.map(async (category) => {
        const trend = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user?.id),
              type: 'expense',
              categoryId: category.categoryId,
              ...dateQuery
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' }
              },
              amount: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }
          },
          {
            $limit: 6 // Last 6 months
          }
        ]);

        return {
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          monthlyData: trend
        };
      })
    );

    res.json({
      success: true,
      data: {
        breakdown: breakdownWithPercentage,
        totalExpenses: totalExpenseAmount,
        monthlyTrends,
        summary: {
          totalCategories: expenseBreakdown.length,
          avgExpensePerCategory: totalExpenseAmount / (expenseBreakdown.length || 1),
          topCategory: breakdownWithPercentage[0] || null
        }
      }
    });
  } catch (error: any) {
    console.error('Expense breakdown error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get expense breakdown'
    });
  }
};