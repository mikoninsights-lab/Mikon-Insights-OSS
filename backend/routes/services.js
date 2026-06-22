import express from 'express';
import { Service } from '../models/index.js';
import { serviceSchema, serviceUpdateSchema, validate } from '../utils/validators.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all services
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, isActive, isScalable } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isScalable !== undefined) filter.isScalable = isScalable === 'true';

    const services = await Service.find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// Get service by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service'
    });
  }
});

// Create service
router.post('/', authenticateToken, requireRole('Admin'), validate(serviceSchema), async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service'
    });
  }
});

// Update service
router.put('/:id', authenticateToken, requireRole('Admin'), validate(serviceUpdateSchema), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service'
    });
  }
});

// Delete service
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service'
    });
  }
});

export default router;
