import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    accountType: {
        type: String,
        enum: ['seller', 'user'], // Allowed values
        default: 'user', // Default account type
        required: true
    },
    phone: {
        type: String,
        required: false
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);