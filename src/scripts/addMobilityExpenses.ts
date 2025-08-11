import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addMobilityExpenses() {
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

    console.log(`Adding mobility expenses for user: ${user.name}`);

    // Find or create a mobility category
    let mobilityCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /mobility|phone|mobile/i } 
    });

    if (!mobilityCategory) {
      mobilityCategory = await Category.create({
        userId: user._id,
        name: 'Mobility',
        type: 'expense',
        color: '#3b82f6', // Blue color for mobility
        icon: 'phone'
      });
      console.log('Created mobility category');
    }

    // Sample mobility expenses from the image
    const mobilityExpenses = [
      {
        amount: 35.00,
        description: 'Mobility - 4376012079',
        date: new Date(2025, 7, 10), // August 10, 2025 (today)
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      },
      {
        amount: 72.53,
        description: 'Mobility - 6476142079',
        date: new Date(2025, 7, 10), // August 10, 2025 (today)
        category: mobilityCategory,
        tags: ['mobility', 'phone', 'bill']
      }
    ];

    console.log('Adding mobility expenses...');

    for (const expense of mobilityExpenses) {
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
        console.log(`Expense already exists: ${expense.description} - $${expense.amount}`);
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
    const totalAmount = mobilityExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log(`\nMobility expenses added successfully!`);
    console.log(`Total amount: $${totalAmount.toFixed(2)}`);

  } catch (error) {
    console.error('Error adding mobility expenses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addMobilityExpenses();
