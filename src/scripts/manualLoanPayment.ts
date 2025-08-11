import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { processLoanPayments } from './processLoanPayments';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function manualLoanPayment() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Manually triggering loan payment processing...');
    await processLoanPayments();

    console.log('Manual loan payment processing completed');

  } catch (error) {
    console.error('Error in manual loan payment processing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
manualLoanPayment();
