import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function updateMacLoanTo13th() {
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

    console.log(`Updating MacBook loan for user: ${user.name}`);

    // Find the Mac loan
    const loan = await Loan.findOne({ 
      userId: user._id, 
      name: { $regex: /MacBook|Mac/i } 
    });

    if (!loan) {
      console.error('No Mac loan found.');
      return;
    }

    console.log(`Found loan: ${loan.name}`);

    // Set next payment date to August 13th, 2025
    const nextPaymentDate = new Date(2025, 7, 13); // August 13, 2025 (month is 0-indexed)

    // Update the loan
    const updatedLoan = await Loan.findByIdAndUpdate(loan._id, {
      nextEmiDate: nextPaymentDate
    }, { new: true });

    console.log('MacBook loan updated successfully!');
    console.log(`- Loan name: ${updatedLoan?.name}`);
    console.log(`- Next payment date: ${nextPaymentDate.toLocaleDateString()}`);
    console.log(`- Current balance: $${updatedLoan?.currentBalance.toFixed(2)}`);

  } catch (error) {
    console.error('Error updating MacBook loan:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateMacLoanTo13th();
