import { FixedCost } from '../models/index.js';
import { logAudit } from '../utils/auditLogger.js';

export const getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { category, frequency, startDate, endDate } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (frequency) filter.frequency = frequency;
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      FixedCost.find(filter)
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FixedCost.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await FixedCost.findById(req.params.id).lean();
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense'
    });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = new FixedCost({
      ...req.body,
      dueDate: new Date(req.body.dueDate)
    });
    await expense.save();

    logAudit({
      user: req.user,
      action: 'create',
      entityType: 'Expense',
      entityId: expense._id,
      entityLabel: expense.concept,
      changes: expense.toObject()
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense'
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const expense = await FixedCost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    logAudit({
      user: req.user,
      action: 'update',
      entityType: 'Expense',
      entityId: expense._id,
      entityLabel: expense.concept,
      changes: req.body
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense'
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await FixedCost.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    logAudit({
      user: req.user,
      action: 'delete',
      entityType: 'Expense',
      entityId: expense._id,
      entityLabel: expense.name || expense.category
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
};

export const getMonthlySummary = async (req, res) => {
  try {
    const summary = await FixedCost.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$dueDate' },
            month: { $month: '$dueDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              amount: '$amount'
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summary'
    });
  }
};
