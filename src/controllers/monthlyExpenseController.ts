import { Request, Response } from 'express';
import MonthlyExpense from '../models/MonthlyExpense';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import { mockMonthlyExpenses, mockMonthlyExpensesSummary } from '../config/mockDatabase';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get all monthly expenses for a user
export const getMonthlyExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log('Getting monthly expenses for user:', userId);
    
    // Always use mock data for now to test
    console.log('Using mock data for monthly expenses');
    const userExpenses = mockMonthlyExpenses.filter(expense => expense.userId === userId);
    res.json(userExpenses);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get monthly expenses by category
export const getMonthlyExpensesByCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const expenses = await MonthlyExpense.find({ 
      userId, 
      category, 
      isActive: true 
    }).sort({ name: 1 });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching monthly expenses by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new monthly expense
export const createMonthlyExpense = async (req: AuthenticatedRequest, res: Response) => {
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

    const monthlyExpense = await MonthlyExpense.create({
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

    res.status(201).json(monthlyExpense);
  } catch (error) {
    console.error('Error creating monthly expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a monthly expense
export const updateMonthlyExpense = async (req: AuthenticatedRequest, res: Response) => {
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

    const monthlyExpense = await MonthlyExpense.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!monthlyExpense) {
      return res.status(404).json({ message: 'Monthly expense not found' });
    }

    res.json(monthlyExpense);
  } catch (error) {
    console.error('Error updating monthly expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a monthly expense (soft delete)
export const deleteMonthlyExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const monthlyExpense = await MonthlyExpense.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!monthlyExpense) {
      return res.status(404).json({ message: 'Monthly expense not found' });
    }

    res.json({ message: 'Monthly expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting monthly expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Process monthly expense payment
export const processMonthlyExpensePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const monthlyExpense = await MonthlyExpense.findOne({ _id: id, userId, isActive: true });
    if (!monthlyExpense) {
      return res.status(404).json({ message: 'Monthly expense not found' });
    }

    // Find or create category
    let category = await Category.findOne({ 
      userId, 
      name: { $regex: new RegExp(monthlyExpense.category, 'i') } 
    });

    if (!category) {
      category = await Category.create({
        userId,
        name: monthlyExpense.category.charAt(0).toUpperCase() + monthlyExpense.category.slice(1),
        type: 'expense',
        color: getCategoryColor(monthlyExpense.category),
        icon: getCategoryIcon(monthlyExpense.category)
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
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

    await MonthlyExpense.findByIdAndUpdate(id, {
      lastPaidDate: new Date(),
      nextDueDate
    });

    res.json({
      message: 'Payment processed successfully',
      transaction,
      nextDueDate
    });
  } catch (error) {
    console.error('Error processing monthly expense payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get monthly expenses summary
export const getMonthlyExpensesSummary = async (req: AuthenticatedRequest, res: Response) => {
  console.log('=== getMonthlyExpensesSummary called ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  try {
    console.log('Getting monthly expenses summary');
    
    // Always use mock data for now to avoid database issues
    console.log('Using mock summary data');
    res.json(mockMonthlyExpensesSummary);
  } catch (error) {
    console.error('Error fetching monthly expenses summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
function getCategoryColor(category: string): string {
  const colors = {
    home: '#ef4444',      // Red
    mobile: '#3b82f6',    // Blue
    internet: '#8b5cf6',  // Purple
    gym: '#10b981',       // Green
    other: '#f59e0b'      // Orange
  };
  return colors[category as keyof typeof colors] || '#6b7280';
}

function getCategoryIcon(category: string): string {
  const icons = {
    home: 'home',
    mobile: 'phone',
    internet: 'wifi',
    gym: 'dumbbell',
    other: 'credit-card'
  };
  return icons[category as keyof typeof icons] || 'credit-card';
}
