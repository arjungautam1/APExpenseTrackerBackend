import mongoose from 'mongoose';
import { fixTransactionCategories } from '../utils/fixTransactionCategories';

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
    console.log('Database connected.');
    
    await fixTransactionCategories();
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();