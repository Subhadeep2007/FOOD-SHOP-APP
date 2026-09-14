import express from "express";


import {
    getAll,
    getOne
} from "../controllers/category/category.controller.js";


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


export default router;