import express from "express";

import {

    create,

    getMine,

    getMineById,

    getAll,

    reject,

    approve,

    completeCOD

} from "../controllers/refund/refund.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";


const router =
    express.Router();


// ========================================
// CUSTOMER
// ========================================

router.post(
    "/",

    authMiddleware,

    create
);


router.get(
    "/my",

    authMiddleware,

    getMine
);


router.get(
    "/my/:id",

    authMiddleware,

    getMineById
);


// ========================================
// ADMIN
// ========================================

router.get(
    "/admin/all",

    authMiddleware,

    adminMiddleware,

    getAll
);


router.patch(
    "/admin/:id/reject",

    authMiddleware,

    adminMiddleware,

    reject
);


router.patch(
    "/admin/:id/approve",

    authMiddleware,

    adminMiddleware,

    approve
);


// ========================================
// ADMIN COMPLETE COD REFUND
// ========================================

router.patch(
    "/admin/:id/complete-cod",

    authMiddleware,

    adminMiddleware,

    completeCOD
);


export default router;