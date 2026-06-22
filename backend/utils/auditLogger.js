import { AuditLog } from '../models/index.js';

// Fire-and-forget: never await this in a route handler.
// The response goes out to the user immediately; the log write happens after.
// (PersonaCraft's MySQL audit log blocks its endpoint on this exact step — avoided here on purpose.)
export const logAudit = ({ user, action, entityType, entityId, entityLabel = '', changes = {} }) => {
  AuditLog.create({
    user: user.id,
    userEmail: user.email,
    action,
    entityType,
    entityId,
    entityLabel,
    changes
  }).catch((error) => {
    console.error('Audit log write failed:', error.message);
  });
};
