import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
    // ========================================
    // REGISTRATION INFORMATION
    // ========================================

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true
    },

    password: {
        type: String,
        required: true
    },

    // ========================================
    // ROLE
    // ========================================

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    // ========================================
    // OTP
    // ========================================

    verificationOTP: {
        type: String,
        required: true
    },

    verificationOTPExpire: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const PendingRegistration =
    mongoose.models.PendingRegistration ||
    mongoose.model(
        "PendingRegistration",
        pendingRegistrationSchema
    );

export default PendingRegistration;