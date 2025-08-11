import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addFutureMobilePayments() {
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

    console.log(`Adding future mobile phone payments for user: ${user.name}`);

    // Find the mobile phone category
    const mobileCategory = await Category.findOne({ 
      userId: user._id, 
      name: { $regex: /mobile|phone|cellular/i } 
    });

    if (!mobileCategory) {
      console.error('Mobile phone category not found. Run addMobilePhonePayment.ts first.');
      return;
    }

    // Future payment dates (13th of each month)
    const futureDates = [
      new Date(2025, 7, 13),  // August 13, 2025
      new Date(2025, 8, 13),  // September 13, 2025
      new Date(2025, 9, 13),  // October 13, 2025
      new Date(2025, 10, 13), // November 13, 2025
      new Date(2025, 11, 13), // December 13, 2025
    ];

    let addedCount = 0;

    for (const date of futureDates) {
      // Check if payment already exists for this date
      const existingPayment = await Transaction.findOne({
        userId: user._id,
        description: { $regex: /mobile phone|phone bill|for mobile phone/i },
        date: date,
        type: 'expense'
      });

      if (existingPayment) {
        console.log(`Mobile phone payment for ${date.toLocaleDateString()} already exists`);
        continue;
      }

      // Create the mobile phone payment transaction
      const transaction = await Transaction.create({
        userId: user._id,
        amount: 94.89,
        type: 'expense',
        categoryId: mobileCategory._id,
        description: 'For mobile phone',
        date: date,
        tags: ['mobile', 'phone', 'monthly', 'automatic']
      });

      console.log(`Added mobile phone payment for ${date.toLocaleDateString()}`);
      console.log(`- Amount: $${transaction.amount.toFixed(2)}`);
      console.log(`- Transaction ID: ${transaction._id}`);
      addedCount++;
    }

    console.log(`\n✅ Successfully added ${addedCount} future mobile phone payments!`);
    console.log('📅 Payment schedule:');
    futureDates.forEach(date => {
      console.log(`   - ${date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}: $94.89`);
    });

  } catch (error) {
    console.error('Error adding future mobile phone payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addFutureMobilePayments();
