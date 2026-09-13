import {
    validateCoupon
} from "../../services/coupon/coupon.service.js";


// ========================================
// VALIDATE
// ========================================

const validate = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await validateCoupon({

                userId: req.user.userId,

                code: req.body.code,

                orderAmount: req.body.orderAmount

            });


        return res.status(200).json({

            success: true,

            message: "Coupon applied successfully",

            data: {

                couponId: result.coupon._id,

                code: result.coupon.code,

                discountAmount: result.discountAmount

            }

        });

    } catch (error) {

        next(error);
    }
};


export {
    validate
};