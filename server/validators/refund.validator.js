import {
    body,
    param,
    query
} from "express-validator";


// ========================================
// CREATE REFUND REQUEST
// ========================================

const createRefundSchema = [

    body("orderId")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("amount")
    .optional()
    .isFloat({
        min: 0
    })
    .withMessage(
        "Refund amount must be a valid positive number"
    ),

    body("reason")
    .trim()
    .isLength({
        min: 1,
        max: 500
    })
    .withMessage(
        "Refund reason must be between 1 and 500 characters"
    ),

    body("bankDetails")
    .optional()
    .isObject()
    .withMessage(
        "Bank details must be a valid object"
    ),

    body("bankDetails.accountHolderName")
    .optional()
    .trim()
    .isLength({
        min: 1,
        max: 100
    })
    .withMessage(
        "Invalid account holder name"
    ),

    body("bankDetails.accountNumber")
    .optional()
    .trim()
    .isLength({
        min: 4,
        max: 30
    })
    .withMessage(
        "Invalid account number"
    ),

    body("bankDetails.ifscCode")
    .optional()
    .trim()
    .isLength({
        min: 4,
        max: 20
    })
    .withMessage(
        "Invalid IFSC code"
    ),

    body("bankDetails.bankName")
    .optional()
    .trim()
    .isLength({
        min: 1,
        max: 150
    })
    .withMessage(
        "Invalid bank name"
    ),

    body("bankDetails.accountType")
    .optional()
    .isIn([
        "SAVINGS",
        "CURRENT"
    ])
    .withMessage(
        "Account type must be SAVINGS or CURRENT"
    )

];


// ========================================
// GET MY REFUND
// ========================================

const refundIdSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid refund ID is required"
    )

];


// ========================================
// ADMIN REFUND LIST
// ========================================

const adminRefundQuerySchema = [

    query("status")
    .optional()
    .isIn([
        "REQUESTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "COMPLETED",
        "FAILED"
    ])
    .withMessage(
        "Invalid refund status"
    ),

    query("page")
    .optional()
    .isInt({
        min: 1
    })
    .withMessage(
        "Page must be at least 1"
    ),

    query("limit")
    .optional()
    .isInt({
        min: 1,
        max: 100
    })
    .withMessage(
        "Limit must be between 1 and 100"
    )

];


// ========================================
// ADMIN REJECT REFUND
// ========================================

const rejectRefundSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid refund ID is required"
    ),

    body("note")
    .optional()
    .trim()
    .isLength({
        max: 500
    })
    .withMessage(
        "Admin note cannot exceed 500 characters"
    )

];


// ========================================
// ADMIN APPROVE REFUND
// ========================================

const approveRefundSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid refund ID is required"
    ),

    body("approvedAmount")
    .optional()
    .isFloat({
        min: 0
    })
    .withMessage(
        "Approved amount must be a valid positive number"
    )

];


// ========================================
// ADMIN COMPLETE COD REFUND
// ========================================

const completeCODRefundSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid refund ID is required"
    ),

    body("bankTransferReference")
    .trim()
    .isLength({
        min: 1,
        max: 200
    })
    .withMessage(
        "Bank transfer reference is required"
    )

];


// ========================================
// EXPORTS
// ========================================

export {

    createRefundSchema,

    refundIdSchema,

    adminRefundQuerySchema,

    rejectRefundSchema,

    approveRefundSchema,

    completeCODRefundSchema

};
