import {
    body
} from "express-validator";


// ========================================
// CREATE PAYMENT
// ========================================

const createPaymentSchema = [

    body("orderId")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    )
];


// ========================================
// VERIFY PAYMENT
// ========================================

const verifyPaymentSchema = [

    body("orderId")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("razorpayOrderId")
    .trim()
    .notEmpty()
    .withMessage(
        "Razorpay order ID is required"
    ),

    body("razorpayPaymentId")
    .trim()
    .notEmpty()
    .withMessage(
        "Razorpay payment ID is required"
    ),

    body("razorpaySignature")
    .trim()
    .notEmpty()
    .withMessage(
        "Razorpay signature is required"
    )
];


// ========================================
// COD
// ========================================

const codPaymentSchema = [

    body("orderId")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    )
];


export {
    createPaymentSchema,
    verifyPaymentSchema,
    codPaymentSchema
};