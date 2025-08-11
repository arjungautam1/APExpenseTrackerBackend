import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

export async function processLoanPayments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const today = new Date();
    const isThirteenthOfMonth = today.getDate() === 13;
    
    if (!isThirteenthOfMonth) {
      console.log('Not the 13th of the month. Skipping loan payment processing.');
      return;
    }

    console.log('Processing loan payments for the 13th of the month...');

    // Find all active loans
    const activeLoans = await Loan.find({ status: 'active' });
    console.log(`Found ${activeLoans.length} active loans`);

    for (const loan of activeLoans) {
      // Check if payment is due today
      const nextEmiDate = new Date(loan.nextEmiDate || new Date());
      const isPaymentDue = nextEmiDate.getDate() === 13 && 
                          nextEmiDate.getMonth() === today.getMonth() && 
                          nextEmiDate.getFullYear() === today.getFullYear();

      if (!isPaymentDue) {
        console.log(`Payment not due for loan: ${loan.name}`);
        continue;
      }

      console.log(`Processing payment for loan: ${loan.name}`);

      // Find or create a loan/EMI category
      let loanCategory = await Category.findOne({ 
        userId: loan.userId, 
        name: { $regex: /loan|emi|debt/i } 
      });

      if (!loanCategory) {
        // Create a loan category if it doesn't exist
        loanCategory = await Category.create({
          userId: loan.userId,
          name: 'Loan & EMI',
          type: 'expense',
          color: '#ef4444', // Red color for loans
          icon: 'credit-card'
        });
        console.log('Created loan category');
      }

      // Calculate payment amount based on remaining payments
      const months = Math.max(1, Math.ceil((loan.endDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const paymentsMade = Math.ceil((loan.principalAmount - loan.currentBalance) / 94.89); // Assuming regular payments of $94.89
      const paymentsRemaining = months - paymentsMade;
      
      // Determine payment amount: $94.89 for regular payments, $94.60 for final payment
      let paymentAmount;
      if (paymentsRemaining === 1) {
        paymentAmount = 94.60; // Final payment
      } else {
        paymentAmount = 94.89; // Regular payment
      }

      // Check if payment already exists for this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const existingPayment = await Transaction.findOne({
        userId: loan.userId,
        description: { $regex: new RegExp(loan.name, 'i') },
        date: { $gte: startOfMonth, $lte: endOfMonth },
        type: 'expense'
      });

      if (existingPayment) {
        console.log(`Payment already exists for ${loan.name} this month`);
        continue;
      }

      // Create the transaction
      const actualPaymentAmount = Math.min(paymentAmount, loan.currentBalance); // Don't pay more than remaining balance
      const transaction = await Transaction.create({
        userId: loan.userId,
        amount: actualPaymentAmount,
        type: 'expense',
        categoryId: loanCategory._id,
        description: `EMI Payment - ${loan.name}`,
        date: today,
        tags: ['loan', 'emi', 'automatic']
      });

      // Update loan balance
      const newBalance = Math.max(0, loan.currentBalance - actualPaymentAmount);
      
      // Calculate next EMI date
      const nextPaymentDate = new Date(nextEmiDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      // Update loan
      await Loan.findByIdAndUpdate(loan._id, {
        currentBalance: newBalance,
        nextEmiDate: nextPaymentDate,
        status: newBalance === 0 ? 'completed' : 'active'
      });

      console.log(`Payment processed for ${loan.name}:`);
      console.log(`- Amount paid: $${actualPaymentAmount.toFixed(2)}`);
      console.log(`- New balance: $${newBalance.toFixed(2)}`);
      console.log(`- Next payment date: ${nextPaymentDate.toLocaleDateString()}`);
      console.log(`- Transaction ID: ${transaction._id}`);

      if (newBalance === 0) {
        console.log(`🎉 Loan ${loan.name} has been fully paid off!`);
      }
    }

    console.log('Loan payment processing completed');

  } catch (error) {
    console.error('Error processing loan payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
processLoanPayments();
