import crypto from "crypto";
import Razorpay from "razorpay";

import Payment from "../../models/payment.model.js";
import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import { createNotification } from "../notification/notification.service.js";


// ========================================
// RAZORPAY INSTANCE
// ========================================

const razorpay =
    new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });


const finalizePendingOnlineOrder = async(orderId, userId) => {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: "PAYMENT_PENDING" },
        { $set: { status: "PLACED", paymentStatus: "SUCCESS" } },
        { new: true }
    );

    if (!order) return null;

    await Cart.updateOne(
        { user: userId },
        { $set: { items: [] } }
    );

    await createNotification({
        userId,
        type: "ORDER",
        title: "Order placed successfully",
        message: `Your order ${order.orderNumber} has been placed successfully.`,
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status
        }
    });

    return order;
};


// ========================================
// CREATE RAZORPAY ORDER
// ========================================

const createRazorpayOrder = async(
    userId,
    orderId
) => {

    const order =
        await Order.findOne({
            _id: orderId,
            user: userId
        });


    if (!order) {

        const error =
            new Error(
                "Order not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        order.paymentMethod !==
        "ONLINE"
    ) {

        const error =
            new Error(
                "This order does not use online payment"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        order.status ===
        "CANCELLED"
    ) {

        const error =
            new Error(
                "Cancelled order cannot be paid"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        order.paymentStatus ===
        "SUCCESS"
    ) {

        const error =
            new Error(
                "Order is already paid"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // EXISTING PAYMENT
    // ========================================

    let payment =
        await Payment.findOne({
            order: order._id
        });


    if (
        payment &&
        payment.status ===
        "CAPTURED"
    ) {

        const error =
            new Error(
                "Payment is already captured"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // CREATE INTERNAL PAYMENT
    // ========================================

    if (!payment) {

        payment =
            await Payment.create({

                order: order._id,

                user: userId,

                paymentMethod: "ONLINE",

                amount: order.totalAmount,

                currency: "INR",

                status: "PENDING"

            });

    } else {

        payment.status =
            "PENDING";

        payment.failureReason =
            "";

        await payment.save();
    }


    // ========================================
    // RAZORPAY AMOUNT
    // ========================================

    const amountInPaise =
        Math.round(
            order.totalAmount * 100
        );


    // ========================================
    // CREATE RAZORPAY ORDER
    // ========================================

    const razorpayOrder =
        await razorpay.orders.create({

            amount: amountInPaise,

            currency: "INR",

            receipt: order.orderNumber,

            notes: {

                internalOrderId: order._id.toString(),

                orderNumber: order.orderNumber,

                userId: userId.toString()

            }

        });


    // ========================================
    // SAVE PAYMENT
    // ========================================

    payment.razorpayOrderId =
        razorpayOrder.id;

    await payment.save();


    // ========================================
    // LINK PAYMENT TO ORDER
    // ========================================

    order.payment =
        payment._id;

    order.razorpayOrderId =
        razorpayOrder.id;

    order.paymentStatus =
        "PENDING";


    await order.save();


    return {

        paymentId: payment._id,

        razorpayOrderId: razorpayOrder.id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        keyId: process.env.RAZORPAY_KEY_ID,

        orderId: order._id,

        orderNumber: order.orderNumber

    };
};


// ========================================
// VERIFY PAYMENT SIGNATURE
// ========================================

const verifyPayment = async({
    userId,
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) => {

    const order =
        await Order.findOne({

            _id: orderId,

            user: userId

        });


    if (!order) {

        const error =
            new Error(
                "Order not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const payment =
        await Payment.findOne({

            order: order._id,

            user: userId

        });


    if (!payment) {

        const error =
            new Error(
                "Payment record not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // ========================================
    // ORDER ID MATCH
    // ========================================

    if (
        payment.razorpayOrderId !==
        razorpayOrderId
    ) {

        const error =
            new Error(
                "Razorpay order ID mismatch"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // SIGNATURE
    // ========================================

    const body =
        `${razorpayOrderId}|${razorpayPaymentId}`;


    const expectedSignature =
        crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");


    if (
        expectedSignature !==
        razorpaySignature
    ) {

        payment.status =
            "FAILED";

        payment.failureReason =
            "Invalid payment signature";

        await payment.save();


        const error =
            new Error(
                "Payment signature verification failed"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // SAVE PAYMENT DATA
    // ========================================

    payment.razorpayPaymentId =
        razorpayPaymentId;

    payment.razorpaySignature =
        razorpaySignature;


    /*
        We do not trust the browser response
        alone for final payment fulfilment.

        Fetch payment status from Razorpay.
    */

    const razorpayPayment =
        await razorpay.payments.fetch(
            razorpayPaymentId
        );


    if (
        razorpayPayment.order_id !==
        razorpayOrderId
    ) {

        const error =
            new Error(
                "Payment order mismatch"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        razorpayPayment.status ===
        "captured"
    ) {

        payment.status =
            "CAPTURED";

        payment.capturedAt =
            new Date();

        payment.paidAt =
            new Date();

        payment.failureReason =
            "";


        order.paymentStatus =
            "SUCCESS";

        if (order.status === "PAYMENT_PENDING") {

            order.status = "PLACED";

            await Cart.updateOne(
                { user: userId },
                { $set: { items: [] } }
            );

            await createNotification({
                userId: userId,
                type: "ORDER",
                title: "Order placed successfully",
                message: `Your order ${order.orderNumber} has been placed successfully.`,
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status
                }
            });
        }

    } else if (
        razorpayPayment.status ===
        "authorized"
    ) {

        payment.status =
            "AUTHORIZED";

    } else {

        payment.status =
            "FAILED";

        payment.failureReason =
            `Razorpay payment status: ${razorpayPayment.status}`;

        order.paymentStatus =
            "FAILED";
    }


    await payment.save();

    await order.save();


    return {

        paymentStatus: payment.status,

        orderStatus: order.status,

        orderPaymentStatus: order.paymentStatus,

        paymentId: payment.razorpayPaymentId,

        orderNumber: order.orderNumber

    };
};


// ========================================
// COD PAYMENT
// ========================================

const createCODPayment = async(
    userId,
    orderId
) => {

    const order =
        await Order.findOne({

            _id: orderId,

            user: userId

        });


    if (!order) {

        const error =
            new Error(
                "Order not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        order.paymentMethod !==
        "COD"
    ) {

        const error =
            new Error(
                "Order is not Cash on Delivery"
            );

        error.statusCode = 400;

        throw error;
    }


    let payment =
        await Payment.findOne({
            order: order._id
        });


    if (!payment) {

        payment =
            await Payment.create({

                order: order._id,

                user: userId,

                paymentMethod: "COD",

                amount: order.totalAmount,

                currency: "INR",

                status: "PENDING"

            });

    }


    order.payment =
        payment._id;

    order.paymentStatus =
        "PENDING";


    await order.save();


    return {

        paymentId: payment._id,

        paymentMethod: "COD",

        paymentStatus: payment.status,

        amount: payment.amount

    };
};


// ========================================
// GET PAYMENT
// ========================================

const getPaymentByOrder = async(
    userId,
    orderId
) => {

    const payment =
        await Payment.findOne({

            order: orderId,

            user: userId

        }).populate(
            "order",
            "orderNumber totalAmount status paymentStatus"
        );


    if (!payment) {

        const error =
            new Error(
                "Payment not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return payment;
};


// ========================================
// WEBHOOK
// ========================================

const processWebhook = async(
    rawBody,
    signature
) => {

    const expectedSignature =
        crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(
            rawBody
        )
        .digest("hex");


    if (
        expectedSignature !==
        signature
    ) {

        const error =
            new Error(
                "Invalid webhook signature"
            );

        error.statusCode = 400;

        throw error;
    }


    const event =
        JSON.parse(
            rawBody.toString()
        );


    // ========================================
    // PAYMENT CAPTURED
    // ========================================

    if (
        event.event ===
        "payment.captured"
    ) {

        const entity =
            event.payload &&
            event.payload.payment &&
            event.payload.payment.entity;


        if (!entity) {
            return;
        }


        const payment =
            await Payment.findOne({

                razorpayOrderId: entity.order_id

            });


        if (!payment) {
            return;
        }


        payment.razorpayPaymentId =
            entity.id;

        payment.status =
            "CAPTURED";

        payment.capturedAt =
            new Date();

        payment.paidAt =
            new Date();


        await payment.save();


        const finalizedOrder = await finalizePendingOnlineOrder(
            payment.order,
            payment.user
        );

        if (!finalizedOrder) {
            await Order.findByIdAndUpdate(
                payment.order,
                { paymentStatus: "SUCCESS" }
            );
        }
    }


    // ========================================
    // PAYMENT FAILED
    // ========================================

    if (
        event.event ===
        "payment.failed"
    ) {

        const entity =
            event.payload &&
            event.payload.payment &&
            event.payload.payment.entity;


        if (!entity) {
            return;
        }


        const payment =
            await Payment.findOne({

                razorpayOrderId: entity.order_id

            });


        if (!payment) {
            return;
        }


        payment.razorpayPaymentId =
            entity.id;

        payment.status =
            "FAILED";

        payment.failureReason =
            entity.error_description ||
            "Payment failed";


        await payment.save();


        await Order.findByIdAndUpdate(

            payment.order,

            {

                paymentStatus: "FAILED"

            }

        );
    }


    // ========================================
    // ORDER PAID
    // ========================================

    if (
        event.event ===
        "order.paid"
    ) {

        const entity =
            event.payload &&
            event.payload.order &&
            event.payload.order.entity;


        if (!entity) {
            return;
        }


        const payment =
            await Payment.findOne({

                razorpayOrderId: entity.id

            });


        if (!payment) {
            return;
        }


        if (
            payment.status !==
            "CAPTURED"
        ) {

            payment.status =
                "CAPTURED";

            payment.paidAt =
                new Date();

            payment.capturedAt =
                new Date();

            await payment.save();
        }


        const finalizedOrder = await finalizePendingOnlineOrder(
            payment.order,
            payment.user
        );

        if (!finalizedOrder) {
            await Order.findByIdAndUpdate(
                payment.order,
                { paymentStatus: "SUCCESS" }
            );
        }
    }


    return {
        received: true
    };
};


export {
    createRazorpayOrder,
    verifyPayment,
    createCODPayment,
    getPaymentByOrder,
    processWebhook
};
