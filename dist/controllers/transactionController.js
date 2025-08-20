"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyTrends = exports.getExpenseBreakdown = exports.getTransactionStats = exports.deleteAllTransactions = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransaction = exports.getTransactions = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Category_1 = __importDefault(require("../models/Category"));
const Investment_1 = require("../models/Investment");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type;
        const categoryId = req.query.categoryId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const skip = (page - 1) * limit;
        // Build query
        const userId = req.user?.id || req.user?._id;
        const query = { userId };
        if (type && ['income', 'expense', 'transfer', 'investment'].includes(type)) {
            query.type = type;
        }
        if (categoryId && mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            query.categoryId = categoryId;
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }
        // Get transactions with category details
        const transactions = await Transaction_1.default.find(query)
            .populate('categoryId', 'name type icon color')
            .sort({ date: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip);
        const total = await Transaction_1.default.countDocuments(query);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get transactions'
        });
    }
};
exports.getTransactions = getTransactions;
// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction_1.default.findOne({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get transaction'
        });
    }
};
exports.getTransaction = getTransaction;
// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        console.log('Creating transaction with data:', req.body);
        console.log('User ID:', req.user?.id);
        const { amount, type, categoryId, description, date, location, tags } = req.body;
        console.log('Validating category:', categoryId);
        let category;
        // If categoryId is provided, validate it exists
        if (categoryId && categoryId.trim() !== '') {
            category = await Category_1.default.findOne({
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
        }
        else {
            // If no categoryId provided, find a default category for the transaction type
            // First try to find an "Other" category
            category = await Category_1.default.findOne({
                type: type,
                $or: [
                    { userId: req.user?.id },
                    { isDefault: true }
                ],
                name: { $regex: /other/i }
            });
            // If no "Other" category found, get the first available category of the correct type
            if (!category) {
                category = await Category_1.default.findOne({
                    type: type,
                    $or: [
                        { userId: req.user?.id },
                        { isDefault: true }
                    ]
                });
            }
            console.log('Using default category:', category);
            if (!category) {
                res.status(400).json({
                    success: false,
                    message: `No categories found for transaction type '${type}'. Please create a category first.`
                });
                return;
            }
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
            categoryId: category._id, // Use the found category ID
            description,
            date: date ? new Date(date) : new Date(),
            location,
            tags: tags || []
        };
        console.log('Creating transaction with data:', transactionData);
        const transaction = await Transaction_1.default.create(transactionData);
        // Populate category details
        await transaction.populate('categoryId', 'name type icon color');
        // Auto-create investment if transaction is from Investment category
        if (category.name === 'Investment' && type === 'investment') {
            try {
                const investmentData = {
                    userId: req.user?.id,
                    name: description || 'Investment from transaction',
                    type: 'other',
                    amountInvested: parseFloat(amount),
                    purchaseDate: date ? new Date(date) : new Date(),
                    platform: 'From Quick Add'
                };
                await Investment_1.Investment.create(investmentData);
                console.log('Auto-created investment for transaction:', transaction._id);
            }
            catch (investmentError) {
                console.error('Failed to auto-create investment:', investmentError);
                // Don't fail the transaction if investment creation fails
            }
        }
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    }
    catch (error) {
        console.error('Transaction creation error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create transaction'
        });
    }
};
exports.createTransaction = createTransaction;
// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const { amount, type, categoryId, description, date, location, tags } = req.body;
        // Find transaction
        let transaction = await Transaction_1.default.findOne({
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
            const category = await Category_1.default.findOne({
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
        transaction = await Transaction_1.default.findByIdAndUpdate(req.params.id, {
            amount: amount ? parseFloat(amount) : transaction.amount,
            type: type || transaction.type,
            categoryId: categoryId || transaction.categoryId,
            description: description || transaction.description,
            date: date ? new Date(date) : transaction.date,
            location: location !== undefined ? location : transaction.location,
            tags: tags !== undefined ? tags : transaction.tags
        }, { new: true, runValidators: true }).populate('categoryId', 'name type icon color');
        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: transaction
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update transaction'
        });
    }
};
exports.updateTransaction = updateTransaction;
// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction_1.default.findOne({
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
        await Transaction_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete transaction'
        });
    }
};
exports.deleteTransaction = deleteTransaction;
// @desc    Delete all transactions for user
// @route   DELETE /api/transactions
// @access  Private
const deleteAllTransactions = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        // Get count before deletion for response
        const count = await Transaction_1.default.countDocuments({ userId });
        if (count === 0) {
            res.status(404).json({
                success: false,
                message: 'No transactions found to delete'
            });
            return;
        }
        // Delete all transactions for the user
        await Transaction_1.default.deleteMany({ userId });
        res.json({
            success: true,
            message: `Successfully deleted ${count} transactions`,
            data: { deletedCount: count }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete all transactions'
        });
    }
};
exports.deleteAllTransactions = deleteAllTransactions;
// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        // Build date query
        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                dateQuery.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.date.$lte = end;
            }
        }
        // Get income and expense totals
        const stats = await Transaction_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
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
            }
            else if (stat._id === 'expense') {
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get transaction statistics'
        });
    }
};
exports.getTransactionStats = getTransactionStats;
// @desc    Get expense breakdown by category
// @route   GET /api/transactions/expense-breakdown
// @access  Private
const getExpenseBreakdown = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const limit = parseInt(req.query.limit) || 10;
        // Build date query
        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                dateQuery.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.date.$lte = end;
            }
        }
        // Get expense breakdown by category
        const expenseBreakdown = await Transaction_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
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
                $sort: { lastTransaction: -1 }
            },
            {
                $limit: limit
            }
        ]);
        // Get total expenses for percentage calculation  
        const totalExpenses = await Transaction_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
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
        // Get monthly trend for top 3 categories (show last 5 months regardless of date filter)
        const topCategories = breakdownWithPercentage.slice(0, 3);
        const monthlyTrends = await Promise.all(topCategories.map(async (category) => {
            const trend = await Transaction_1.default.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
                        type: 'expense',
                        categoryId: category.categoryId
                        // Note: Not using dateQuery here to show historical trends
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
                    $sort: { '_id.year': -1, '_id.month': -1 }
                },
                {
                    $limit: 5 // Last 5 months
                }
            ]);
            return {
                categoryId: category.categoryId,
                categoryName: category.categoryName,
                monthlyData: trend
            };
        }));
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
    }
    catch (error) {
        console.error('Expense breakdown error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get expense breakdown'
        });
    }
};
exports.getExpenseBreakdown = getExpenseBreakdown;
const getMonthlyTrends = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Build date query
        const dateQuery = {};
        if (startDate && endDate) {
            dateQuery.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        // Get monthly data for income, expenses, and investments
        const monthlyData = await Transaction_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
                    type: { $in: ['income', 'expense', 'investment'] },
                    ...dateQuery
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            }
        ]);
        // Process the data to create monthly data points
        const processedData = monthlyData.map(item => ({
            year: item._id.year,
            month: item._id.month,
            type: item._id.type,
            totalAmount: item.totalAmount,
            count: item.count,
            monthKey: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        }));
        // Group by month and type
        const monthlyTrends = processedData.reduce((acc, item) => {
            if (!acc[item.monthKey]) {
                acc[item.monthKey] = {
                    month: item.monthKey,
                    income: 0,
                    expenses: 0,
                    investments: 0
                };
            }
            if (item.type === 'income') {
                acc[item.monthKey].income = item.totalAmount;
            }
            else if (item.type === 'expense') {
                acc[item.monthKey].expenses = item.totalAmount;
            }
            else if (item.type === 'investment') {
                acc[item.monthKey].investments = item.totalAmount;
            }
            return acc;
        }, {});
        // Convert to array and sort (most recent first)
        const result = Object.values(monthlyTrends).sort((a, b) => {
            return b.month.localeCompare(a.month);
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Monthly trends error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get monthly trends'
        });
    }
};
exports.getMonthlyTrends = getMonthlyTrends;
//# sourceMappingURL=transactionController.js.map