import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
}, { timestamps: true });

export const State = mongoose.models.State || mongoose.model('State', stateSchema);
