import {
    body,
    param
} from "express-validator";


// ========================================
// VALIDATE CUSTOMER COUPON
// ========================================

const validateCouponSchema = [

    body("code")
    .trim()
    .isLength({
        min: 1,
        max: 50
    })
    .withMessage(
        "Valid coupon code is required"
    ),

    body("orderAmount")
    .isFloat({
        min: 0
    })
    .withMessage(
        "Order amount must be a valid positive number"
    )

];


// ========================================
// CREATE COUPON
// ========================================

const createCouponSchema = [

    body("code")
    .trim()
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Coupon code must be between 2 and 50 characters"
    ),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 300
    })
    .withMessage(
        "Description cannot exceed 300 characters"
    ),

    body("discountType")
    .isIn([
        "PERCENTAGE",
        "FIXED"
    ])
    .withMessage(
        "Discount type must be PERCENTAGE or FIXED"
    ),

    body("discountValue")
    .isFloat({
        min: 0
    })
    .withMessage(
        "Discount value must be 0 or greater"
    ),

    body("maxDiscount")
    .optional({
        nullable: true
    })
    .isFloat({
        min: 0
    })
    .withMessage(
        "Max discount must be 0 or greater"
    ),

    body("minimumOrderAmount")
    .optional()
    .isFloat({
        min: 0
    })
    .withMessage(
        "Minimum order amount must be 0 or greater"
    ),

    body("usageLimit")
    .optional({
        nullable: true
    })
    .isInt({
        min: 1
    })
    .withMessage(
        "Usage limit must be at least 1"
    ),

    body("perUserLimit")
    .optional()
    .isInt({
        min: 1
    })
    .withMessage(
        "Per-user limit must be at least 1"
    ),

    body("startsAt")
    .isISO8601()
    .withMessage(
        "Valid start date is required"
    ),

    body("expiresAt")
    .isISO8601()
    .withMessage(
        "Valid expiry date is required"
    )

];


// ========================================
// GET SINGLE COUPON
// ========================================

const couponIdSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid coupon ID is required"
    )

];


// ========================================
// UPDATE COUPON
// ========================================

const updateCouponSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid coupon ID is required"
    ),

    body("code")
    .optional()
    .trim()
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Coupon code must be between 2 and 50 characters"
    ),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 300
    })
    .withMessage(
        "Description cannot exceed 300 characters"
    ),

    body("discountType")
    .optional()
    .isIn([
        "PERCENTAGE",
        "FIXED"
    ])
    .withMessage(
        "Discount type must be PERCENTAGE or FIXED"
    ),

    body("discountValue")
    .optional()
    .isFloat({
        min: 0
    })
    .withMessage(
        "Discount value must be 0 or greater"
    ),

    body("maxDiscount")
    .optional({
        nullable: true
    })
    .isFloat({
        min: 0
    })
    .withMessage(
        "Max discount must be 0 or greater"
    ),

    body("minimumOrderAmount")
    .optional()
    .isFloat({
        min: 0
    })
    .withMessage(
        "Minimum order amount must be 0 or greater"
    ),

    body("usageLimit")
    .optional({
        nullable: true
    })
    .isInt({
        min: 1
    })
    .withMessage(
        "Usage limit must be at least 1"
    ),

    body("perUserLimit")
    .optional()
    .isInt({
        min: 1
    })
    .withMessage(
        "Per-user limit must be at least 1"
    ),

    body("startsAt")
    .optional()
    .isISO8601()
    .withMessage(
        "Invalid start date"
    ),

    body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage(
        "Invalid expiry date"
    )

];


// ========================================
// UPDATE COUPON STATUS
// ========================================

const updateCouponStatusSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid coupon ID is required"
    ),

    body("isActive")
    .isBoolean()
    .withMessage(
        "isActive must be true or false"
    )

];


// ========================================
// DELETE COUPON
// ========================================

const deleteCouponSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid coupon ID is required"
    )

];


// ========================================
// EXPORTS
// ========================================

export {

    validateCouponSchema,

    createCouponSchema,

    couponIdSchema,

    updateCouponSchema,

    updateCouponStatusSchema,

    deleteCouponSchema

};