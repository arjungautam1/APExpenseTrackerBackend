import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';

// @desc    Get all categories for user (including default ones)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;

    // Build query - get user's categories and default categories
    const query: any = {
      $or: [
        { userId: req.user?.id },
        { isDefault: true }
      ]
    };

    if (type && ['income', 'expense', 'investment'].includes(type)) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get categories'
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user?.id },
        { isDefault: true }
      ]
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get category'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, icon, color, parentCategoryId } = req.body;

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      userId: req.user?.id,
      type
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
      return;
    }

    const category = await Category.create({
      name,
      type,
      icon: icon || 'tag',
      color: color || '#6B7280',
      userId: req.user?.id,
      parentCategoryId,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, color, parentCategoryId } = req.body;

    // Find category (only user's categories can be updated, not default ones)
    let category = await Category.findOne({
      _id: req.params.id,
      userId: req.user?.id,
      isDefault: false
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found or cannot be modified'
      });
      return;
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        userId: req.user?.id,
        type: category.type,
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
        return;
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name || category.name,
        icon: icon || category.icon,
        color: color || category.color,
        parentCategoryId: parentCategoryId !== undefined ? parentCategoryId : category.parentCategoryId
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found after update'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find category (only user's categories can be deleted, not default ones)
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user?.id,
      isDefault: false
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found or cannot be deleted'
      });
      return;
    }

    // TODO: Check if category is being used by any transactions
    // For now, we'll allow deletion but in production you might want to prevent this
    // or move transactions to a default "Uncategorized" category

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete category'
    });
  }
};