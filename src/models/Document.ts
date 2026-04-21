import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    document_type: { type: String, required: true },
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    file_size: { type: Number },
    mime_type: { type: String },
    is_verified: { type: Boolean, default: false },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verified_at: { type: Date },
    rejection_reason: { type: String },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uploader_role: { type: String, enum: ['citizen', 'panchayat_officer', 'government_officer', 'admin'], default: 'panchayat_officer' },
}, { timestamps: true });

export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
