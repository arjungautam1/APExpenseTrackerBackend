import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function addMacLoan() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the first user in the database
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Check if Mac loan already exists
    const existingLoan = await Loan.findOne({ 
      userId: user._id, 
      name: { $regex: /MacBook|Mac/i } 
    });

    if (existingLoan) {
      console.log('Mac loan already exists for this user');
      console.log('Existing loan details:', existingLoan);
      return;
    }

    // Mac loan details
    const totalPaid = 569.34;
    const remainingBalance = 1707.73;
    const totalAmount = totalPaid + remainingBalance; // $2277.07
    const monthlyPayment = 94.87; // $569.34 / 6 months (assuming 6 payments made)
    const totalPayments = 24; // 2 years * 12 months
    const paymentsMade = 6; // $569.34 / $94.87 ≈ 6 payments
    const paymentsRemaining = 18; // 24 - 6 = 18

    // Calculate dates
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 2); // 6 months ago, 2nd of month
    const endDate = new Date(startDate.getFullYear() + 2, startDate.getMonth(), 2); // 2 years from start
    const nextEmiDate = new Date(today.getFullYear(), today.getMonth(), 2); // 2nd of current month
    if (nextEmiDate < today) {
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1); // Next month if already passed
    }

    // Calculate interest rate (approximate based on total payments)
    // For a 24-month loan of $2277.07 with $94.87 monthly payment
    // This gives us an approximate interest rate
    const principal = totalAmount;
    const monthlyRate = 0.005; // Approximate 6% annual rate
    const calculatedEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, 24)) / (Math.pow(1 + monthlyRate, 24) - 1);
    const annualRate = monthlyRate * 12 * 100; // Convert to annual percentage

    // Create the loan
    const macLoan = new Loan({
      userId: user._id,
      name: 'MacBook Pro Loan',
      principalAmount: totalAmount,
      currentBalance: remainingBalance,
      interestRate: annualRate,
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      nextEmiDate: nextEmiDate,
    });

    await macLoan.save();
    console.log('Mac loan added successfully!');
    console.log('Loan details:');
    console.log(`- Name: ${macLoan.name}`);
    console.log(`- Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`- Paid so far: $${totalPaid.toFixed(2)}`);
    console.log(`- Remaining: $${remainingBalance.toFixed(2)}`);
    console.log(`- Monthly Payment: $${monthlyPayment.toFixed(2)}`);
    console.log(`- Payments made: ${paymentsMade}`);
    console.log(`- Payments remaining: ${paymentsRemaining}`);
    console.log(`- Next EMI date: ${nextEmiDate.toLocaleDateString()}`);
    console.log(`- End date: ${endDate.toLocaleDateString()}`);
    console.log(`- Loan ID: ${macLoan._id}`);

  } catch (error) {
    console.error('Error adding Mac loan:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addMacLoan();
