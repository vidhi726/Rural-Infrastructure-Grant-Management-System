import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema({
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    installment_number: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'released', 'utilized', 'verified'], default: 'pending' },
    due_date: { type: Date },
    released_date: { type: Date },
    released_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    utilized_date: { type: Date },
    verification_notes: { type: String },
}, { timestamps: true });

export const Installment = mongoose.models.Installment || mongoose.model('Installment', installmentSchema);
