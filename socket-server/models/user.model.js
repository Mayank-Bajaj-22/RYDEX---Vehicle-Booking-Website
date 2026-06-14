import mongoose, { Document } from "mongoose"

const userSchema = new mongoose.Schema({
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
    },
    socketId: {
        type: String,
        default: null
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: [Number]
    },
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
})

userSchema.index({ location: "2dsphere" })

const User = mongoose.model("User", userSchema);
export default User;