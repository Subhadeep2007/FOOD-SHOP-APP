import express from "express";

import authMiddleware
from "../../middleware/auth.middleware.js";

import adminMiddleware
from "../../middleware/admin.middleware.js";

import {
    getAll,
    getOne,
    create,
    update,
    updatePrice,
    updateStock,
    updateAvailability,
    remove
} from "../../controllers/admin/food.controller.js";


const router =
    express.Router();


// ========================================
// GET ALL FOODS
// ========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAll
);


// ========================================
// GET SINGLE FOOD
// ========================================

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    getOne
);


// ========================================
// CREATE FOOD
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    create
);


// ========================================
// UPDATE FOOD
// ========================================

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    update
);


// ========================================
// UPDATE PRICE
// ========================================

router.patch(
    "/:id/price",
    authMiddleware,
    adminMiddleware,
    updatePrice
);


// ========================================
// UPDATE STOCK
// ========================================

router.patch(
    "/:id/stock",
    authMiddleware,
    adminMiddleware,
    updateStock
);


// ========================================
// UPDATE AVAILABILITY
// ========================================

router.patch(
    "/:id/availability",
    authMiddleware,
    adminMiddleware,
    updateAvailability
);


// ========================================
// DELETE FOOD
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    remove
);


export default router;