import mongoose from "mongoose";

const couponUsageSchema =
    new mongoose.Schema({
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        discountAmount: {
            type: Number,
            required: true,
            min: 0
        }
    }, {
        timestamps: true
    });


couponUsageSchema.index({
    coupon: 1,
    user: 1
});


const CouponUsage =
    mongoose.models.CouponUsage ||
    mongoose.model(
        "CouponUsage",
        couponUsageSchema
    );

export default CouponUsage;