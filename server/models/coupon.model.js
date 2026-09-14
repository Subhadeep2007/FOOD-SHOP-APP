import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },

    description: {
        type: String,
        default: ""
    },

    discountType: {
        type: String,
        enum: [
            "PERCENTAGE",
            "FIXED"
        ],
        required: true
    },

    discountValue: {
        type: Number,
        required: true,
        min: 0
    },

    maxDiscount: {
        type: Number,
        default: null,
        min: 0
    },

    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    usageLimit: {
        type: Number,
        default: null,
        min: 1
    },

    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },

    perUserLimit: {
        type: Number,
        default: 1,
        min: 1
    },

    startsAt: {
        type: Date,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});


const Coupon =
    mongoose.models.Coupon ||
    mongoose.model(
        "Coupon",
        couponSchema
    );

export default Coupon;