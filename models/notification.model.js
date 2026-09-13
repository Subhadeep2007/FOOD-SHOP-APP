import mongoose from "mongoose";

const notificationSchema =
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        type: {
            type: String,
            enum: [
                "ORDER",
                "PAYMENT",
                "REFUND",
                "COUPON",
                "REVIEW",
                "SYSTEM"
            ],
            default: "SYSTEM"
        },

        title: {
            type: String,
            required: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            maxlength: 500
        },

        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true
        },

        readAt: {
            type: Date,
            default: null
        }
    }, {
        timestamps: true
    });


const Notification =
    mongoose.models.Notification ||
    mongoose.model(
        "Notification",
        notificationSchema
    );

export default Notification;