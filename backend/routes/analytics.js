import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboardAnalytics, calculateROISimulation } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboardAnalytics);
router.post('/roi-simulator', authenticateToken, calculateROISimulation);

export default router;
