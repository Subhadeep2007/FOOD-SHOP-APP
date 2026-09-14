import Coupon
from "../../models/coupon.model.js";


// ========================================
// CREATE COUPON
// ========================================

const createCoupon = async({
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minimumOrderAmount,
    usageLimit,
    perUserLimit,
    startsAt,
    expiresAt
}) => {

    const normalizedCode =
        code.trim().toUpperCase();


    const existingCoupon =
        await Coupon.findOne({

            code: normalizedCode

        });


    if (existingCoupon) {

        const error =
            new Error(
                "Coupon code already exists"
            );

        error.statusCode = 409;

        throw error;
    }


    if (
        discountType === "PERCENTAGE" &&
        Number(discountValue) > 100
    ) {

        const error =
            new Error(
                "Percentage discount cannot exceed 100"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        new Date(expiresAt) <=
        new Date(startsAt)
    ) {

        const error =
            new Error(
                "Expiry date must be after start date"
            );

        error.statusCode = 400;

        throw error;
    }


    const coupon =
        await Coupon.create({

            code: normalizedCode,

            description: description || "",

            discountType,

            discountValue: Number(discountValue),

            maxDiscount: maxDiscount === undefined ||
                maxDiscount === null ||
                maxDiscount === "" ?
                null : Number(maxDiscount),

            minimumOrderAmount: minimumOrderAmount === undefined ||
                minimumOrderAmount === null ||
                minimumOrderAmount === "" ?
                0 : Number(minimumOrderAmount),

            usageLimit: usageLimit === undefined ||
                usageLimit === null ||
                usageLimit === "" ?
                null : Number(usageLimit),

            perUserLimit: perUserLimit === undefined ||
                perUserLimit === null ||
                perUserLimit === "" ?
                1 : Number(perUserLimit),

            startsAt: new Date(startsAt),

            expiresAt: new Date(expiresAt),

            isActive: true

        });


    return coupon;
};


// ========================================
// GET ALL COUPONS
// ========================================

const getAllCoupons = async() => {

    return Coupon.find({})
        .sort({

            createdAt: -1

        });
};


// ========================================
// GET SINGLE COUPON
// ========================================

const getCouponById = async(
    couponId
) => {

    return Coupon.findById(
        couponId
    );
};


// ========================================
// UPDATE COUPON
// ========================================

const updateCoupon = async(
    couponId,
    data
) => {

    const coupon =
        await Coupon.findById(
            couponId
        );


    if (!coupon) {

        const error =
            new Error(
                "Coupon not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        data.code !== undefined
    ) {

        const normalizedCode =
            data.code
            .trim()
            .toUpperCase();


        const existingCoupon =
            await Coupon.findOne({

                code: normalizedCode,

                _id: {
                    $ne: couponId
                }

            });


        if (existingCoupon) {

            const error =
                new Error(
                    "Coupon code already exists"
                );

            error.statusCode = 409;

            throw error;
        }


        coupon.code =
            normalizedCode;
    }


    if (
        data.description !== undefined
    ) {

        coupon.description =
            data.description;
    }


    if (
        data.discountType !== undefined
    ) {

        coupon.discountType =
            data.discountType;
    }


    if (
        data.discountValue !== undefined
    ) {

        coupon.discountValue =
            Number(
                data.discountValue
            );
    }


    if (
        data.maxDiscount !== undefined
    ) {

        coupon.maxDiscount =
            data.maxDiscount === null ||
            data.maxDiscount === "" ?
            null :
            Number(
                data.maxDiscount
            );
    }


    if (
        data.minimumOrderAmount !== undefined
    ) {

        coupon.minimumOrderAmount =
            Number(
                data.minimumOrderAmount
            );
    }


    if (
        data.usageLimit !== undefined
    ) {

        coupon.usageLimit =
            data.usageLimit === null ||
            data.usageLimit === "" ?
            null :
            Number(
                data.usageLimit
            );
    }


    if (
        data.perUserLimit !== undefined
    ) {

        coupon.perUserLimit =
            Number(
                data.perUserLimit
            );
    }


    if (
        data.startsAt !== undefined
    ) {

        coupon.startsAt =
            new Date(
                data.startsAt
            );
    }


    if (
        data.expiresAt !== undefined
    ) {

        coupon.expiresAt =
            new Date(
                data.expiresAt
            );
    }


    if (
        coupon.discountType ===
        "PERCENTAGE" &&
        coupon.discountValue > 100
    ) {

        const error =
            new Error(
                "Percentage discount cannot exceed 100"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        new Date(coupon.expiresAt) <=
        new Date(coupon.startsAt)
    ) {

        const error =
            new Error(
                "Expiry date must be after start date"
            );

        error.statusCode = 400;

        throw error;
    }


    await coupon.save();


    return coupon;
};


// ========================================
// UPDATE COUPON STATUS
// ========================================

const updateCouponStatus = async(
    couponId,
    isActive
) => {

    const coupon =
        await Coupon.findById(
            couponId
        );


    if (!coupon) {

        const error =
            new Error(
                "Coupon not found"
            );

        error.statusCode = 404;

        throw error;
    }


    coupon.isActive =
        Boolean(isActive);


    await coupon.save();


    return coupon;
};


// ========================================
// DELETE COUPON
// ========================================

const deleteCoupon = async(
    couponId
) => {

    const coupon =
        await Coupon.findById(
            couponId
        );


    if (!coupon) {

        const error =
            new Error(
                "Coupon not found"
            );

        error.statusCode = 404;

        throw error;
    }


    await coupon.deleteOne();


    return true;
};


// ========================================
// EXPORTS
// ========================================

export {

    createCoupon,

    getAllCoupons,

    getCouponById,

    updateCoupon,

    updateCouponStatus,

    deleteCoupon

};