import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function updateMacLoanFromAffirm() {
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

    console.log('Found existing Mac loan, updating with exact Affirm details...');

    // Mac loan details from Affirm screenshot
    const originalAmount = 2099.00; // Original loan amount
    const initialTax = 272.87; // Apple Taxes paid Feb. 1
    const totalCost = originalAmount + initialTax; // $2,371.87
    const totalPaid = 569.34; // Paid to date
    const remainingBalance = 1707.73; // Total balance
    const regularMonthlyPayment = 94.89; // Regular monthly payment
    const paymentsRemaining = 18; // 18 payments left
    const totalPayments = 24; // Total loan term
    const paymentsMade = totalPayments - paymentsRemaining; // 6 payments made

    // Calculate dates based on Affirm information
    const today = new Date();
    const nextPaymentDate = new Date(today.getFullYear(), 8, 2); // Sep 2 (month 8 = September)
    const startDate = new Date(2025, 1, 1); // Feb 1, 2025 (tax payment date)
    const endDate = new Date(startDate.getFullYear() + 2, startDate.getMonth(), startDate.getDate()); // 2 years from start

    // Update the loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      existingLoan._id,
      {
        name: 'Apple MacBook Pro 14" - Space Black (Affirm)',
        principalAmount: totalCost, // Include tax in total amount
        currentBalance: remainingBalance,
        interestRate: 0, // Interest-free loan
        startDate: startDate,
        endDate: endDate,
        status: 'active',
        nextEmiDate: nextPaymentDate,
      },
      { new: true }
    );

    console.log('Mac loan updated with exact Affirm details!');
    console.log('Updated loan details:');
    console.log(`- Name: ${updatedLoan?.name}`);
    console.log(`- Original Amount: $${originalAmount.toFixed(2)}`);
    console.log(`- Initial Tax: $${initialTax.toFixed(2)} (paid Feb. 1)`);
    console.log(`- Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`- Paid to date: $${totalPaid.toFixed(2)}`);
    console.log(`- Remaining Balance: $${remainingBalance.toFixed(2)}`);
    console.log(`- Monthly Payment: $${regularMonthlyPayment.toFixed(2)}`);
    console.log(`- Payments made: ${paymentsMade}`);
    console.log(`- Payments remaining: ${paymentsRemaining}`);
    console.log(`- Next payment date: ${nextPaymentDate.toLocaleDateString()}`);
    console.log(`- End date: ${endDate.toLocaleDateString()}`);
    console.log(`- Interest Rate: 0% (Interest-free loan)`);
    console.log(`- Loan ID: ${updatedLoan?._id}`);

    // Calculate payment schedule
    console.log('\nPayment Schedule (from Affirm):');
    console.log(`Initial Tax Payment: $${initialTax.toFixed(2)} (Feb. 1, 2025)`);
    
    let remainingBalanceForSchedule = originalAmount;
    for (let i = 1; i <= totalPayments; i++) {
      const paymentAmount = regularMonthlyPayment; // All payments are $94.89
      remainingBalanceForSchedule -= paymentAmount;
      
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);
      
      const status = i <= paymentsMade ? 'PAID' : (i === paymentsMade + 1 ? 'DUE SEP 2' : 'PENDING');
      console.log(`Payment ${i} (${paymentDate.toLocaleDateString()}): $${paymentAmount.toFixed(2)} - Remaining: $${Math.max(0, remainingBalanceForSchedule).toFixed(2)} - ${status}`);
    }

    console.log(`\nTotal Cost Breakdown:`);
    console.log(`- Original Amount: $${originalAmount.toFixed(2)}`);
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
updateMacLoanFromAffirm();
