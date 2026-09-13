import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon
} from "../../services/admin/coupon.service.js";


// ========================================
// CREATE COUPON
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const coupon =
            await createCoupon({

                code: req.body.code,

                description: req.body.description,

                discountType: req.body.discountType,

                discountValue: req.body.discountValue,

                maxDiscount: req.body.maxDiscount,

                minimumOrderAmount: req.body.minimumOrderAmount,

                usageLimit: req.body.usageLimit,

                perUserLimit: req.body.perUserLimit,

                startsAt: req.body.startsAt,

                expiresAt: req.body.expiresAt

            });


        return res.status(201).json({

            success: true,

            message: "Coupon created successfully",

            data: coupon

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// GET ALL COUPONS
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const coupons =
            await getAllCoupons();


        return res.status(200).json({

            success: true,

            data: coupons

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// GET SINGLE COUPON
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const coupon =
            await getCouponById(
                req.params.id
            );


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message: "Coupon not found"

            });
        }


        return res.status(200).json({

            success: true,

            data: coupon

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE COUPON
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const coupon =
            await updateCoupon(

                req.params.id,

                req.body

            );


        return res.status(200).json({

            success: true,

            message: "Coupon updated successfully",

            data: coupon

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE COUPON STATUS
// ========================================

const updateStatus = async(
    req,
    res,
    next
) => {

    try {

        const coupon =
            await updateCouponStatus(

                req.params.id,

                req.body.isActive

            );


        return res.status(200).json({

            success: true,

            message: "Coupon status updated successfully",

            data: coupon

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE COUPON
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        await deleteCoupon(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message: "Coupon deleted successfully"

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// EXPORTS
// ========================================

export {

    create,

    getAll,

    getOne,

    update,

    updateStatus,

    remove

};