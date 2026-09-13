import {
    createRazorpayOrder,
    verifyPayment,
    createCODPayment,
    getPaymentByOrder,
    processWebhook
} from "../../services/payment/payment.service.js";

import generateOrderReceipt
from "../../services/payment/receipt.service.js";


// ========================================
// CREATE RAZORPAY ORDER
// ========================================

const createPaymentOrder = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await createRazorpayOrder(

                req.user.userId,

                req.body.orderId

            );


        return res.status(201).json({

            success: true,

            message: "Razorpay order created successfully",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// VERIFY PAYMENT
// ========================================

const verify = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await verifyPayment({

                userId: req.user.userId,

                orderId: req.body.orderId,

                razorpayOrderId: req.body.razorpayOrderId,

                razorpayPaymentId: req.body.razorpayPaymentId,

                razorpaySignature: req.body.razorpaySignature

            });


        return res.status(200).json({

            success: true,

            message: "Payment verification completed",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// COD
// ========================================

const cod = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await createCODPayment(

                req.user.userId,

                req.body.orderId

            );


        return res.status(200).json({

            success: true,

            message: "Cash on Delivery selected",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// PAYMENT DETAILS
// ========================================

const getPayment = async(
    req,
    res,
    next
) => {

    try {

        const payment =
            await getPaymentByOrder(

                req.user.userId,

                req.params.orderId

            );


        return res.status(200).json({

            success: true,

            data: payment

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// WEBHOOK
// ========================================

const webhook = async(
    req,
    res,
    next
) => {

    try {

        const signature =
            req.headers[
                "x-razorpay-signature"
            ];


        await processWebhook(

            req.body,

            signature

        );


        return res.status(200).json({

            success: true

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// RECEIPT
// ========================================

const receipt = async(
    req,
    res,
    next
) => {

    try {

        const pdfBuffer =
            await generateOrderReceipt(

                req.user.userId,

                req.params.orderId

            );


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="food-shop-receipt-${req.params.orderId}.pdf"`
        );


        return res.send(
            pdfBuffer
        );

    } catch (error) {

        next(error);
    }
};


export {
    createPaymentOrder,
    verify,
    cod,
    getPayment,
    webhook,
    receipt
};