import mongoose from "mongoose";

interface IPartnerDocs {
    owner: mongoose.Types.ObjectId,
    aadharUrl: string,
    rcUrl: string,
    licenseUrl: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date
}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>({
    owner: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    aadharUrl: {
        type: String,
        required: true,
        unique: true
    },
    rcUrl: {
        type: String,
        required: true,
        unique: true
    },
    licenseUrl: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true })

const PartnerDocs = mongoose.models.PartnerDocs || mongoose.model("PartnerDocs", partnerDocsSchema);

export default PartnerDocs;
