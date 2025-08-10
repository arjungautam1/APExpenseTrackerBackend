import Category from '../models/Category';

export const addInvestmentCategory = async (): Promise<void> => {
  try {
    // Check if Investment category already exists
    const existingCategory = await Category.findOne({ 
      name: 'Investment', 
      type: 'expense',
      isDefault: true 
    });

    if (existingCategory) {
      console.log('Investment category already exists');
      return;
    }

    // Create the Investment category
    const investmentCategory = {
      name: 'Investment',
      type: 'expense',
      icon: 'trending-up',
      color: '#6366F1',
      isDefault: true
    };

    await Category.create(investmentCategory);
    console.log('Investment category added successfully');
  } catch (error) {
    console.error('Error adding Investment category:', error);
  }
};