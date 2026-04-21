import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    complaint_number: { type: String, unique: true, required: true },
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    village_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'escalated', 'resolved', 'closed'], default: 'open' },
    priority: { type: Number, default: 3 },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution_notes: { type: String },
    resolved_at: { type: Date },
    evidence_photos: { type: [Object], default: [] },
    geo_location: { type: Object },
}, { timestamps: true });

// Pre-save hook to generate complaint number
complaintSchema.pre('validate', async function () {
    if (!this.complaint_number) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose.model('Complaint').countDocuments();
        this.complaint_number = `CMP-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
});

export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
