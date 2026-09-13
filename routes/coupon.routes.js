import express from "express";

import {
    validate
} from "../controllers/coupon/coupon.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

const router =
    express.Router();

router.post(
    "/validate",
    authMiddleware,
    validate
);

export default router;