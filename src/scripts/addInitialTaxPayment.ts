import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addInitialTaxPayment() {
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

    console.log(`Adding initial tax payment for user: ${user.name}`);

    // Find or create a tax category
    let taxCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /tax|duty/i } 
    });

    if (!taxCategory) {
      taxCategory = await Category.create({
        userId: user._id,
        name: 'Taxes & Duties',
        type: 'expense',
        color: '#dc2626', // Red color for taxes
        icon: 'receipt'
      });
      console.log('Created tax category');
    }

    // Check if tax payment already exists
    const existingTaxPayment = await Transaction.findOne({
      userId: user._id,
      description: { $regex: /MacBook.*tax|tax.*MacBook/i },
      amount: 272.87
    });

    if (existingTaxPayment) {
      console.log('Initial tax payment already exists');
      console.log('Existing transaction:', existingTaxPayment);
      return;
    }

    // Calculate the tax payment date (6 months ago, around the time you got the Mac)
    const today = new Date();
    const taxPaymentDate = new Date(today.getFullYear(), today.getMonth() - 6, 1); // 1st of the month, 6 months ago

    // Create the tax transaction
    const taxTransaction = await Transaction.create({
      userId: user._id,
      amount: 272.87,
      type: 'expense',
      categoryId: taxCategory._id,
      description: 'MacBook Pro - Initial Tax Payment',
      date: taxPaymentDate,
      tags: ['tax', 'macbook', 'initial', 'purchase']
    });

    console.log('Initial tax payment added successfully!');
    console.log('Transaction details:');
    console.log(`- Amount: $${taxTransaction.amount.toFixed(2)}`);
    console.log(`- Description: ${taxTransaction.description}`);
    console.log(`- Date: ${taxTransaction.date.toLocaleDateString()}`);
    console.log(`- Category: ${taxCategory.name}`);
    console.log(`- Transaction ID: ${taxTransaction._id}`);

  } catch (error) {
    console.error('Error adding initial tax payment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addInitialTaxPayment();
