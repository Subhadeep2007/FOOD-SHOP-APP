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
    ),

    body("couponCode")
    .optional()
    .trim()
    .isLength({
        min: 1,
        max: 50
    })
    .withMessage(
        "Coupon code must be between 1 and 50 characters"
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
    ),

    body("deliveryDetails")
    .optional()
    .isObject()
    .withMessage(
        "Delivery details must be an object"
    ),

    body("deliveryDetails.name")
    .optional()
    .trim()
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Delivery boy name must be between 2 and 50 characters"
    ),

    body("deliveryDetails.phone")
    .optional()
    .trim()
    .matches(
        /^[0-9+\-\s()]{7,20}$/
    )
    .withMessage(
        "Invalid delivery boy phone number"
    ),

    body("deliveryDetails")
    .custom((value, {
        req
    }) => {

        if (
            req.body.status === "CONFIRMED"
        ) {

            if (!value ||
                typeof value !== "object" ||
                !value.name ||
                !String(
                    value.name
                ).trim() ||
                !value.phone ||
                !String(
                    value.phone
                ).trim()
            ) {

                throw new Error(
                    "Delivery boy name and phone are required when confirming an order"
                );
            }
        }

        return true;
    })

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