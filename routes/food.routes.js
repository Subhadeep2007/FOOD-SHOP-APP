import express from "express";

import {
    create,
    getAll,
    getOne,
    update,
    remove
} from "../controllers/food/food.controller.js";

import validate
from "../middleware/validate.middleware.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";

import {
    foodSchema,
    updateFoodSchema
} from "../validators/food.validator.js";

const router =
    express.Router();


// ========================================
// PUBLIC
// ========================================

router.get(
    "/",
    getAll
);

router.get(
    "/:id",
    getOne
);


// ========================================
// ADMIN
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validate(foodSchema),
    create
);

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validate(updateFoodSchema),
    update
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    remove
);


export default router;