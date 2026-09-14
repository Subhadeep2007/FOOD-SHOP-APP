import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    // ========================================
    // INTERNAL ORDER
    // ========================================

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
        index: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // ========================================
    // PAYMENT METHOD
    // ========================================

    paymentMethod: {
        type: String,
        enum: [
            "COD",
            "ONLINE"
        ],
        required: true
    },

    // ========================================
    // AMOUNT
    // ========================================

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    currency: {
        type: String,
        default: "INR"
    },

    // ========================================
    // INTERNAL PAYMENT STATUS
    // ========================================

    status: {
        type: String,
        enum: [
            "PENDING",
            "AUTHORIZED",
            "CAPTURED",
            "FAILED",
            "CANCELLED",
            "REFUND_PENDING",
            "PARTIALLY_REFUNDED",
            "REFUNDED"
        ],
        default: "PENDING",
        index: true
    },

    // ========================================
    // RAZORPAY
    // ========================================

    razorpayOrderId: {
        type: String,
        default: null,
        index: true
    },

    razorpayPaymentId: {
        type: String,
        default: null,
        index: true
    },

    razorpaySignature: {
        type: String,
        default: null
    },

    // ========================================
    // FAILURE
    // ========================================

    failureReason: {
        type: String,
        default: ""
    },

    // ========================================
    // CAPTURE
    // ========================================

    capturedAt: {
        type: Date,
        default: null
    },

    paidAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Payment =
    mongoose.models.Payment ||
    mongoose.model(
        "Payment",
        paymentSchema
    );

export default Payment;