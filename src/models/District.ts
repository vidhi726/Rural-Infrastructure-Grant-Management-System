import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
}, { timestamps: true });

export const District = mongoose.models.District || mongoose.model('District', districtSchema);
