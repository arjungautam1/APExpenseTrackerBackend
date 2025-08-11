import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addAffirmPaymentHistory() {
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

    console.log(`Adding Affirm payment history for user: ${user.name}`);

    // Find or create categories
    let taxCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /tax|duty/i } 
    });

    if (!taxCategory) {
      taxCategory = await Category.create({
        userId: user._id,
        name: 'Taxes & Duties',
        type: 'expense',
        color: '#dc2626',
        icon: 'receipt'
      });
      console.log('Created tax category');
    }

    let loanCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /loan|emi|debt/i } 
    });

    if (!loanCategory) {
      loanCategory = await Category.create({
        userId: user._id,
        name: 'Loan & EMI',
        type: 'expense',
        color: '#ef4444',
        icon: 'credit-card'
      });
      console.log('Created loan category');
    }

    // Historical payments from Affirm screenshot
    const historicalPayments = [
      {
        amount: 272.87,
        description: 'Apple Taxes - MacBook Pro',
        date: new Date(2025, 1, 1), // Feb 1, 2025
        category: taxCategory,
        tags: ['tax', 'apple', 'macbook', 'initial']
      },
      {
        amount: 94.89,
        description: 'MacBook Pro EMI Payment - Feb',
        date: new Date(2025, 1, 19), // Feb 19, 2025
        category: loanCategory,
        tags: ['loan', 'emi', 'macbook', 'affirm']
      },
      {
        amount: 94.89,
        description: 'MacBook Pro EMI Payment - Apr',
        date: new Date(2025, 3, 2), // Apr 2, 2025
        category: loanCategory,
        tags: ['loan', 'emi', 'macbook', 'affirm']
      },
      {
        amount: 94.89,
        description: 'MacBook Pro EMI Payment - Apr',
        date: new Date(2025, 3, 29), // Apr 29, 2025
        category: loanCategory,
        tags: ['loan', 'emi', 'macbook', 'affirm']
      },
      {
        amount: 94.89,
        description: 'MacBook Pro EMI Payment - Jun',
        date: new Date(2025, 5, 2), // Jun 2, 2025
        category: loanCategory,
        tags: ['loan', 'emi', 'macbook', 'affirm']
      }
    ];

    console.log('Adding historical payments...');

    for (const payment of historicalPayments) {
      // Check if payment already exists
      const existingPayment = await Transaction.findOne({
        userId: user._id,
        description: payment.description,
        amount: payment.amount,
        date: {
          $gte: new Date(payment.date.getFullYear(), payment.date.getMonth(), payment.date.getDate()),
          $lt: new Date(payment.date.getFullYear(), payment.date.getMonth(), payment.date.getDate() + 1)
        }
      });

      if (existingPayment) {
        console.log(`Payment already exists: ${payment.description} - $${payment.amount}`);
        continue;
      }

      // Create the transaction
      const transaction = await Transaction.create({
        userId: user._id,
        amount: payment.amount,
        type: 'expense',
        categoryId: payment.category._id,
        description: payment.description,
        date: payment.date,
        tags: payment.tags
      });

      console.log(`Added: ${payment.description} - $${payment.amount.toFixed(2)} - ${payment.date.toLocaleDateString()}`);
    }

    console.log('Affirm payment history added successfully!');

  } catch (error) {
    console.error('Error adding Affirm payment history:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addAffirmPaymentHistory();
