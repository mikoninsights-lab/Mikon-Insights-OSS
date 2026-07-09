import express from 'express';
import { serviceSchema, serviceUpdateSchema, validate } from '../utils/validators.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/services.controller.js';

const router = express.Router();

router.get('/', authenticateToken, getServices);
router.get('/:id', authenticateToken, getServiceById);
router.post('/', authenticateToken, requireRole('Admin'), validate(serviceSchema), createService);
router.put('/:id', authenticateToken, requireRole('Admin'), validate(serviceUpdateSchema), updateService);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteService);

export default router;
