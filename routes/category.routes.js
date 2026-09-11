import express from "express";

import {
    create,
    getAll,
    getOne,
    update,
    remove
} from "../controllers/category/category.controller.js";

import validate
from "../middleware/validate.middleware.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";

import {
    categorySchema,
    updateCategorySchema
} from "../validators/category.validator.js";

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
    validate(categorySchema),
    create
);

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validate(updateCategorySchema),
    update
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    remove
);


export default router;