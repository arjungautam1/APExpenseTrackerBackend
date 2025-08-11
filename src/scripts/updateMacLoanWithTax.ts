import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function updateMacLoanWithTax() {
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

    // Find the existing Mac loan
    const existingLoan = await Loan.findOne({ 
      userId: user._id, 
      name: { $regex: /MacBook|Mac/i } 
    });

    if (!existingLoan) {
      console.log('No Mac loan found. Creating new one...');
      return;
    }

    console.log('Found existing Mac loan, updating with tax details...');

    // Mac loan details with tax
    const principalAmount = 2277.07; // Base amount
    const initialTax = 272.87; // Tax paid at beginning
    const totalCost = principalAmount + initialTax; // $2,549.94
    const totalPaid = 569.34; // Amount paid so far (excluding tax)
    const remainingBalance = 1707.73; // Remaining on principal
    const regularMonthlyPayment = 94.89; // Regular monthly payment
    const finalPayment = 94.60; // Final payment amount
    const totalPayments = 24; // 2 years * 12 months
    const paymentsMade = 6; // $569.34 / $94.89 ≈ 6 payments
    const paymentsRemaining = 18; // 24 - 6 = 18

    // Calculate dates
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 2); // 6 months ago, 2nd of month
    const endDate = new Date(startDate.getFullYear() + 2, startDate.getMonth(), 2); // 2 years from start
    const nextEmiDate = new Date(today.getFullYear(), today.getMonth(), 2); // 2nd of current month
    if (nextEmiDate < today) {
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1); // Next month if already passed
    }

    // Update the loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      existingLoan._id,
      {
        name: 'MacBook Pro Loan (with Tax)',
        principalAmount: totalCost, // Include tax in total amount
        currentBalance: remainingBalance,
        interestRate: 0, // Interest-free loan
        startDate: startDate,
        endDate: endDate,
        status: 'active',
        nextEmiDate: nextEmiDate,
      },
      { new: true }
    );

    console.log('Mac loan updated with tax details!');
    console.log('Updated loan details:');
    console.log(`- Name: ${updatedLoan?.name}`);
    console.log(`- Principal Amount: $${principalAmount.toFixed(2)}`);
    console.log(`- Initial Tax: $${initialTax.toFixed(2)}`);
    console.log(`- Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`- Paid so far (excluding tax): $${totalPaid.toFixed(2)}`);
    console.log(`- Remaining: $${remainingBalance.toFixed(2)}`);
    console.log(`- Regular Monthly Payment: $${regularMonthlyPayment.toFixed(2)}`);
    console.log(`- Final Payment: $${finalPayment.toFixed(2)}`);
    console.log(`- Payments made: ${paymentsMade}`);
    console.log(`- Payments remaining: ${paymentsRemaining}`);
    console.log(`- Next EMI date: ${nextEmiDate.toLocaleDateString()}`);
    console.log(`- End date: ${endDate.toLocaleDateString()}`);
    console.log(`- Interest Rate: 0% (Interest-free loan)`);
    console.log(`- Loan ID: ${updatedLoan?._id}`);

    // Calculate payment schedule
    console.log('\nPayment Schedule:');
    console.log(`Initial Tax Payment: $${initialTax.toFixed(2)} (paid at purchase)`);
    let remainingBalanceForSchedule = principalAmount;
    for (let i = 1; i <= totalPayments; i++) {
      const isLastPayment = i === totalPayments;
      const paymentAmount = isLastPayment ? finalPayment : regularMonthlyPayment;
      remainingBalanceForSchedule -= paymentAmount;
      
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);
      
      console.log(`Payment ${i} (${paymentDate.toLocaleDateString()}): $${paymentAmount.toFixed(2)} - Remaining: $${Math.max(0, remainingBalanceForSchedule).toFixed(2)}`);
    }

    console.log(`\nTotal Cost Breakdown:`);
    console.log(`- Principal: $${principalAmount.toFixed(2)}`);
    console.log(`- Tax: $${initialTax.toFixed(2)}`);
    console.log(`- Total: $${totalCost.toFixed(2)}`);

  } catch (error) {
    console.error('Error updating Mac loan:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateMacLoanWithTax();
