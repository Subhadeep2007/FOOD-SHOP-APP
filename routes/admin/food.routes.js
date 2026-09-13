import express from "express";


import authMiddleware
from "../../middleware/auth.middleware.js";


import adminMiddleware
from "../../middleware/admin.middleware.js";


import upload
from "../../middleware/upload.middleware.js";


import validate
from "../../middleware/validate.middleware.js";


import {
    foodSchema,
    updateFoodSchema
} from "../../validators/food.validator.js";


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
    upload.array(
        "images",
        5
    ),
    validate(
        foodSchema
    ),
    create
);


// ========================================
// UPDATE FOOD
// ========================================

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.array(
        "images",
        5
    ),
    validate(
        updateFoodSchema
    ),
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