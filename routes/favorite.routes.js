import express from "express";

import {
    get,
    add,
    remove
} from "../controllers/favorite/favorite.controller.js";

import authMiddleware
from "../middleware/auth.middleware.js";

const router =
    express.Router();

router.use(
    authMiddleware
);

router.get(
    "/",
    get
);

router.post(
    "/",
    add
);

router.delete(
    "/:foodId",
    remove
);

export default router;