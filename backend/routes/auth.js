import express from 'express';
import { userRegisterSchema, userLoginSchema, validate } from '../utils/validators.js';
import { authenticateToken } from '../middleware/auth.js';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', validate(userRegisterSchema), register);
router.post('/login', validate(userLoginSchema), login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;
