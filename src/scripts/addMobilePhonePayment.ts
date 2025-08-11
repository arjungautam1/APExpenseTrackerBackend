import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addMobilePhonePayment() {
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

    console.log(`Adding mobile phone payment for user: ${user.name}`);

    // Find or create a mobile phone category
    let mobileCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /mobile|phone|cellular/i } 
    });

    if (!mobileCategory) {
      mobileCategory = await Category.create({
        userId: user._id,
        name: 'Mobile Phone',
        type: 'expense',
        color: '#3b82f6', // Blue color for mobile
        icon: 'phone'
      });
      console.log('Created mobile phone category');
    }

    // Check if payment already exists for July 13th
    const july13 = new Date(2025, 6, 13); // July 13, 2025 (month is 0-indexed)
    const existingPayment = await Transaction.findOne({
      userId: user._id,
      description: { $regex: /mobile phone|phone bill/i },
      date: july13,
      type: 'expense'
    });

    if (existingPayment) {
      console.log('Mobile phone payment for July 13th already exists');
      return;
    }

    // Create the mobile phone payment transaction
    const transaction = await Transaction.create({
      userId: user._id,
      amount: 94.89, // Same amount as MacBook EMI for consistency
      type: 'expense',
      categoryId: mobileCategory._id,
      description: 'For mobile phone',
      date: july13,
      tags: ['mobile', 'phone', 'monthly', 'automatic']
    });

    console.log('Mobile phone payment added successfully!');
    console.log(`- Amount: $${transaction.amount.toFixed(2)}`);
    console.log(`- Date: ${july13.toLocaleDateString()}`);
    console.log(`- Description: ${transaction.description}`);
    console.log(`- Category: ${mobileCategory.name}`);
    console.log(`- Transaction ID: ${transaction._id}`);

  } catch (error) {
    console.error('Error adding mobile phone payment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addMobilePhonePayment();
