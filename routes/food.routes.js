import express from "express";


import {
    getAll,
    getOne
} from "../controllers/food/food.controller.js";


const router =
    express.Router();


// ========================================
// PUBLIC FOOD ROUTES
// ========================================

// GET ALL FOODS

router.get(

    "/",

    getAll

);


// GET SINGLE FOOD

router.get(

    "/:id",

    getOne

);


// ========================================
// EXPORTS
// ========================================

export default router;