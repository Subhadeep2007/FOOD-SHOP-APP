import express from "express";

import {
    createPaymentOrder,
    verify,
    cod,
    getPayment,
    receipt
} from "../controllers/payment/payment.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import {
    createPaymentSchema,
    verifyPaymentSchema,
    codPaymentSchema
} from "../validators/payment.validator.js";

const router =
    express.Router();


// ========================================
// USER
// ========================================

router.post(
    "/create-order",
    authMiddleware,
    validate(createPaymentSchema),
    createPaymentOrder
);


router.post(
    "/verify",
    authMiddleware,
    validate(verifyPaymentSchema),
    verify
);


router.post(
    "/cod",
    authMiddleware,
    validate(codPaymentSchema),
    cod
);


router.get(
    "/order/:orderId",
    authMiddleware,
    getPayment
);


router.get(
    "/receipt/:orderId",
    authMiddleware,
    receipt
);


export default router;