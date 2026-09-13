import {
    body,
    param,
    query
} from "express-validator";


// ========================================
// CREATE ORDER
// ========================================

const createOrderSchema = [

    body("addressId")
    .isMongoId()
    .withMessage(
        "Valid address ID is required"
    ),

    body("paymentMethod")
    .isIn([
        "COD",
        "ONLINE"
    ])
    .withMessage(
        "Payment method must be COD or ONLINE"
    )
];


// ========================================
// CANCEL MY ORDER
// ========================================

const cancelOrderSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("reason")
    .optional()
    .trim()
    .isLength({
        max: 300
    })
    .withMessage(
        "Cancellation reason is too long"
    )
];


// ========================================
// ADMIN ORDER LIST
// ========================================

const adminOrderQuerySchema = [

    query("status")
    .optional()
    .isIn([
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ])
    .withMessage(
        "Invalid order status"
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
// ADMIN UPDATE STATUS
// ========================================

const updateOrderStatusSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("status")
    .isIn([
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ])
    .withMessage(
        "Invalid order status"
    )
];


// ========================================
// ADMIN CANCEL
// ========================================

const adminCancelOrderSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("reason")
    .optional()
    .trim()
    .isLength({
        max: 300
    })
    .withMessage(
        "Cancellation reason is too long"
    )
];


export {
    createOrderSchema,
    cancelOrderSchema,
    adminOrderQuerySchema,
    updateOrderStatusSchema,
    adminCancelOrderSchema
};