import express from "express";

import authMiddleware
from "../middleware/auth.middleware.js";

import {
    getMine,
    read,
    readAll
} from "../controllers/notification/notification.controller.js";


const router =
    express.Router();


// ========================================
// GET MY NOTIFICATIONS
// ========================================

router.get(
    "/",
    authMiddleware,
    getMine
);


// ========================================
// MARK ONE AS READ
// ========================================

router.patch(
    "/:id/read",
    authMiddleware,
    read
);


// ========================================
// MARK ALL AS READ
// ========================================

router.patch(
    "/read-all",
    authMiddleware,
    readAll
);


// ========================================
// DEFAULT EXPORT
// ========================================

export default router;