import express from "express";

import {
    dashboard,
    sales,
    orderStatus,
    payments,
    topFoods,
    foodPerformance,
    users,
    refunds,
    dailySales,
    complete
} from "../../controllers/admin/analytics.controller.js";

import authMiddleware
from "../../middleware/auth.middleware.js";

import adminMiddleware
from "../../middleware/admin.middleware.js";


const router =
    express.Router();


// ========================================
// DASHBOARD SUMMARY
// ========================================

router.get(

    "/dashboard",

    authMiddleware,

    adminMiddleware,

    dashboard

);


// ========================================
// SALES ANALYTICS
// ========================================

router.get(

    "/sales",

    authMiddleware,

    adminMiddleware,

    sales

);


// ========================================
// ORDER STATUS
// ========================================

router.get(

    "/order-status",

    authMiddleware,

    adminMiddleware,

    orderStatus

);


// ========================================
// PAYMENT ANALYTICS
// ========================================

router.get(

    "/payments",

    authMiddleware,

    adminMiddleware,

    payments

);


// ========================================
// TOP SELLING FOODS
// ========================================

router.get(

    "/top-foods",

    authMiddleware,

    adminMiddleware,

    topFoods

);


// ========================================
// FOOD PERFORMANCE
// ========================================

router.get(

    "/food-performance",

    authMiddleware,

    adminMiddleware,

    foodPerformance

);


// ========================================
// USER ANALYTICS
// ========================================

router.get(

    "/users",

    authMiddleware,

    adminMiddleware,

    users

);


// ========================================
// REFUND ANALYTICS
// ========================================

router.get(

    "/refunds",

    authMiddleware,

    adminMiddleware,

    refunds

);


// ========================================
// DAILY SALES
// ========================================

router.get(

    "/daily-sales",

    authMiddleware,

    adminMiddleware,

    dailySales

);


// ========================================
// COMPLETE ANALYTICS
// ========================================

router.get(

    "/complete",

    authMiddleware,

    adminMiddleware,

    complete

);


export default router;