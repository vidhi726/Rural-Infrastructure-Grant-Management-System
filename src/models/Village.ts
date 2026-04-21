import mongoose from 'mongoose';

const villageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    district_id: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    taluka: { type: String },
    population: { type: Number, default: 0 },
    area_sq_km: { type: Number },
    pincode: { type: String },
}, { timestamps: true });

export const Village = mongoose.models.Village || mongoose.model('Village', villageSchema);
