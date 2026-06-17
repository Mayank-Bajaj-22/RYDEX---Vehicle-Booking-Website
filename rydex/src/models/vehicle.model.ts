import mongoose from "mongoose";

export type vehicleType = "bike" | "car" | "loading" | "truck" | "auto";

export interface IVehicle {
    owner: mongoose.Types.ObjectId,
    type: vehicleType,
    vehicleModel: string,
    number: string,
    imageUrl?: string,
    baseFare?: number,
    pricePerKm?: number,
    waitingCharge?: number,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

const vehicleSchema = new mongoose.Schema<IVehicle>({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    type: {
        type: String,
        enum: ["bike", "car", "loading", "truck", "auto"],
        required: true
    },
    number: {
        type: String,
        required: true,
        unique: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    baseFare: {
        type: Number,
        required: false
    },
    pricePerKm: {
        type: Number
    },
    waitingCharge: {
        type: Number
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;