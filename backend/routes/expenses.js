import express from 'express';
import { fixedCostSchema, fixedCostUpdateSchema, validate } from '../utils/validators.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary
} from '../controllers/expenses.controller.js';

const router = express.Router();

router.get('/', authenticateToken, getExpenses);
router.get('/summary/monthly', authenticateToken, getMonthlySummary);
router.get('/:id', authenticateToken, getExpenseById);
router.post('/', authenticateToken, validate(fixedCostSchema), createExpense);
router.put('/:id', authenticateToken, validate(fixedCostUpdateSchema), updateExpense);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteExpense);

export default router;
