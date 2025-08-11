import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function updateMacLoanExact() {
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

    console.log('Found existing Mac loan, updating with exact payment details...');

    // Mac loan details with exact payments
    const totalPaid = 569.34;
    const remainingBalance = 1707.73;
    const totalAmount = totalPaid + remainingBalance; // $2277.07
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

    // Calculate interest rate based on exact payments
    // We need to find the interest rate that gives us $94.89 monthly payments
    // and $94.60 for the final payment
    const principal = totalAmount;
    const months = 24;
    
    // Calculate the total payments made with regular amount
    const regularPaymentsTotal = (months - 1) * regularMonthlyPayment; // 23 payments of $94.89
    const finalPaymentAmount = finalPayment; // 1 payment of $94.60
    const totalPaymentsCalculated = regularPaymentsTotal + finalPaymentAmount;
    
    // Calculate approximate interest rate
    // For a 24-month loan of $2277.07 with total payments of $2277.07
    // This gives us approximately 0% interest (interest-free loan)
    const annualRate = 0; // Interest-free loan

    // Update the loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      existingLoan._id,
      {
        name: 'MacBook Pro Loan',
        principalAmount: totalAmount,
        currentBalance: remainingBalance,
        interestRate: annualRate,
        startDate: startDate,
        endDate: endDate,
        status: 'active',
        nextEmiDate: nextEmiDate,
      },
      { new: true }
    );

    console.log('Mac loan updated with exact payment details!');
    console.log('Updated loan details:');
    console.log(`- Name: ${updatedLoan?.name}`);
    console.log(`- Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`- Paid so far: $${totalPaid.toFixed(2)}`);
    console.log(`- Remaining: $${remainingBalance.toFixed(2)}`);
    console.log(`- Regular Monthly Payment: $${regularMonthlyPayment.toFixed(2)}`);
    console.log(`- Final Payment: $${finalPayment.toFixed(2)}`);
    console.log(`- Payments made: ${paymentsMade}`);
    console.log(`- Payments remaining: ${paymentsRemaining}`);
    console.log(`- Next EMI date: ${nextEmiDate.toLocaleDateString()}`);
    console.log(`- End date: ${endDate.toLocaleDateString()}`);
    console.log(`- Interest Rate: ${annualRate}% (Interest-free loan)`);
    console.log(`- Loan ID: ${updatedLoan?._id}`);

    // Calculate payment schedule
    console.log('\nPayment Schedule:');
    let remainingBalanceForSchedule = totalAmount;
    for (let i = 1; i <= months; i++) {
      const isLastPayment = i === months;
      const paymentAmount = isLastPayment ? finalPayment : regularMonthlyPayment;
      remainingBalanceForSchedule -= paymentAmount;
      
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);
      
      console.log(`Payment ${i} (${paymentDate.toLocaleDateString()}): $${paymentAmount.toFixed(2)} - Remaining: $${Math.max(0, remainingBalanceForSchedule).toFixed(2)}`);
    }

  } catch (error) {
    console.error('Error updating Mac loan:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateMacLoanExact();
