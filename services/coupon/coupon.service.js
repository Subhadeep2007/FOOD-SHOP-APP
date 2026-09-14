import Coupon from "../../models/coupon.model.js";
import CouponUsage from "../../models/couponUsage.model.js";


// ========================================
// VALIDATE COUPON
// ========================================

const validateCoupon = async({
    userId,
    code,
    orderAmount
}) => {

    const normalizedCode =
        code.trim().toUpperCase();


    const coupon =
        await Coupon.findOne({

            code: normalizedCode,

            isActive: true

        });


    if (!coupon) {

        const error =
            new Error(
                "Invalid coupon code"
            );

        error.statusCode = 400;

        throw error;
    }


    const now =
        new Date();


    if (
        now <
        coupon.startsAt ||
        now >
        coupon.expiresAt
    ) {

        const error =
            new Error(
                "Coupon is expired or not active yet"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >=
        coupon.usageLimit
    ) {

        const error =
            new Error(
                "Coupon usage limit reached"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        Number(orderAmount) <
        coupon.minimumOrderAmount
    ) {

        const error =
            new Error(
                `Minimum order amount is ₹${coupon.minimumOrderAmount}`
            );

        error.statusCode = 400;

        throw error;
    }


    const usageCount =
        await CouponUsage.countDocuments({

            coupon: coupon._id,

            user: userId

        });


    if (
        usageCount >=
        coupon.perUserLimit
    ) {

        const error =
            new Error(
                "You have already used this coupon the maximum allowed times"
            );

        error.statusCode = 400;

        throw error;
    }


    let discountAmount = 0;


    if (
        coupon.discountType ===
        "PERCENTAGE"
    ) {

        discountAmount =
            (
                Number(orderAmount) *
                coupon.discountValue
            ) / 100;


        if (
            coupon.maxDiscount !== null
        ) {

            discountAmount =
                Math.min(
                    discountAmount,
                    coupon.maxDiscount
                );
        }

    } else {

        discountAmount =
            coupon.discountValue;
    }


    discountAmount =
        Math.min(
            discountAmount,
            Number(orderAmount)
        );


    return {

        coupon,

        discountAmount: Number(
            discountAmount.toFixed(2)
        )

    };
};


export {
    validateCoupon
};