import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateContent } from '../controllers/ghostwriter.controller.js';

const router = express.Router();

router.post('/generate', authenticateToken, generateContent);

export default router;
