import express from "express";

import authMiddleware
from "../../middleware/auth.middleware.js";

import adminMiddleware
from "../../middleware/admin.middleware.js";

import validate
from "../../middleware/validate.middleware.js";

import {

    create,

    getAll,

    getOne,

    update,

    updateStatus,

    remove

} from "../../controllers/admin/coupon.controller.js";

import {

    createCouponSchema,

    couponIdSchema,

    updateCouponSchema,

    updateCouponStatusSchema,

    deleteCouponSchema

} from "../../validators/coupon.validator.js";


const router =
    express.Router();


// ========================================
// CREATE COUPON
// ========================================

router.post(

    "/",

    authMiddleware,

    adminMiddleware,

    validate(
        createCouponSchema
    ),

    create

);


// ========================================
// GET ALL COUPONS
// ========================================

router.get(

    "/",

    authMiddleware,

    adminMiddleware,

    getAll

);


// ========================================
// GET SINGLE COUPON
// ========================================

router.get(

    "/:id",

    authMiddleware,

    adminMiddleware,

    validate(
        couponIdSchema
    ),

    getOne

);


// ========================================
// UPDATE COUPON
// ========================================

router.patch(

    "/:id",

    authMiddleware,

    adminMiddleware,

    validate(
        updateCouponSchema
    ),

    update

);


// ========================================
// UPDATE COUPON STATUS
// ========================================

router.patch(

    "/:id/status",

    authMiddleware,

    adminMiddleware,

    validate(
        updateCouponStatusSchema
    ),

    updateStatus

);


// ========================================
// DELETE COUPON
// ========================================

router.delete(

    "/:id",

    authMiddleware,

    adminMiddleware,

    validate(
        deleteCouponSchema
    ),

    remove

);


export default router;