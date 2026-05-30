import mongoose from "mongoose";

interface IPartnerBank {
    owner: mongoose.Types.ObjectId,
    accountHolder: string,
    accountNumber: string,
    ifscCode: string,
    upi?: string,
    status: "not_added" | "added" | "verified",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>({
    owner: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    accountHolder: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    ifscCode: {
        type: String,
        required: true,
        uppercase: true
    },
    upi: {
        type: String
    },
    status: {
        type: String,
        enum: ["not_added", "added", "verified"],
        default: "not_added"
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true })

const PartnerBank = mongoose.models.PartnerBank || mongoose.model("PartnerBank", partnerBankSchema);

export default PartnerBank;
