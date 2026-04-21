import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    application_number: { type: String, unique: true, required: true },
    village_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', required: true },
    scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GrantScheme', required: true },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    requested_amount: { type: Number, required: true },
    approved_amount: { type: Number },
    status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'draft' },
    priority: { type: Number, default: 5 },
    rejection_reason: { type: String },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved_at: { type: Date },
    completion_percentage: { type: Number, default: 0 },
    expected_completion_date: { type: Date },
    actual_completion_date: { type: Date },
    geo_location: { type: Object },
    installments: {
        type: [{
            installmentNumber: { type: Number, required: true },
            amount: { type: Number, required: true },
            releaseDate: { type: Date, default: Date.now },
            status: { type: String, enum: ['Released', 'Pending'], default: 'Released' },
            remarks: { type: String }
        }],
        default: []
    },
    totalReleasedAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to generate application number
applicationSchema.pre('validate', async function () {
    if (!this.application_number) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Application').countDocuments();
        this.application_number = `RIGMS-${year}-${String(count + 1).padStart(6, '0')}`;
    }
});

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
