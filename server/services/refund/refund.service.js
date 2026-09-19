import crypto from "crypto";
import axios from "axios";

import Refund
from "../../models/refund.model.js";

import Payment
from "../../models/payment.model.js";

import Order
from "../../models/order.model.js";


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
// MASK BANK ACCOUNT NUMBER
// ========================================

const maskAccountNumber = (
    accountNumber
) => {

    if (!accountNumber) {

        return "";
    }


    const value =
        accountNumber.toString();


    if (
        value.length <= 4
    ) {

        return "****";
    }


    return (
        "*".repeat(
            value.length - 4
        ) +
        value.slice(-4)
    );
};


// ========================================
// CUSTOMER REFUND RESPONSE
// ========================================

const formatRefundForCustomer = (
    refund
) => {

    const refundData =
        refund.toObject ?
        refund.toObject() :
        refund;


    if (
        refundData.bankDetails
    ) {

        refundData.bankDetails = {

            accountHolderName: refundData.bankDetails.accountHolderName ||
                "",

            accountNumber: maskAccountNumber(
                refundData.bankDetails.accountNumber
            ),

            ifscCode: refundData.bankDetails.ifscCode ||
                "",

            bankName: refundData.bankDetails.bankName ||
                "",

            accountType: refundData.bankDetails.accountType ||
                ""

        };
    }


    return refundData;
};


// ========================================
// REFUND CALCULATION
// ========================================

