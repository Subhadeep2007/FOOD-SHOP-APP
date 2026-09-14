import express from "express";

import {
    create,
    getAll,
    getOne,
    update,
    remove
} from "../controllers/address/address.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import {
    addressSchema,
    updateAddressSchema
} from "../validators/address.validator.js";

const router =
    express.Router();


router.use(
    authMiddleware
);


// ========================================
// ADDRESS
// ========================================

router.post(
    "/",
    validate(addressSchema),
    create
);

router.get(
    "/",
    getAll
);

router.get(
    "/:id",
    getOne
);

router.patch(
    "/:id",
    validate(updateAddressSchema),
    update
);

router.delete(
    "/:id",
    remove
);


export default router;