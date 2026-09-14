import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // ========================================
    // BASIC INFORMATION
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
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    // ========================================
    // PROFILE
    // ========================================

    profileImage: {
        type: String,
        default: ""
    },

    // ========================================
    // EMAIL VERIFICATION
    // ========================================

    isEmailVerified: {
        type: Boolean,
        default: true
    },

    // ========================================
    // REFRESH SESSION
    // ========================================

    refreshToken: {
        type: String,
        default: null
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
    // ACCOUNT STATUS
    // ========================================

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

export default User;