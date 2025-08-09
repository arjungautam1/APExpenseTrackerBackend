import Category from '../models/Category';

export const seedDefaultCategories = async (): Promise<void> => {
  try {
    // Check if default categories already exist
    const existingCount = await Category.countDocuments({ isDefault: true });
    if (existingCount > 0) {
      console.log('Default categories already exist');
      return;
    }

    const defaultCategories = [
      // Expense Categories
      { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#EF4444' },
      { name: 'Groceries', type: 'expense', icon: 'shopping-bag', color: '#10B981' },
      { name: 'Transportation', type: 'expense', icon: 'car', color: '#3B82F6' },
      { name: 'Bills & Utilities', type: 'expense', icon: 'zap', color: '#F59E0B' },
      { name: 'Entertainment', type: 'expense', icon: 'film', color: '#8B5CF6' },
      { name: 'Healthcare', type: 'expense', icon: 'heart', color: '#EF4444' },
      { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#10B981' },
      { name: 'Education', type: 'expense', icon: 'book', color: '#6366F1' },
      { name: 'Travel', type: 'expense', icon: 'plane', color: '#06B6D4' },
      { name: 'Personal Care', type: 'expense', icon: 'user', color: '#EC4899' },
      { name: 'Home & Garden', type: 'expense', icon: 'home', color: '#84CC16' },
      { name: 'Gifts & Donations', type: 'expense', icon: 'gift', color: '#F97316' },
      { name: 'Other Expenses', type: 'expense', icon: 'more-horizontal', color: '#6B7280' },

      // Income Categories
      { name: 'Salary', type: 'income', icon: 'briefcase', color: '#10B981' },
      { name: 'Freelance', type: 'income', icon: 'laptop', color: '#3B82F6' },
      { name: 'Investment Returns', type: 'income', icon: 'trending-up', color: '#8B5CF6' },
      { name: 'Business Income', type: 'income', icon: 'building', color: '#F59E0B' },
      { name: 'Rental Income', type: 'income', icon: 'home', color: '#06B6D4' },
      { name: 'Bonus', type: 'income', icon: 'award', color: '#EF4444' },
      { name: 'Other Income', type: 'income', icon: 'plus', color: '#6B7280' }
    ];

    await Category.insertMany(
      defaultCategories.map(cat => ({
        ...cat,
        isDefault: true
      }))
    );

    console.log('Default categories seeded successfully');
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
};