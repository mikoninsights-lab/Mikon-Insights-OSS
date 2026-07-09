import express from 'express';
import { projectSchema, projectUpdateSchema, validate } from '../utils/validators.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projects.controller.js';

const router = express.Router();

router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProjectById);
router.post('/', authenticateToken, validate(projectSchema), createProject);
router.put('/:id', authenticateToken, validate(projectUpdateSchema), updateProject);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteProject);

export default router;
