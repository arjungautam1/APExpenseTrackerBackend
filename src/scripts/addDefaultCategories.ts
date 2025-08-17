import mongoose from 'mongoose';
import Category from '../models/Category';
import dotenv from 'dotenv';

dotenv.config();

const defaultCategories = [
  // Expense Categories
  {
    name: 'Food & Dining',
    type: 'expense',
    icon: 'utensils',
    color: '#EF4444',
    isDefault: true
  },
  {
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#F59E0B',
    isDefault: true
  },
  {
    name: 'Shopping',
    type: 'expense',
    icon: 'shopping-bag',
    color: '#8B5CF6',
    isDefault: true
  },
  {
    name: 'Bills & Utilities',
    type: 'expense',
    icon: 'zap',
    color: '#06B6D4',
    isDefault: true
  },
  {
    name: 'Entertainment',
    type: 'expense',
    icon: 'music',
    color: '#EC4899',
    isDefault: true
  },
  {
    name: 'Healthcare',
    type: 'expense',
    icon: 'heart',
    color: '#10B981',
    isDefault: true
  },
  {
    name: 'Education',
    type: 'expense',
    icon: 'book-open',
    color: '#6366F1',
    isDefault: true
  },
  {
    name: 'Travel',
    type: 'expense',
    icon: 'plane',
    color: '#F97316',
    isDefault: true
  },
  {
    name: 'Personal Care',
    type: 'expense',
    icon: 'scissors',
    color: '#84CC16',
    isDefault: true
  },
  {
    name: 'Home & Garden',
    type: 'expense',
    icon: 'home',
    color: '#22C55E',
    isDefault: true
  },
  {
    name: 'Gifts & Donations',
    type: 'expense',
    icon: 'gift',
    color: '#E91E63',
    isDefault: true
  },
  {
    name: 'Investment',
    type: 'expense',
    icon: 'trending-up',
    color: '#6366F1',
    isDefault: true
  },
  {
    name: 'Other Expenses',
    type: 'expense',
    icon: 'tag',
    color: '#6B7280',
    isDefault: true
  },

  // Income Categories
  {
    name: 'Salary',
    type: 'income',
    icon: 'briefcase',
    color: '#10B981',
    isDefault: true
  },
  {
    name: 'Freelance',
    type: 'income',
    icon: 'laptop',
    color: '#3B82F6',
    isDefault: true
  },
  {
    name: 'Investment Returns',
    type: 'income',
    icon: 'trending-up',
    color: '#8B5CF6',
    isDefault: true
  },
  {
    name: 'Business',
    type: 'income',
    icon: 'building',
    color: '#F59E0B',
    isDefault: true
  },
  {
    name: 'Gifts',
    type: 'income',
    icon: 'gift',
    color: '#EC4899',
    isDefault: true
  },
  {
    name: 'Refunds',
    type: 'income',
    icon: 'rotate-ccw',
    color: '#06B6D4',
    isDefault: true
  },
  {
    name: 'Other Income',
    type: 'income',
    icon: 'tag',
    color: '#6B7280',
    isDefault: true
  },

  // Investment Categories
  {
    name: 'Stocks',
    type: 'investment',
    icon: 'trending-up',
    color: '#10B981',
    isDefault: true
  },
  {
    name: 'Mutual Funds',
    type: 'investment',
    icon: 'pie-chart',
    color: '#3B82F6',
    isDefault: true
  },
  {
    name: 'Cryptocurrency',
    type: 'investment',
    icon: 'bitcoin',
    color: '#F59E0B',
    isDefault: true
  },
  {
    name: 'Real Estate',
    type: 'investment',
    icon: 'home',
    color: '#8B5CF6',
    isDefault: true
  },
  {
    name: 'Bonds',
    type: 'investment',
    icon: 'shield',
    color: '#06B6D4',
    isDefault: true
  },
  {
    name: 'ETFs',
    type: 'investment',
    icon: 'bar-chart',
    color: '#EC4899',
    isDefault: true
  },
  {
    name: 'Retirement',
    type: 'investment',
    icon: 'calendar',
    color: '#F97316',
    isDefault: true
  },
  {
    name: 'Other Investments',
    type: 'investment',
    icon: 'tag',
    color: '#6B7280',
    isDefault: true
  }
];

async function addDefaultCategories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing default categories
    await Category.deleteMany({ isDefault: true });
    console.log('Cleared existing default categories');

    // Add new default categories
    const createdCategories = await Category.insertMany(defaultCategories);
    console.log(`Successfully added ${createdCategories.length} default categories`);

    // Log the categories by type
    const expenses = createdCategories.filter(cat => cat.type === 'expense');
    const incomes = createdCategories.filter(cat => cat.type === 'income');
    const investments = createdCategories.filter(cat => cat.type === 'investment');

    console.log('\n📊 Categories Summary:');
    console.log(`💰 Expenses: ${expenses.length} categories`);
    expenses.forEach(cat => console.log(`  - ${cat.name}`));
    
    console.log(`💵 Income: ${incomes.length} categories`);
    incomes.forEach(cat => console.log(`  - ${cat.name}`));
    
    console.log(`📈 Investments: ${investments.length} categories`);
    investments.forEach(cat => console.log(`  - ${cat.name}`));

    console.log('\n✅ Default categories added successfully!');
  } catch (error) {
    console.error('Error adding default categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addDefaultCategories();
