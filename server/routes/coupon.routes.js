import express from "express";

import {
    validate,
    getAvailable
} from "../controllers/coupon/coupon.controller.js";

import validateRequest from "../middleware/validate.middleware.js";

import {
    validateCouponSchema
} from "../validators/coupon.validator.js";

import authMiddleware
from "../middleware/auth.middleware.js";

const router =
    express.Router();

router.get("/available", getAvailable);

router.post(
    "/validate",
    authMiddleware,
    validateRequest(validateCouponSchema),
    validate
);

export default router;