const calculateRefundAmount = (
    order,
    payment,
    alreadyRefundedAmount = 0
) => {

    // ========================================
    // COD REFUND
    // ========================================

    if (
        payment.paymentMethod ===
        "COD"
    ) {

        /*
            Refundable amount:

            Final order total (including delivery fees,
            taxes, and discounts already applied).
        */

        const foodRefundableAmount =
            Math.max(
                0,
                Number(order.totalAmount || 0)
            );


        const remainingRefundableAmount =
            Math.max(
                0,
                foodRefundableAmount -
                Number(alreadyRefundedAmount || 0)
            );


        const nonRefundableAmount = 0;


        return {

            refundableAmount: Number(
                remainingRefundableAmount.toFixed(2)
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
        Math.max(
            0,
            Number(order.totalAmount || 0) -
            Number(alreadyRefundedAmount || 0)
        );


    return {

        refundableAmount: Number(
            refundableAmount.toFixed(2)
        ),

        nonRefundableAmount: 0

    };
};


// ========================================
// GET ALREADY REFUNDED AMOUNT
// ========================================

const getAlreadyRefundedAmount = async(
    orderId,
    excludeRefundId = null
) => {

    const query = {

        order: orderId,

        status: "COMPLETED"

    };


    if (
        excludeRefundId
    ) {

        query._id = {

            $ne: excludeRefundId

        };
    }


    const completedRefunds =
        await Refund.find(
            query
        );


    const totalRefunded =
        completedRefunds.reduce(
            (
                total,
                refund
            ) =>
            total +
            Number(
                refund.approvedAmount || 0
            ),
            0
        );


    return Number(
        totalRefunded.toFixed(2)
    );
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

            user: userId,

            deletedByCustomerAt: null

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

    if (
        order.status !== "CANCELLED"
    ) {

        const error =
            new Error(
                "Refund requests are available only after the order is cancelled"
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

            user: userId,

            deletedByCustomerAt: null

        });


    if (!payment) {

        const error =
            new Error(
                "Payment record not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // COD orders have no customer payment to return. Refunds are allowed
    // only after an online payment has been successfully captured.
    if (
        payment.paymentMethod !== "ONLINE" ||
        payment.status !== "CAPTURED"
    ) {

        const error =
            new Error(
                "Only successfully paid online orders are eligible for a refund"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // ONLINE PAYMENT FULL REFUND CHECK
    // ========================================

    if (
        payment.paymentMethod === "ONLINE" &&
        payment.status === "REFUNDED"
    ) {

        const error =
            new Error(
                "This order is already fully refunded"
            );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // ALREADY COMPLETED REFUNDS
    // ========================================

    const alreadyRefundedAmount =
        await getAlreadyRefundedAmount(
            order._id
        );


    // ========================================
    // REFUND CALCULATION
    // ========================================

    const refundCalculation =
        calculateRefundAmount(
            order,
            payment,
            alreadyRefundedAmount
        );


    // ========================================
    // NO REFUND AVAILABLE
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

    // Refund requests always use the final payable order total.
    let requestedAmount =
        refundCalculation.refundableAmount;


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
    // BANK DETAILS (required for every refund type)
    // ========================================

    let savedBankDetails =
        null;


    if (!bankDetails ||
            !bankDetails.accountHolderName ||
            !bankDetails.accountNumber ||
            !bankDetails.ifscCode ||
            !bankDetails.bankName ||
            !bankDetails.accountType
        ) {

            const error =
                new Error(
                "Complete bank details are required for a refund"
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


    // ========================================
    // CHECK ACTIVE REFUND REQUEST
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


const updateRefundBankDetails = async({
    userId,
    refundId,
    bankDetails
}) => {
    const refund = await Refund.findOne({
        _id: refundId,
        user: userId,
        status: { $in: ["REQUESTED", "UNDER_REVIEW"] }
    });

    if (!refund) {
        const error = new Error("Bank details can be edited only while the refund is under review");
        error.statusCode = 400;
        throw error;
    }

    refund.bankDetails = {
        accountHolderName: bankDetails.accountHolderName.trim(),
        accountNumber: bankDetails.accountNumber.trim(),
        ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
        bankName: bankDetails.bankName.trim(),
        accountType: bankDetails.accountType
    };

    await refund.save();
    return formatRefundForCustomer(refund);
};


// ========================================
// USER REFUNDS
// ========================================

const getMyRefunds = async(
    userId
) => {

    const refunds =
        await Refund.find({

            user: userId

        })
        .populate(

            "order",

            "orderNumber totalAmount subtotal discount deliveryFee tax status paymentMethod paymentStatus items"

        )
        .sort({

            createdAt: -1

        });


    return refunds.map(
        refund =>
        formatRefundForCustomer(
            refund
        )
    );
};


// ========================================
// SINGLE REFUND
// ========================================

const getMyRefundById = async(
    userId,
    refundId
) => {

    const refund =
        await Refund.findOne({

            _id: refundId,

            user: userId

        })
        .populate(

            "order",

            "orderNumber totalAmount subtotal discount deliveryFee tax status paymentMethod paymentStatus items"

        );


    if (!refund) {

        return null;
    }


    return formatRefundForCustomer(
        refund
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

    const query = {
        deletedByAdminAt: null
    };


    if (status) {

        query.status =
            status;
    }


    const currentPage =
        Math.max(
            1,
            Number(page) || 1
        );


    const currentLimit =
        Math.min(
            100,
            Math.max(
                1,
                Number(limit) || 20
            )
        );


    const skip =
        (
            currentPage - 1
        ) *
        currentLimit;


    const [
        refunds,
        total
    ] =
    await Promise.all([

        Refund.find(query)

        // ========================================
        // USER DETAILS
        // ========================================

        .populate(
            "user",
            "name email profileImage shopLocation isEmailVerified role isActive createdAt updatedAt"
        )

        // ========================================
        // ORDER DETAILS
        // ========================================

        .populate(
            "order",
            "orderNumber totalAmount subtotal discount deliveryFee tax status paymentMethod deliveryAddress items createdAt updatedAt"
        )

        // ========================================
        // PAYMENT DETAILS
        // ========================================

        .populate(
            "payment",
            "paymentMethod amount currency status razorpayOrderId razorpayPaymentId failureReason capturedAt paidAt"
        )

        // ========================================
        // REVIEWED BY ADMIN
        // ========================================

        .populate(
            "reviewedBy",
            "name email profileImage role"
        )

        .sort({

            createdAt: -1

        })

        .skip(
            skip
        )

        .limit(
            currentLimit
        ),


        Refund.countDocuments(
            query
        )

    ]);


    const refundsWithOrderBankDetails = refunds.map(refund => {
        const refundData = refund.toObject();
        if (refundData.order) {
            refundData.order.refundBankDetails = refundData.bankDetails;
        }
        if (refundData.order) {
            refundData.order.refundPaymentDetails = refundData.payment;
        }
        return refundData;
    });

    return {

        refunds: refundsWithOrderBankDetails,

        pagination: {

            page: currentPage,

            limit: currentLimit,

            total,

            pages: Math.ceil(
                total /
                currentLimit
            )

        }

    };
};


// ========================================
// ADMIN REJECT REFUND
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


    // ========================================
    // VALID STATUS
    // ========================================

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


    // ========================================
    // REJECT
    // ========================================

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


    // ========================================
    // VALID STATUS
    // ========================================

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
    // PREVIOUS COMPLETED REFUNDS
    // ========================================

    const alreadyRefundedAmount =
        await getAlreadyRefundedAmount(

            refund.order._id,

            refund._id

        );


    // ========================================
    // CURRENT REMAINING AMOUNT
    // ========================================

    const refundCalculation =
        calculateRefundAmount(

            refund.order,

            refund.payment,

            alreadyRefundedAmount

        );


    // ========================================
    // APPROVED AMOUNT
    // ========================================

    // Do not allow an admin-entered partial amount: return the requested final total.
    let amount = refund.requestedAmount;


    const maximumAmount =
        Math.min(

            refundCalculation.refundableAmount,

            refund.requestedAmount

        );


    if (
        amount <= 0 ||
        amount > maximumAmount
    ) {

        const error =
            new Error(
                `Maximum approvable refund amount is ₹${maximumAmount}`
            );

        error.statusCode = 400;

        throw error;
    }


    amount =
        Number(
            amount.toFixed(2)
        );


    // ========================================
    // COD REFUND
    // ========================================

    if (
        refund.payment.paymentMethod ===
        "COD"
    ) {

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


    // ========================================
    // PROCESSING
    // ========================================

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


        // ========================================
        // REFUND COMPLETED
        // ========================================

        refund.status =
            "COMPLETED";

        refund.razorpayRefundId =
            razorpayRefund.id;

        refund.completedAt =
            new Date();


        await refund.save();


        // ========================================
        // TOTAL COMPLETED REFUNDS
        // ========================================

        const totalRefundedAmount =
            await getAlreadyRefundedAmount(
                refund.order._id
            );


        const paymentAmount =
            Number(
                refund.payment.amount || 0
            );


        // ========================================
        // PAYMENT STATUS
        // ========================================

        if (
            totalRefundedAmount >=
            paymentAmount
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


    /*
        COD payment is not processed through
        Razorpay.

        Therefore we do not mark COD Payment
        as REFUNDED through Razorpay.

        Refund itself is marked COMPLETED.
    */


    return refund;
};


// ========================================
// SOFT DELETE TERMINAL REFUNDS
// ========================================

const assertRefundCanBeDeleted = (refund, allowedStatuses) => {
    if (!allowedStatuses.includes(refund.status)) {
        const error = new Error("This refund request cannot be deleted at its current status");
        error.statusCode = 400;
        throw error;
    }
};

const softDeleteMyRefund = async(userId, refundId) => {
    const refund = await Refund.findOne({ _id: refundId, user: userId, deletedByCustomerAt: null });
    if (!refund) {
        const error = new Error("Refund request not found");
        error.statusCode = 404;
        throw error;
    }
    assertRefundCanBeDeleted(refund, ["COMPLETED"]);
    refund.deletedByCustomerAt = new Date();
    await refund.save();
    return refund;
};

const softDeleteRefundByAdmin = async(refundId) => {
    const refund = await Refund.findOne({ _id: refundId, deletedByAdminAt: null });
    if (!refund) {
        const error = new Error("Refund request not found");
        error.statusCode = 404;
        throw error;
    }
    assertRefundCanBeDeleted(refund, ["COMPLETED", "REJECTED"]);
    refund.deletedByAdminAt = new Date();
    await refund.save();
    return refund;
};


// ========================================
// EXPORTS
// ========================================

export {

    createRefundRequest,
    updateRefundBankDetails,

    getMyRefunds,

    getMyRefundById,

    getAllRefunds,

    rejectRefund,

    approveRefund,

    completeCODRefund,

    softDeleteMyRefund,

    softDeleteRefundByAdmin

};
