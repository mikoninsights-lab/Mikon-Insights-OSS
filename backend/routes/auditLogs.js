import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getAuditLogs } from '../controllers/auditLogs.controller.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('Admin'), getAuditLogs);

export default router;
