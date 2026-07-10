import { Lead } from '../models/index.js';
import { logAudit } from '../utils/auditLogger.js';

export const getLeads = async (req, res) => {
  try {
    const { stage } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;

    const leads = await Lead.find(filter)
      .populate('interestedService', 'name category')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads'
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('interestedService', 'name category').lean();
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead'
    });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();

    logAudit({
      user: req.user,
      action: 'create',
      entityType: 'Lead',
      entityId: lead._id,
      entityLabel: lead.name,
      changes: lead.toObject()
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead'
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.stage) {
      updateData.stageUpdatedAt = new Date();
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    logAudit({
      user: req.user,
      action: 'update',
      entityType: 'Lead',
      entityId: lead._id,
      entityLabel: lead.name,
      changes: req.body
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead'
    });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    logAudit({
      user: req.user,
      action: 'delete',
      entityType: 'Lead',
      entityId: lead._id,
      entityLabel: lead.name
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead'
    });
  }
};
