import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
    // ========================================
    // RELATIONS
    // ========================================

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true
    },

    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true,
        index: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // ========================================
    // REFUND TYPE
    // ========================================

    refundType: {
        type: String,
        enum: [
            "ONLINE_PAYMENT",
            "COD"
        ],
        required: true
    },

    // ========================================
    // REFUND REQUEST
    // ========================================

    requestedAmount: {
        type: Number,
        required: true,
        min: 0
    },

    approvedAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    // ========================================
    // COD REFUND AMOUNT
    // ========================================

    refundableFoodAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    nonRefundableAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    // ========================================
    // STATUS
    // ========================================

    status: {
        type: String,
        enum: [
            "REQUESTED",
            "UNDER_REVIEW",
            "APPROVED",
            "REJECTED",
            "PROCESSING",
            "COMPLETED",
            "FAILED"
        ],
        default: "REQUESTED",
        index: true
    },

    // ========================================
    // ADMIN
    // ========================================

    adminNote: {
        type: String,
        default: "",
        maxlength: 500
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    // ========================================
    // BANK DETAILS - COD REFUND
    // ========================================

    bankDetails: {
        accountHolderName: {
            type: String,
            default: ""
        },

        accountNumber: {
            type: String,
            default: ""
        },

        ifscCode: {
            type: String,
            default: ""
        },

        bankName: {
            type: String,
            default: ""
        },

        accountType: {
            type: String,
            enum: [
                "SAVINGS",
                "CURRENT",
                ""
            ],
            default: ""
        }
    },

    // ========================================
    // BANK TRANSFER
    // ========================================

    bankTransferReference: {
        type: String,
        default: ""
    },

    bankTransferCompletedAt: {
        type: Date,
        default: null
    },

    // ========================================
    // RAZORPAY
    // ========================================

    razorpayPaymentId: {
        type: String,
        default: null
    },

    razorpayRefundId: {
        type: String,
        default: null,
        index: true
    },

    refundIdempotencyKey: {
        type: String,
        default: null
    },

    refundSpeed: {
        type: String,
        enum: [
            "normal",
            "optimum"
        ],
        default: "normal"
    },

    // ========================================
    // FAILURE
    // ========================================

    failureReason: {
        type: String,
        default: ""
    },

    // ========================================
    // COMPLETION
    // ========================================

    completedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});


const Refund =
    mongoose.models.Refund ||
    mongoose.model(
        "Refund",
        refundSchema
    );


export default Refund;