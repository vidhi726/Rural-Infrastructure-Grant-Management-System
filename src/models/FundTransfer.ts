import mongoose from 'mongoose';

const fundTransferSchema = new mongoose.Schema({
    installment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Installment', required: true, unique: true },
    amount: { type: Number, required: true },
    transaction_id: { type: String },
    bank_reference: { type: String },
    transfer_mode: { type: String, default: 'NEFT' },
    transferred_at: { type: Date, default: Date.now },
    transferred_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient_account_number: { type: String },
    recipient_bank_name: { type: String },
    recipient_ifsc: { type: String },
    status: { type: String, default: 'completed' },
}, { timestamps: true });

export const FundTransfer = mongoose.models.FundTransfer || mongoose.model('FundTransfer', fundTransferSchema);
