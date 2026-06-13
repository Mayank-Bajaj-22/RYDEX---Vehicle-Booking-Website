import mongoose, { Document } from "mongoose"

type VideoKycStatus = "not_required" | "pending" | "in_progress" | "approved" | "rejected"

export interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    createdAt: Date,
    updatedAt: Date,
    isEmailVerified?: Boolean,
    otp?: string,
    mobileNumber?: string,
    otpExpiresIn?: Date,
    partnerOnboardingStep: number,
    rejectionReason?: string,
    videoKycStatus: VideoKycStatus,
    videoKycRoomId: string,
    videoKycRejectionReason: string,
    partnerStatus: "pending" | "approved" | "rejected",
    role: "user" | "partner" | "admin"
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required field!"]
    },
    email: {
        type: String,
        required: [true, "Email is required field!"],
        unique: [true, "Email is already exists!"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address!"],
    },
    password: {
        type: String
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "partner", "admin"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpiresIn: {
        type: Date
    },
    mobileNumber: {
        type: String,
        match: [/^\d{10}$/, "Invalid mobile number! Must be 10 digits."]
    },
    partnerOnboardingStep: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    partnerStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    videoKycStatus: {
        type: String,
        enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
        default: "not_required"
    },
    videoKycRoomId: {
        type: String
    },
    videoKycRejectionReason: {
        type: String
    }
}, {
    timestamps: true
})

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;