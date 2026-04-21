import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['citizen', 'panchayat_officer', 'government_officer', 'admin'], default: 'citizen' },
    state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
    district_id: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    village_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    avatar_url: { type: String },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
