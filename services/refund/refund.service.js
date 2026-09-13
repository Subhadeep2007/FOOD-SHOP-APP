import crypto from "crypto";
import axios from "axios";

import Refund from "../../models/refund.model.js";
import Payment from "../../models/payment.model.js";
import Order from "../../models/order.model.js";


// ========================================
// RAZORPAY BASE URL
// ========================================

const RAZORPAY_API =
    "https://api.razorpay.com/v1";


// ========================================
// RAZORPAY AUTH
// ========================================

const getRazorpayAuth = () => {

    return {
        username: process.env.RAZORPAY_KEY_ID,

        password: process.env.RAZORPAY_KEY_SECRET
    };
};


// ========================================
// REFUND CALCULATION
// ========================================

const calculateRefundAmount = (
    order,
    payment
) => {

    // ========================================
    // COD REFUND
    // ========================================

    if (
        payment.paymentMethod ===
        "COD"
    ) {

        /*
            Food refundable amount:

            Order subtotal
            -
            Coupon discount

            Delivery fee, tax and any other
            charges are NOT refundable.
        */

        const foodRefundableAmount =
            Math.max(
                0,
                Number(order.subtotal || 0) -
                Number(order.discount || 0)
            );


        const nonRefundableAmount =
            Math.max(
                0,
                Number(order.totalAmount || 0) -
                foodRefundableAmount
            );


        return {

            refundableAmount: Number(
                foodRefundableAmount.toFixed(2)
            ),

            nonRefundableAmount: Number(
                nonRefundableAmount.toFixed(2)
            )

        };
    }


    // ========================================
    // ONLINE PAYMENT REFUND
    // ========================================

    const refundableAmount =
        Number(
            order.totalAmount || 0
        );


    return {

        refundableAmount: Number(
            refundableAmount.toFixed(2)
        ),

        nonRefundableAmount: 0

    };
};


// ========================================
// CREATE REFUND REQUEST
// ========================================

