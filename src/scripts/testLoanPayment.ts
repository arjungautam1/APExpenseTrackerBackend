import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import User from '../models/User';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function testLoanPayment() {
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

    console.log(`Testing loan payment for user: ${user.name}`);

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

    // Find or create a loan/EMI category
    let loanCategory = await Category.findOne({ 
      userId: loan.userId, 
      name: { $regex: /loan|emi|debt/i } 
    });

    if (!loanCategory) {
      loanCategory = await Category.create({
        userId: loan.userId,
        name: 'Loan & EMI',
        type: 'expense',
        color: '#ef4444',
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

    console.log(`Payment amount: $${paymentAmount.toFixed(2)} (${paymentsRemaining === 1 ? 'Final' : 'Regular'} payment)`);
    console.log(`Current balance: $${loan.currentBalance.toFixed(2)}`);
    console.log(`Payments remaining: ${paymentsRemaining}`);

    // Create the transaction
    const actualPaymentAmount = Math.min(paymentAmount, loan.currentBalance);
    const transaction = await Transaction.create({
      userId: loan.userId,
      amount: actualPaymentAmount,
      type: 'expense',
      categoryId: loanCategory._id,
      description: `EMI Payment - ${loan.name}`,
      date: new Date(),
      tags: ['loan', 'emi', 'automatic']
    });

    // Update loan balance
    const newBalance = Math.max(0, loan.currentBalance - actualPaymentAmount);
    
    // Calculate next EMI date
    const nextPaymentDate = new Date(loan.nextEmiDate || new Date());
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Update loan
    const updatedLoan = await Loan.findByIdAndUpdate(loan._id, {
      currentBalance: newBalance,
      nextEmiDate: nextPaymentDate,
      status: newBalance === 0 ? 'completed' : 'active'
    }, { new: true });

    console.log('Test payment processed successfully!');
    console.log(`- Amount paid: $${actualPaymentAmount.toFixed(2)}`);
    console.log(`- New balance: $${newBalance.toFixed(2)}`);
    console.log(`- Next payment date: ${nextPaymentDate.toLocaleDateString()}`);
    console.log(`- Transaction ID: ${transaction._id}`);
    console.log(`- Updated loan: ${updatedLoan?.name}`);

    if (newBalance === 0) {
      console.log(`🎉 Loan ${loan.name} has been fully paid off!`);
    }

  } catch (error) {
    console.error('Error testing loan payment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
testLoanPayment();
