import express from "express";

import {
    create,
    getFood,
    update,
    remove,
    getAllAdmin
} from "../controllers/review/review.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import {
    createReviewSchema,
    updateReviewSchema,
    deleteReviewSchema,
    getFoodReviewsSchema
} from "../validators/review.validator.js";


const router =
    express.Router();


// ========================================
// PUBLIC
// ========================================

router.get(

    "/food/:foodId",

    validate(getFoodReviewsSchema),

    getFood

);


// ========================================
// USER - CREATE
// ========================================

router.post(

    "/",

    authMiddleware,

    validate(createReviewSchema),

    create

);


// ========================================
// USER - UPDATE OWN REVIEW
// ========================================

router.patch(

    "/:id",

    authMiddleware,

    validate(updateReviewSchema),

    update

);


// ========================================
// USER - DELETE OWN REVIEW
// ========================================

router.delete(

    "/:id",

    authMiddleware,

    validate(deleteReviewSchema),

    remove

);


// ========================================
// ADMIN - VIEW ALL REVIEWS
// ========================================

router.get(

    "/admin/all",

    authMiddleware,

    adminMiddleware,

    getAllAdmin

);


export default router;