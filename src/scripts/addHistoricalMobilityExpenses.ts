import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addHistoricalMobilityExpenses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the first user
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database.');
      return;
    }

    console.log(`Adding historical mobility expenses for user: ${user.name}`);

    // Find the mobility category
    let mobilityCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /mobility|phone|mobile/i } 
    });

    if (!mobilityCategory) {
      console.log('Mobility category not found. Please run addMobilityExpenses.ts first.');
      return;
    }

    // Historical mobility expenses for the past 6 months
    const historicalExpenses = [
      // July 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 6, 10), // July 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 6, 10), // July 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      // June 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 5, 10), // June 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 5, 10), // June 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      // May 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 4, 10), // May 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 4, 10), // May 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      // April 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 3, 10), // April 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 3, 10), // April 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      // March 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 2, 10), // March 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 2, 10), // March 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      // February 2025
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 1, 10), // February 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 1, 10), // February 10, 2025
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      }
    ];

    console.log('Adding historical mobility expenses...');

    for (const expense of historicalExpenses) {
      // Check if expense already exists
      const existingExpense = await Transaction.findOne({
        userId: user._id,
        description: expense.description,
        amount: expense.amount,
        date: {
          $gte: new Date(expense.date.getFullYear(), expense.date.getMonth(), expense.date.getDate()),
          $lt: new Date(expense.date.getFullYear(), expense.date.getMonth(), expense.date.getDate() + 1)
        }
      });

      if (existingExpense) {
        console.log(`Expense already exists: ${expense.description} - $${expense.amount} - ${expense.date.toLocaleDateString()}`);
        continue;
      }

      // Create the transaction
      const transaction = await Transaction.create({
        userId: user._id,
        amount: expense.amount,
        type: 'expense',
        categoryId: expense.category._id,
        description: expense.description,
        date: expense.date,
        tags: expense.tags
      });

      console.log(`Added: ${expense.description} - $${expense.amount.toFixed(2)} - ${expense.date.toLocaleDateString()}`);
    }

    // Calculate total
    const totalAmount = historicalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log(`\nHistorical mobility expenses added successfully!`);
    console.log(`Total amount: $${totalAmount.toFixed(2)}`);
    console.log(`Number of expenses: ${historicalExpenses.length}`);

  } catch (error) {
    console.error('Error adding historical mobility expenses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addHistoricalMobilityExpenses();
