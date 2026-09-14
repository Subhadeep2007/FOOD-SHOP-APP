import express from "express";

import {
    webhook
} from "../controllers/payment/payment.controller.js";

const router =
    express.Router();


router.post(
    "/razorpay",

    express.raw({
        type: "application/json"
    }),

    webhook
);


export default router;