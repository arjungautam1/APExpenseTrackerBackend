"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseBreakdown = exports.getTransactionStats = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransaction = exports.getTransactions = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Category_1 = __importDefault(require("../models/Category"));
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
        const query = { userId: req.user?.id };
        if (type && ['income', 'expense', 'transfer'].includes(type)) {
            query.type = type;
        }
        if (categoryId && mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            query.categoryId = categoryId;
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
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
        // Validate category exists and belongs to user or is default
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
        if (category.type !== type) {
            res.status(400).json({
                success: false,
                message: `Transaction type '${type}' does not match category type '${category.type}'`
            });
            return;
        }
        const transaction = await Transaction_1.default.create({
            userId: req.user?.id,
            amount: parseFloat(amount),
            type,
            categoryId,
            description,
            date: date ? new Date(date) : new Date(),
            location,
            tags: tags || []
        });
        // Populate category details
        await transaction.populate('categoryId', 'name type icon color');
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    }
    catch (error) {
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
            if (startDate)
                dateQuery.date.$gte = new Date(startDate);
            if (endDate)
                dateQuery.date.$lte = new Date(endDate);
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
            if (startDate)
                dateQuery.date.$gte = new Date(startDate);
            if (endDate)
                dateQuery.date.$lte = new Date(endDate);
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
                $unwind: '$category'
            },
            {
                $group: {
                    _id: '$categoryId',
                    categoryName: { $first: '$category.name' },
                    categoryIcon: { $first: '$category.icon' },
                    categoryColor: { $first: '$category.color' },
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
        // Get monthly trend for top 3 categories
        const topCategories = breakdownWithPercentage.slice(0, 3);
        const monthlyTrends = await Promise.all(topCategories.map(async (category) => {
            const trend = await Transaction_1.default.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(req.user?.id),
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
//# sourceMappingURL=transactionController.js.map