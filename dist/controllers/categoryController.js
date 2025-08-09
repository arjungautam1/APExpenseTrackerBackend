"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
// @desc    Get all categories for user (including default ones)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const type = req.query.type;
        // Build query - get user's categories and default categories
        const query = {
            $or: [
                { userId: req.user?.id },
                { isDefault: true }
            ]
        };
        if (type && ['income', 'expense'].includes(type)) {
            query.type = type;
        }
        const categories = await Category_1.default.find(query).sort({ name: 1 });
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get categories'
        });
    }
};
exports.getCategories = getCategories;
// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findOne({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get category'
        });
    }
};
exports.getCategory = getCategory;
// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const { name, type, icon, color, parentCategoryId } = req.body;
        // Check if category name already exists for this user
        const existingCategory = await Category_1.default.findOne({
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
        const category = await Category_1.default.create({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create category'
        });
    }
};
exports.createCategory = createCategory;
// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        const { name, icon, color, parentCategoryId } = req.body;
        // Find category (only user's categories can be updated, not default ones)
        let category = await Category_1.default.findOne({
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
            const existingCategory = await Category_1.default.findOne({
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
        const updatedCategory = await Category_1.default.findByIdAndUpdate(req.params.id, {
            name: name || category.name,
            icon: icon || category.icon,
            color: color || category.color,
            parentCategoryId: parentCategoryId !== undefined ? parentCategoryId : category.parentCategoryId
        }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update category'
        });
    }
};
exports.updateCategory = updateCategory;
// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        // Find category (only user's categories can be deleted, not default ones)
        const category = await Category_1.default.findOne({
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
        await Category_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete category'
        });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map