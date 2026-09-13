import express from "express";

import {

    create,

    getMine,

    getMineById,

    cancelMine,

    getAll,

    getOneAdmin,

    updateStatus,

    cancelAdmin

} from "../controllers/order/order.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import {

    createOrderSchema,

    cancelOrderSchema,

    adminOrderQuerySchema,

    updateOrderStatusSchema,

    adminCancelOrderSchema

} from "../validators/order.validator.js";


const router =
    express.Router();


// ========================================
// CUSTOMER
// ========================================

router.post(

    "/",

    authMiddleware,

    validate(createOrderSchema),

    create

);


router.get(

    "/my-orders",

    authMiddleware,

    getMine

);


router.get(

    "/my-orders/:id",

    authMiddleware,

    getMineById

);


router.patch(

    "/my-orders/:id/cancel",

    authMiddleware,

    validate(cancelOrderSchema),

    cancelMine

);


// ========================================
// ADMIN
// ========================================

router.get(

    "/admin/all",

    authMiddleware,

    adminMiddleware,

    validate(adminOrderQuerySchema),

    getAll

);


router.get(

    "/admin/:id",

    authMiddleware,

    adminMiddleware,

    getOneAdmin

);


router.patch(

    "/admin/:id/status",

    authMiddleware,

    adminMiddleware,

    validate(updateOrderStatusSchema),

    updateStatus

);


router.patch(

    "/admin/:id/cancel",

    authMiddleware,

    adminMiddleware,

    validate(adminCancelOrderSchema),

    cancelAdmin

);


export default router;