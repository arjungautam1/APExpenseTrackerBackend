import mongoose from 'mongoose';
import { addInvestmentCategory } from '../utils/addInvestmentCategory';

// Load environment variables
require('dotenv').config();

const runScript = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Add Investment category
    await addInvestmentCategory();

    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

runScript();