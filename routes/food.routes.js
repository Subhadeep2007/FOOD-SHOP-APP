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


import upload

from "../middleware/upload.middleware.js";


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

// CREATE FOOD

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


// UPDATE FOOD

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


// DELETE FOOD

router.delete(

    "/:id",

    authMiddleware,

    adminMiddleware,

    remove

);


export default router;