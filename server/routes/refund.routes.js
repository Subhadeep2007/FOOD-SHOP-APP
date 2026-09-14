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

import validate
from "../middleware/validate.middleware.js";

import {

    createRefundSchema,

    refundIdSchema,

    adminRefundQuerySchema,

    rejectRefundSchema,

    approveRefundSchema,

    completeCODRefundSchema

} from "../validators/refund.validator.js";


const router =
    express.Router();


// ========================================
// CUSTOMER - CREATE REFUND
// ========================================

router.post(

    "/",

    authMiddleware,

    validate(
        createRefundSchema
    ),

    create

);


// ========================================
// CUSTOMER - MY REFUNDS
// ========================================

router.get(

    "/my",

    authMiddleware,

    getMine

);


// ========================================
// CUSTOMER - MY REFUND DETAILS
// ========================================

router.get(

    "/my/:id",

    authMiddleware,

    validate(
        refundIdSchema
    ),

    getMineById

);


// ========================================
// ADMIN - GET ALL REFUNDS
// ========================================

router.get(

    "/admin/all",

    authMiddleware,

    adminMiddleware,

    validate(
        adminRefundQuerySchema
    ),

    getAll

);


// ========================================
// ADMIN - REJECT REFUND
// ========================================

router.patch(

    "/admin/:id/reject",

    authMiddleware,

    adminMiddleware,

    validate(
        rejectRefundSchema
    ),

    reject

);


// ========================================
// ADMIN - APPROVE REFUND
// ========================================

router.patch(

    "/admin/:id/approve",

    authMiddleware,

    adminMiddleware,

    validate(
        approveRefundSchema
    ),

    approve

);


// ========================================
// ADMIN - COMPLETE COD REFUND
// ========================================

router.patch(

    "/admin/:id/complete-cod",

    authMiddleware,

    adminMiddleware,

    validate(
        completeCODRefundSchema
    ),

    completeCOD

);


export default router;