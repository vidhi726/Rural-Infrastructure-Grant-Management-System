import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: mongoose.Schema.Types.ObjectId },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_role: { type: String },
    old_values: { type: mongoose.Schema.Types.Mixed },
    new_values: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
