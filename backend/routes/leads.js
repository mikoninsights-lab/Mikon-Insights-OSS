import express from 'express';
import { leadSchema, leadUpdateSchema, validate } from '../utils/validators.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} from '../controllers/leads.controller.js';

const router = express.Router();

router.get('/', authenticateToken, getLeads);
router.get('/:id', authenticateToken, getLeadById);
router.post('/', authenticateToken, validate(leadSchema), createLead);
router.put('/:id', authenticateToken, validate(leadUpdateSchema), updateLead);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteLead);

export default router;
