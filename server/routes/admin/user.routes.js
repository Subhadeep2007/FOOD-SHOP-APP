import express from "express";

import authMiddleware
from "../../middleware/auth.middleware.js";

import adminMiddleware
from "../../middleware/admin.middleware.js";

import {
    getAll,
    getOne,
    updateStatus,
    remove
} from "../../controllers/admin/user.controller.js";


const router =
    express.Router();


// ========================================
// GET ALL CUSTOMERS
// ========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAll
);


// ========================================
// GET SINGLE CUSTOMER
// ========================================

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    getOne
);


// ========================================
// UPDATE CUSTOMER STATUS
// ========================================

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    updateStatus
);


// ========================================
// DELETE CUSTOMER
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    remove
);


export default router;