import express from "express";

import {
    create,
    getFood,
    remove
} from "../controllers/review/review.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

const router =
    express.Router();

router.get(
    "/food/:foodId",
    getFood
);

router.post(
    "/",
    authMiddleware,
    create
);

router.delete(
    "/:id",
    authMiddleware,
    remove
);

export default router;