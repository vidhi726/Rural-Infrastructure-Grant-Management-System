import mongoose from 'mongoose';

const grantSchemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['roads', 'water', 'education', 'power', 'agriculture', 'healthcare'], required: true },
    max_amount: { type: Number, required: true },
    min_amount: { type: Number, default: 0 },
    installment_count: { type: Number, default: 1 },
    time_gap_days: { type: Number, default: 30 },
    required_documents: { type: [Object], default: [] },
    eligibility_criteria: { type: Object, default: {} },
    is_active: { type: Boolean, default: true },
    valid_from: { type: Date },
    valid_until: { type: Date },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const GrantScheme = mongoose.models.GrantScheme || mongoose.model('GrantScheme', grantSchemeSchema);
