import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MonthlyExpense from '../models/MonthlyExpense';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addSampleMonthlyExpenses() {
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

    console.log(`Adding sample monthly expenses for user: ${user.name}`);

    // Sample monthly expenses
    const sampleExpenses = [
      {
        name: 'Apartment Rent',
        category: 'home' as const,
        amount: 1200.00,
        dueDate: 1,
        description: 'Monthly apartment rent payment',
        autoDeduct: true,
        tags: ['rent', 'housing', 'monthly']
      },
      {
        name: 'Electricity Bill',
        category: 'home' as const,
        amount: 85.50,
        dueDate: 15,
        description: 'Monthly electricity utility bill',
        autoDeduct: true,
        tags: ['utilities', 'electricity', 'monthly']
      },
      {
        name: 'Verizon Phone Plan',
        category: 'mobile' as const,
        amount: 94.89,
        dueDate: 13,
        description: 'Monthly phone plan with unlimited data',
        autoDeduct: true,
        tags: ['phone', 'mobile', 'monthly']
      },
      {
        name: 'Xfinity Internet',
        category: 'internet' as const,
        amount: 79.99,
        dueDate: 20,
        description: 'High-speed internet service',
        autoDeduct: true,
        tags: ['internet', 'wifi', 'monthly']
      },
      {
        name: 'Planet Fitness Membership',
        category: 'gym' as const,
        amount: 24.99,
        dueDate: 5,
        description: 'Monthly gym membership',
        autoDeduct: true,
        tags: ['gym', 'fitness', 'monthly']
      },
      {
        name: 'Netflix Subscription',
        category: 'other' as const,
        amount: 15.99,
        dueDate: 25,
        description: 'Monthly streaming subscription',
        autoDeduct: true,
        tags: ['streaming', 'entertainment', 'monthly']
      },
      {
        name: 'Spotify Premium',
        category: 'other' as const,
        amount: 9.99,
        dueDate: 28,
        description: 'Monthly music streaming subscription',
        autoDeduct: true,
        tags: ['music', 'streaming', 'monthly']
      }
    ];

    let addedCount = 0;

    for (const expenseData of sampleExpenses) {
      // Check if expense already exists
      const existingExpense = await MonthlyExpense.findOne({
        userId: user._id,
        name: expenseData.name,
        isActive: true
      });

      if (existingExpense) {
        console.log(`Expense "${expenseData.name}" already exists`);
        continue;
      }

      // Calculate next due date
      const today = new Date();
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), expenseData.dueDate);
      
      // If due date has passed this month, set to next month
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, expenseData.dueDate);
      }

      // Create the monthly expense
      const monthlyExpense = await MonthlyExpense.create({
        userId: user._id,
        ...expenseData,
        nextDueDate
      });

      console.log(`Added monthly expense: ${monthlyExpense.name}`);
      console.log(`- Amount: $${monthlyExpense.amount.toFixed(2)}`);
      console.log(`- Category: ${monthlyExpense.category}`);
      console.log(`- Due Date: ${monthlyExpense.dueDate}th of each month`);
      console.log(`- Next Due: ${nextDueDate.toLocaleDateString()}`);
      console.log(`- Auto Deduct: ${monthlyExpense.autoDeduct ? 'Yes' : 'No'}`);
      console.log('---');
      addedCount++;
    }

    console.log(`\n✅ Successfully added ${addedCount} sample monthly expenses!`);
    console.log('\n📊 Monthly Expenses Summary:');
    
    const allExpenses = await MonthlyExpense.find({ userId: user._id, isActive: true });
    const totalMonthly = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    console.log(`Total Monthly: $${totalMonthly.toFixed(2)}`);
    console.log(`Active Expenses: ${allExpenses.length}`);
    
    // Group by category
    const byCategory = allExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byCategory).forEach(([category, amount]) => {
      console.log(`${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount.toFixed(2)}`);
    });

  } catch (error) {
    console.error('Error adding sample monthly expenses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleMonthlyExpenses();