const createRefundRequest = async({
    userId,
    orderId,
    amount,
    reason,
    bankDetails
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


    // ========================================
    // REFUND ELIGIBILITY
    // ========================================

    if (![
            "DELIVERED",
            "CANCELLED"
        ].includes(
            order.status
        )) {

        const error =
            new Error(
                "Refund is not available for this order yet"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // PAYMENT
    // ========================================

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
    // ALREADY FULLY REFUNDED
    // ========================================

    if (
        payment.status ===
        "REFUNDED"
    ) {

        const error =
            new Error(
                "This order is already fully refunded"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // CALCULATE REFUNDABLE AMOUNT
    // ========================================

    const refundCalculation =
        calculateRefundAmount(
            order,
            payment
        );


    // ========================================
    // REFUNDABLE AMOUNT CHECK
    // ========================================

    if (
        refundCalculation.refundableAmount <=
        0
    ) {

        const error =
            new Error(
                "No refundable amount is available for this order"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // REQUESTED AMOUNT
    // ========================================

    let requestedAmount =
        amount !== undefined ?
        Number(amount) :
        refundCalculation.refundableAmount;


    // Customer cannot request more
    // than the calculated refundable amount.

    if (
        requestedAmount <= 0 ||
        requestedAmount >
        refundCalculation.refundableAmount
    ) {

        const error =
            new Error(
                `Maximum refundable amount is ₹${refundCalculation.refundableAmount}`
            );

        error.statusCode = 400;

        throw error;
    }


    requestedAmount =
        Number(
            requestedAmount.toFixed(2)
        );


    // ========================================
    // COD BANK DETAILS
    // ========================================

    let savedBankDetails = null;


    if (
        payment.paymentMethod ===
        "COD"
    ) {

        if (!bankDetails ||
            !bankDetails.accountHolderName ||
            !bankDetails.accountNumber ||
            !bankDetails.ifscCode ||
            !bankDetails.bankName ||
            !bankDetails.accountType
        ) {

            const error =
                new Error(
                    "Complete bank details are required for COD refund"
                );

            error.statusCode = 400;

            throw error;
        }


        savedBankDetails = {

            accountHolderName: bankDetails.accountHolderName
                .trim(),

            accountNumber: bankDetails.accountNumber
                .trim(),

            ifscCode: bankDetails.ifscCode
                .trim()
                .toUpperCase(),

            bankName: bankDetails.bankName
                .trim(),

            accountType: bankDetails.accountType
        };
    }


    // ========================================
    // CHECK EXISTING ACTIVE REQUEST
    // ========================================

    const existingRefund =
        await Refund.findOne({

            order: order._id,

            status: {
                $in: [
                    "REQUESTED",
                    "UNDER_REVIEW",
                    "APPROVED",
                    "PROCESSING"
                ]
            }

        });


    if (existingRefund) {

        const error =
            new Error(
                "A refund request is already active for this order"
            );

        error.statusCode = 409;

        throw error;
    }


    // ========================================
    // REFUND TYPE
    // ========================================

    const refundType =
        payment.paymentMethod ===
        "COD" ?
        "COD" :
        "ONLINE_PAYMENT";


    // ========================================
    // CREATE REFUND
    // ========================================

    const refund =
        await Refund.create({

            order: order._id,

            payment: payment._id,

            user: userId,

            refundType,

            requestedAmount,

            approvedAmount: 0,

            refundableFoodAmount: refundCalculation.refundableAmount,

            nonRefundableAmount: refundCalculation.nonRefundableAmount,

            reason,

            status: "REQUESTED",

            bankDetails: savedBankDetails,

            razorpayPaymentId: payment.razorpayPaymentId ||
                null

        });


    return refund;
};


// ========================================
// USER REFUNDS
// ========================================

const getMyRefunds = async(
    userId
) => {

    return Refund.find({
            user: userId
        })
        .populate(
            "order",
            "orderNumber totalAmount subtotal discount deliveryFee tax status"
        )
        .sort({
            createdAt: -1
        });
};


// ========================================
// SINGLE REFUND
// ========================================

const getMyRefundById = async(
    userId,
    refundId
) => {

    return Refund.findOne({

            _id: refundId,

            user: userId

        })
        .populate(
            "order",
            "orderNumber totalAmount subtotal discount deliveryFee tax status"
        );
};


// ========================================
// ADMIN GET REFUNDS
// ========================================

const getAllRefunds = async({
    status,
    page = 1,
    limit = 20
}) => {

    const query = {};


    if (status) {

        query.status =
            status;
    }


    const skip =
        (
            Number(page) - 1
        ) *
        Number(limit);


    const [
        refunds,
        total
    ] =
    await Promise.all([

        Refund.find(query)

        .populate(
            "user",
            "name email"
        )

        .populate(
            "order",
            "orderNumber totalAmount subtotal discount deliveryFee tax status"
        )

        .sort({
            createdAt: -1
        })

        .skip(skip)

        .limit(
            Number(limit)
        ),

        Refund.countDocuments(
            query
        )

    ]);


    return {

        refunds,

        pagination: {

            page: Number(page),

            limit: Number(limit),

            total,

            pages: Math.ceil(
                total /
                Number(limit)
            )

        }

    };
};


// ========================================
// ADMIN REJECT
// ========================================

const rejectRefund = async({
    refundId,
    adminId,
    note
}) => {

    const refund =
        await Refund.findById(
            refundId
        );


    if (!refund) {

        const error =
            new Error(
                "Refund request not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (![
            "REQUESTED",
            "UNDER_REVIEW"
        ].includes(
            refund.status
        )) {

        const error =
            new Error(
                "Refund cannot be rejected at this stage"
            );

        error.statusCode = 400;

        throw error;
    }


    refund.status =
        "REJECTED";

    refund.adminNote =
        note || "";

    refund.reviewedBy =
        adminId;

    refund.reviewedAt =
        new Date();


    await refund.save();


    return refund;
};


// ========================================
// ADMIN APPROVE + PROCESS
// ========================================

const approveRefund = async({
    refundId,
    adminId,
    approvedAmount
}) => {

    const refund =
        await Refund.findById(
            refundId
        )
        .populate("payment")
        .populate("order");


    if (!refund) {

        const error =
            new Error(
                "Refund request not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (![
            "REQUESTED",
            "UNDER_REVIEW"
        ].includes(
            refund.status
        )) {

        const error =
            new Error(
                "Refund cannot be approved at this stage"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // MAX APPROVABLE AMOUNT
    // ========================================

    const refundCalculation =
        calculateRefundAmount(
            refund.order,
            refund.payment
        );


    let amount =
        approvedAmount !== undefined ?
        Number(approvedAmount) :
        refund.requestedAmount;


    // Never allow admin to approve
    // more than the calculated amount.

    if (
        amount <= 0 ||
        amount >
        refundCalculation.refundableAmount ||
        amount >
        refund.requestedAmount
    ) {

        const error =
            new Error(
                `Maximum approvable refund amount is ₹${Math.min(
                    refundCalculation.refundableAmount,
                    refund.requestedAmount
                )}`
            );

        error.statusCode = 400;

        throw error;
    }


    amount =
        Number(
            amount.toFixed(2)
        );


    // ========================================
    // COD
    // ========================================

    if (
        refund.payment.paymentMethod ===
        "COD"
    ) {

        // Bank details must exist.

        if (!refund.bankDetails ||
            !refund.bankDetails.accountHolderName ||
            !refund.bankDetails.accountNumber ||
            !refund.bankDetails.ifscCode
        ) {

            const error =
                new Error(
                    "Bank details are required for COD refund"
                );

            error.statusCode = 400;

            throw error;
        }


        refund.status =
            "APPROVED";

        refund.approvedAmount =
            amount;

        refund.reviewedBy =
            adminId;

        refund.reviewedAt =
            new Date();


        await refund.save();


        return refund;
    }


    // ========================================
    // ONLINE PAYMENT
    // ========================================

    if (
        refund.payment.status !==
        "CAPTURED"
    ) {

        const error =
            new Error(
                "Only captured online payments can be refunded"
            );

        error.statusCode = 400;

        throw error;
    }


    if (!refund.payment.razorpayPaymentId) {

        const error =
            new Error(
                "Razorpay payment ID is missing"
            );

        error.statusCode = 400;

        throw error;
    }


    refund.status =
        "PROCESSING";

    refund.approvedAmount =
        amount;

    refund.reviewedBy =
        adminId;

    refund.reviewedAt =
        new Date();


    const idempotencyKey =
        crypto.randomUUID();


    refund.refundIdempotencyKey =
        idempotencyKey;


    await refund.save();


    try {

        const refundResponse =
            await axios.post(

                `${RAZORPAY_API}/payments/${refund.payment.razorpayPaymentId}/refund`,

                {

                    amount: Math.round(
                        amount * 100
                    ),

                    receipt: `refund_${refund._id.toString()}`,

                    notes: {

                        internalRefundId: refund._id.toString(),

                        orderId: refund.order._id.toString()

                    }

                },

                {

                    auth: getRazorpayAuth(),

                    headers: {

                        "Content-Type": "application/json",

                        "X-Refund-Idempotency": idempotencyKey

                    }

                }
            );


        const razorpayRefund =
            refundResponse.data;


        refund.status =
            "COMPLETED";

        refund.razorpayRefundId =
            razorpayRefund.id;

        refund.completedAt =
            new Date();


        await refund.save();


        // ========================================
        // PAYMENT STATUS
        // ========================================

        if (
            amount >=
            refund.payment.amount
        ) {

            refund.payment.status =
                "REFUNDED";

            refund.order.paymentStatus =
                "REFUNDED";

        } else {

            refund.payment.status =
                "PARTIALLY_REFUNDED";

            refund.order.paymentStatus =
                "PARTIALLY_REFUNDED";
        }


        await refund.payment.save();

        await refund.order.save();


        return refund;

    } catch (error) {

        refund.status =
            "FAILED";

        refund.failureReason =
            error.response &&
            error.response.data &&
            error.response.data.error &&
            error.response.data.error.description ||
            error.message;


        await refund.save();


        throw error;
    }
};


// ========================================
// COMPLETE COD REFUND
// ========================================

const completeCODRefund = async({
    refundId,
    adminId,
    bankTransferReference
}) => {

    const refund =
        await Refund.findById(
            refundId
        )
        .populate("payment")
        .populate("order");


    if (!refund) {

        const error =
            new Error(
                "Refund request not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // ========================================
    // MUST BE COD
    // ========================================

    if (
        refund.payment.paymentMethod !==
        "COD"
    ) {

        const error =
            new Error(
                "This refund is not a COD refund"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // MUST BE APPROVED
    // ========================================

    if (
        refund.status !==
        "APPROVED"
    ) {

        const error =
            new Error(
                "COD refund must be approved before completion"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // BANK TRANSFER REFERENCE
    // ========================================

    if (!bankTransferReference ||
        !bankTransferReference.trim()
    ) {

        const error =
            new Error(
                "Bank transfer reference is required"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // COMPLETE
    // ========================================

    refund.status =
        "COMPLETED";

    refund.bankTransferReference =
        bankTransferReference.trim();

    refund.bankTransferCompletedAt =
        new Date();

    refund.completedAt =
        new Date();

    refund.reviewedBy =
        refund.reviewedBy ||
        adminId;


    await refund.save();


    // ========================================
    // COD PAYMENT STATUS
    // ========================================

    /*
        COD was not paid online.

        Therefore we do NOT mark
        the Payment as REFUNDED through
        Razorpay.

        We only mark the internal refund
        as completed.
    */

    return refund;
};


export {
    createRefundRequest,
    getMyRefunds,
    getMyRefundById,
    getAllRefunds,
    rejectRefund,
    approveRefund,
    completeCODRefund
};