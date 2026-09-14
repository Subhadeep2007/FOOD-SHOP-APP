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
    categorySchema,
    updateCategorySchema
} from "../../validators/category.validator.js";


import {
    getAll,
    getOne,
    create,
    update,
    remove
} from "../../controllers/admin/category.controller.js";


const router =
    express.Router();


// ========================================
// GET ALL
// ========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAll
);


// ========================================
// GET ONE
// ========================================

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    getOne
);


// ========================================
// CREATE
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single(
        "image"
    ),
    validate(
        categorySchema
    ),
    create
);


// ========================================
// UPDATE
// ========================================

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.single(
        "image"
    ),
    validate(
        updateCategorySchema
    ),
    update
);


// ========================================
// DELETE
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    remove
);


export default router;