import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['Project', 'Expense', 'Service', 'Lead'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityLabel: {
    type: String,
    default: ''
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
