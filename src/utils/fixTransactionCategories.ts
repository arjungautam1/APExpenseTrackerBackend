import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

export const fixTransactionCategories = async (): Promise<void> => {
  try {
    console.log('Starting transaction category fix...');
    
    // Get default categories by type
    const expenseCategories = await Category.find({ type: 'expense', isDefault: true });
    const incomeCategories = await Category.find({ type: 'income', isDefault: true });
    const investmentCategories = await Category.find({ type: 'investment', isDefault: true });
    
    // Debug: log category details
    console.log('Expense categories:', expenseCategories.map(c => ({ id: c._id, name: c.name })));
    console.log('Investment categories:', investmentCategories.map(c => ({ id: c._id, name: c.name })));
    
    console.log(`Found ${expenseCategories.length} expense categories`);
    console.log(`Found ${incomeCategories.length} income categories`);
    console.log(`Found ${investmentCategories.length} investment categories`);
    
    // Get all existing category IDs
    const allCategories = await Category.find({});
    const validCategoryIds = allCategories.map(c => (c._id as any).toString());
    
    // Find transactions with invalid categoryId (null or non-existent)
    const allTransactions = await Transaction.find({});
    console.log('Sample transactions:', allTransactions.slice(0, 3).map(t => ({ id: t._id, type: t.type, categoryId: t.categoryId, desc: t.description })));
    
    const brokenTransactions = allTransactions.filter(t => 
      !t.categoryId || !validCategoryIds.includes((t.categoryId as any).toString())
    );
    console.log(`Found ${brokenTransactions.length} transactions with invalid categoryId`);
    
    if (brokenTransactions.length > 0) {
      console.log('Sample broken transactions:', brokenTransactions.slice(0, 3).map(t => ({ id: t._id, type: t.type, categoryId: t.categoryId, desc: t.description })));
    }
    
    if (brokenTransactions.length === 0) {
      console.log('No transactions to fix.');
      return;
    }
    
    // Fix each transaction based on its type and description
    for (const transaction of brokenTransactions) {
      let assignedCategory = null;
      
      if (transaction.type === 'expense') {
        // Try to assign based on description or default to "Other Expenses"
        const description = transaction.description?.toLowerCase() || '';
        
        if (description.includes('grocery') || description.includes('food')) {
          assignedCategory = expenseCategories.find(c => c.name === 'Food & Dining') || 
                           expenseCategories.find(c => c.name === 'Groceries');
        } else if (description.includes('investment')) {
          // These were likely investment transactions that got miscategorized
          assignedCategory = expenseCategories.find(c => c.name === 'Other Expenses');
        } else if (description.includes('transport') || description.includes('uber') || description.includes('taxi')) {
          assignedCategory = expenseCategories.find(c => c.name === 'Transportation');
        } else if (description.includes('bill') || description.includes('utility')) {
          assignedCategory = expenseCategories.find(c => c.name === 'Bills & Utilities');
        } else {
          // Default to "Other Expenses"
          assignedCategory = expenseCategories.find(c => c.name === 'Other Expenses');
        }
      } else if (transaction.type === 'income') {
        // Default to "Other Income"
        assignedCategory = incomeCategories.find(c => c.name === 'Other Income') || 
                          incomeCategories.find(c => c.name === 'Salary');
      } else if (transaction.type === 'investment') {
        // Assign to investment transaction category
        assignedCategory = investmentCategories.find(c => c.name === 'Investment Transaction') ||
                          investmentCategories.find(c => c.name === 'Investment');
      }
      
      if (assignedCategory) {
        await Transaction.updateOne(
          { _id: transaction._id },
          { categoryId: (assignedCategory._id as any) }
        );
        console.log(`Fixed transaction ${transaction._id}: ${transaction.description || 'No description'} -> ${assignedCategory.name}`);
      } else {
        console.log(`Could not find appropriate category for transaction ${transaction._id} (type: ${transaction.type})`);
      }
    }
    
    console.log('Transaction category fix completed.');
    
  } catch (error) {
    console.error('Error fixing transaction categories:', error);
    throw error;
  }
};