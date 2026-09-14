import express from "express";

import {
    get,
    add,
    update,
    remove,
    clear
} from "../controllers/cart/cart.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import {
    addToCartSchema,
    updateCartSchema
} from "../validators/cart.validator.js";

const router =
    express.Router();

router.use(
    authMiddleware
);


// ========================================
// GET CART
// ========================================

router.get(
    "/",
    get
);


// ========================================
// ADD TO CART
// ========================================

router.post(
    "/items",
    validate(addToCartSchema),
    add
);


// ========================================
// UPDATE QUANTITY
// ========================================

router.patch(
    "/items/:foodId",
    validate(updateCartSchema),
    update
);


// ========================================
// REMOVE
// ========================================

router.delete(
    "/items/:foodId",
    remove
);


// ========================================
// CLEAR
// ========================================

router.delete(
    "/",
    clear
);


export default router;