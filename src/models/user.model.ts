import mongoose, { Document } from "mongoose"

interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    createdAt: Date,
    updatedAt: Date
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
    }
}, {
    timestamps: true
})

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;