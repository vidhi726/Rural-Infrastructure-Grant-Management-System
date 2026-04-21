import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // NULL implies global
    type: { type: String, enum: ['scheme', 'application', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    is_read: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
