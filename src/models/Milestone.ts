import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    title: { type: String, required: true },
    description: { type: String },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    target_date: { type: Date },
    completed_date: { type: Date },
    is_completed: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verified_at: { type: Date },
    verification_notes: { type: String },
    evidence_photos: { type: [Object], default: [] },
    order_index: { type: Number, default: 0 },
}, { timestamps: true });

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
