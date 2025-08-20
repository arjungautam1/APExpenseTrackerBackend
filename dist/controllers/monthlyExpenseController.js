"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsUnpaid = exports.markAsPaid = exports.getMonthlyExpenseStats = exports.getMonthlyExpensesSummary = exports.processMonthlyExpensePayment = exports.deleteMonthlyExpense = exports.updateMonthlyExpense = exports.createMonthlyExpense = exports.getMonthlyExpensesByCategory = exports.getMonthlyExpenses = void 0;
const MonthlyExpense_1 = __importDefault(require("../models/MonthlyExpense"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Category_1 = __importDefault(require("../models/Category"));
const mockDatabase_1 = require("../config/mockDatabase");
// Get all monthly expenses for a user
const getMonthlyExpenses = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Always use mock data for now to test
        const userExpenses = mockDatabase_1.mockMonthlyExpenses.filter(expense => expense.userId === userId);
        res.json({
            success: true,
            data: userExpenses,
            message: 'Monthly expenses retrieved successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMonthlyExpenses = getMonthlyExpenses;
// Get monthly expenses by category
const getMonthlyExpensesByCategory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { category } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const expenses = await MonthlyExpense_1.default.find({
            userId,
            category,
            isActive: true
        }).sort({ name: 1 });
        res.json({
            success: true,
            data: expenses,
            message: 'Monthly expenses by category retrieved successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMonthlyExpensesByCategory = getMonthlyExpensesByCategory;
// Create a new monthly expense
const createMonthlyExpense = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { name, category, amount, dueDate, description, autoDeduct, tags } = req.body;
        // Calculate next due date
        const today = new Date();
        let nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDate);
        // If due date has passed this month, set to next month
        if (nextDueDate < today) {
            nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDate);
        }
        const monthlyExpense = await MonthlyExpense_1.default.create({
            userId,
            name,
            category,
            amount,
            dueDate,
            description: description || '',
            autoDeduct: autoDeduct !== false, // Default to true
            tags: tags || [],
            nextDueDate
        });
        res.status(201).json({
            success: true,
            data: monthlyExpense,
            message: 'Monthly expense created successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createMonthlyExpense = createMonthlyExpense;
// Update a monthly expense
const updateMonthlyExpense = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const updateData = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // If due date is being updated, recalculate next due date
        if (updateData.dueDate) {
            const today = new Date();
            let nextDueDate = new Date(today.getFullYear(), today.getMonth(), updateData.dueDate);
            if (nextDueDate < today) {
                nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, updateData.dueDate);
            }
            updateData.nextDueDate = nextDueDate;
        }
        const monthlyExpense = await MonthlyExpense_1.default.findOneAndUpdate({ _id: id, userId }, updateData, { new: true });
        if (!monthlyExpense) {
            return res.status(404).json({ message: 'Monthly expense not found' });
        }
        res.json({
            success: true,
            data: monthlyExpense,
            message: 'Monthly expense updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMonthlyExpense = updateMonthlyExpense;
// Delete a monthly expense (soft delete)
const deleteMonthlyExpense = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const monthlyExpense = await MonthlyExpense_1.default.findOneAndUpdate({ _id: id, userId }, { isActive: false }, { new: true });
        if (!monthlyExpense) {
            return res.status(404).json({ message: 'Monthly expense not found' });
        }
        res.json({
            success: true,
            data: { message: 'Monthly expense deleted successfully' },
            message: 'Monthly expense deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteMonthlyExpense = deleteMonthlyExpense;
// Process monthly expense payment
const processMonthlyExpensePayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const monthlyExpense = await MonthlyExpense_1.default.findOne({ _id: id, userId, isActive: true });
        if (!monthlyExpense) {
            return res.status(404).json({ message: 'Monthly expense not found' });
        }
        // Find or create category
        let category = await Category_1.default.findOne({
            userId,
            name: { $regex: new RegExp(monthlyExpense.category, 'i') }
        });
        if (!category) {
            category = await Category_1.default.create({
                userId,
                name: monthlyExpense.category.charAt(0).toUpperCase() + monthlyExpense.category.slice(1),
                type: 'expense',
                color: getCategoryColor(monthlyExpense.category),
                icon: getCategoryIcon(monthlyExpense.category)
            });
        }
        // Create transaction
        const transaction = await Transaction_1.default.create({
            userId,
            amount: monthlyExpense.amount,
            type: 'expense',
            categoryId: category._id,
            description: monthlyExpense.description || `${monthlyExpense.name} - Monthly Payment`,
            date: new Date(),
            tags: [...monthlyExpense.tags, 'monthly', 'automatic']
        });
        // Update monthly expense
        const nextDueDate = new Date(monthlyExpense.nextDueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        await MonthlyExpense_1.default.findByIdAndUpdate(id, {
            lastPaidDate: new Date(),
            nextDueDate
        });
        res.json({
            success: true,
            data: {
                message: 'Payment processed successfully',
                transaction,
                nextDueDate
            },
            message: 'Payment processed successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.processMonthlyExpensePayment = processMonthlyExpensePayment;
// Get monthly expenses summary
const getMonthlyExpensesSummary = async (req, res) => {
    try {
        // Always use mock data for now to avoid database issues
        res.json({
            success: true,
            data: mockDatabase_1.mockMonthlyExpensesSummary,
            message: 'Monthly expenses summary retrieved successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMonthlyExpensesSummary = getMonthlyExpensesSummary;
// Alias for getMonthlyExpensesSummary
exports.getMonthlyExpenseStats = exports.getMonthlyExpensesSummary;
// Mark a monthly expense as paid
const markAsPaid = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const monthlyExpense = await MonthlyExpense_1.default.findOneAndUpdate({ _id: id, userId }, {
            lastPaidDate: new Date(),
            isPaid: true
        }, { new: true });
        if (!monthlyExpense) {
            return res.status(404).json({ message: 'Monthly expense not found' });
        }
        res.json({
            success: true,
            data: monthlyExpense,
            message: 'Monthly expense marked as paid'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.markAsPaid = markAsPaid;
// Mark a monthly expense as unpaid
const markAsUnpaid = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const monthlyExpense = await MonthlyExpense_1.default.findOneAndUpdate({ _id: id, userId }, {
            lastPaidDate: null,
            isPaid: false
        }, { new: true });
        if (!monthlyExpense) {
            return res.status(404).json({ message: 'Monthly expense not found' });
        }
        res.json({
            success: true,
            data: monthlyExpense,
            message: 'Monthly expense marked as unpaid'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.markAsUnpaid = markAsUnpaid;
// Helper functions
function getCategoryColor(category) {
    const colors = {
        home: '#ef4444', // Red
        mobile: '#3b82f6', // Blue
        internet: '#8b5cf6', // Purple
        gym: '#10b981', // Green
        other: '#f59e0b' // Orange
    };
    return colors[category] || '#6b7280';
}
function getCategoryIcon(category) {
    const icons = {
        home: 'home',
        mobile: 'phone',
        internet: 'wifi',
        gym: 'dumbbell',
        other: 'credit-card'
    };
    return icons[category] || 'credit-card';
}
//# sourceMappingURL=monthlyExpenseController.js.map