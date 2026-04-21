import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    category: { type: String },
    is_public: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
