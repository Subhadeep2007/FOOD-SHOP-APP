import mongoose from "mongoose";

import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import Food from "../../models/food.model.js";
import Address from "../../models/address.model.js";
import generateOrderId from "../../utils/generateOrderId.js";

import {
    validateCoupon
} from "../coupon/coupon.service.js";

import CouponUsage from "../../models/couponUsage.model.js";
import Coupon from "../../models/coupon.model.js";

import {
    createNotification
} from "../notification/notification.service.js";


// ========================================
// CONSTANTS
// ========================================

const TAX_PERCENTAGE = 0;


// ========================================
// CREATE ORDER
// ========================================

const createOrder = async({
    userId,
    addressId,
    paymentMethod,
    couponCode
}) => {

    const session =
        await mongoose.startSession();


    try {

        session.startTransaction();


        // ========================================
        // ADDRESS
        // ========================================

        const address =
            await Address.findOne({

                _id: addressId,

                user: userId,

                isActive: true

            }).session(session);


        if (!address) {

            const error =
                new Error(
                    "Delivery address not found"
                );

            error.statusCode = 404;

            throw error;
        }


        // ========================================
        // CART
        // ========================================

        const cart =
            await Cart.findOne({
                user: userId
            })
            .populate("items.food")
            .session(session);


        if (!cart ||
            cart.items.length === 0
        ) {

            const error =
                new Error(
                    "Your cart is empty"
                );

            error.statusCode = 400;

            throw error;
        }


        // ========================================
        // BUILD ORDER ITEMS
        // ========================================

        const orderItems = [];

        let subtotal = 0;


        for (
            const cartItem of cart.items
        ) {

            const food =
                cartItem.food;


            if (!food ||
                !food.isActive ||
                !food.isAvailable
            ) {

                const error =
                    new Error(
                        "Food is no longer available"
                    );

                error.statusCode = 400;

                throw error;
            }


            if (
                food.stock <
                cartItem.quantity
            ) {

                const error =
                    new Error(
                        `${food.name} does not have enough stock`
                    );

                error.statusCode = 400;

                throw error;
            }


            // ========================================
            // SERVER SIDE PRICE CALCULATION
            // ========================================

            const discountAmount =
                (
                    food.price *
                    food.discountPercentage
                ) / 100;


            const finalUnitPrice =
                Number(
                    (
                        food.price -
                        discountAmount
                    ).toFixed(2)
                );


            const itemSubtotal =
                Number(
                    (
                        finalUnitPrice *
                        cartItem.quantity
                    ).toFixed(2)
                );


            subtotal +=
                itemSubtotal;


            orderItems.push({

                food: food._id,

                name: food.name,

                image: food.images &&
                    food.images.length > 0 ?
                    food.images[0] :
                    "",

                quantity: cartItem.quantity,

                unitPrice: finalUnitPrice,

                discountPercentage: food.discountPercentage,

                subtotal: itemSubtotal

            });
        }


        subtotal =
            Number(
                subtotal.toFixed(2)
            );


        // ========================================
        // COUPON VALIDATION
        // ========================================

        let discount = 0;

        let appliedCoupon = null;


        if (couponCode) {

            const couponResult =
                await validateCoupon({

                    userId,

                    code: couponCode,

                    orderAmount: subtotal

                });


            discount =
                couponResult.discountAmount;


            appliedCoupon =
                couponResult.coupon;
        }


        // ========================================
        // PRICE CALCULATION
        // ========================================

        let deliveryFee;


        if (
            subtotal <= 100
        ) {

            deliveryFee = 5;

        } else if (
            subtotal <= 1000
        ) {

            deliveryFee = 15;

        } else {

            deliveryFee = 40;
        }


        const tax =
            Number(
                (
                    subtotal *
                    TAX_PERCENTAGE /
                    100
                ).toFixed(2)
            );


        const totalAmount =
            Number(
                (
                    subtotal -
                    discount +
                    deliveryFee +
                    tax
                ).toFixed(2)
            );


        // ========================================
        // ADDRESS SNAPSHOT
        // ========================================

        const deliveryAddress = {

            fullName: address.fullName,

            phone: address.phone,

            addressLine: address.addressLine,

            landmark: address.landmark,

            city: address.city,

            state: address.state,

            postalCode: address.postalCode,

            country: address.country,

            latitude: address.latitude,

            longitude: address.longitude,

            formattedAddress: address.formattedAddress,

            placeId: address.placeId

        };


        // ========================================
        // CREATE ORDER
        // ========================================

        const order =
            new Order({

                orderNumber: generateOrderId(),

                user: userId,

                items: orderItems,

                deliveryAddress: deliveryAddress,

                subtotal: subtotal,

                discount: discount,

                deliveryFee: deliveryFee,

                tax: tax,

                totalAmount: totalAmount,

                paymentMethod: paymentMethod,

                paymentStatus: "PENDING",

                status: "PLACED"

            });


        await order.save({
            session
        });


        // ========================================
        // COUPON USAGE
        // ========================================

        if (appliedCoupon) {

            await CouponUsage.create(
                [{

                    coupon: appliedCoupon._id,

                    user: userId,

                    order: order._id,

                    discountAmount: discount

                }], {
                    session
                }
            );


            await Coupon.findByIdAndUpdate(

                appliedCoupon._id,

                {
                    $inc: {
                        usedCount: 1
                    }
                },

                {
                    session
                }

            );
        }


        // ========================================
        // REDUCE STOCK
        // ========================================

        for (
            const item of cart.items
        ) {

            const updatedFood =
                await Food.findOneAndUpdate(

                    {
                        _id: item.food._id,

                        stock: {
                            $gte: item.quantity
                        },

                        isActive: true,

                        isAvailable: true
                    },

                    {
                        $inc: {
                            stock:
                                -item.quantity
                        }
                    },

                    {
                        new: true,

                        session
                    }

                );


            if (!updatedFood) {

                const error =
                    new Error(
                        "Stock changed while placing the order. Please try again."
                    );

                error.statusCode = 409;

                throw error;
            }


            // ========================================
            // AUTO UNAVAILABLE
            // ========================================

            if (
                updatedFood.stock === 0
            ) {

                await Food.updateOne(

                    {
                        _id: updatedFood._id
                    },

                    {
                        isAvailable: false
                    },

                    {
                        session
                    }

                );
            }
        }


        // ========================================
        // CLEAR CART
        // ========================================

        cart.items = [];


        await cart.save({
            session
        });


        await session.commitTransaction();


        // ========================================
        // ORDER NOTIFICATION
        // ========================================

        await createNotification({

            userId:

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


        return Order.findById(
                order._id
            )
            .populate(
                "user",
                "name email profileImage"
            );

    } catch (error) {

        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();
        }

        throw error;

    } finally {

        await session.endSession();
    }
};


// ========================================
// GET MY ORDERS
// ========================================

const getMyOrders = async(
    userId
) => {

    return Order.find({

            user: userId

        })
        .sort({

            createdAt:
                -1

        });
};


// ========================================
// GET SINGLE MY ORDER
// ========================================

const getMyOrderById = async(
    userId,
    orderId
) => {

    return Order.findOne({

            _id: orderId,

            user: userId

        })
        .populate(
            "user",
            "name email profileImage"
        )
        .populate(
            "deliveryPartner",
            "name email profileImage"
        );
};


// ========================================
// CUSTOMER CANCEL ORDER
// ========================================

const cancelMyOrder = async(
    userId,
    orderId,
    reason
) => {

    const session =
        await mongoose.startSession();


    try {

        session.startTransaction();


        const order =
            await Order.findOne({

                _id: orderId,

                user: userId

            }).session(session);


        if (!order) {

            const error =
                new Error(
                    "Order not found"
                );

            error.statusCode = 404;

            throw error;
        }


        // ========================================
        // CANCELLABLE STATUS
        // ========================================

        const cancellableStatuses = [

            "PLACED",

            "CONFIRMED"

        ];


        if (!cancellableStatuses.includes(
                order.status
            )) {

            const error =
                new Error(
                    "This order can no longer be cancelled"
                );

            error.statusCode = 400;

            throw error;
        }


        // ========================================
        // RESTORE STOCK
        // ========================================

        for (
            const item of order.items
        ) {

            const food =
                await Food.findById(
                    item.food
                ).session(session);


            if (!food) {

                continue;
            }


            food.stock +=
                item.quantity;


            if (
                food.stock > 0
            ) {

                food.isAvailable =
                    true;
            }


            await food.save({
                session
            });
        }


        // ========================================
        // UPDATE ORDER
        // ========================================

        order.status =
            "CANCELLED";

        order.cancellationReason =
            reason ||
            "Cancelled by customer";

        order.cancelledBy =
            "customer";

        order.cancelledAt =
            new Date();


        await order.save({
            session
        });


        await session.commitTransaction();


        // ========================================
        // NOTIFICATION
        // ========================================

        await createNotification({

            userId: userId,

            type: "ORDER",

            title: "Order cancelled",

            message: `Your order ${order.orderNumber} has been cancelled.`,

            data: {

                orderId: order._id,

                orderNumber: order.orderNumber,

                status: order.status

            }

        });


        return order;

    } catch (error) {

        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();
        }

        throw error;

    } finally {

        await session.endSession();
    }
};


// ========================================
// ADMIN GET ALL ORDERS
// ========================================

const getAllOrders = async({
    status,
    page = 1,
    limit = 20
}) => {

    const query = {};


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
        orders,
        total
    ] =
    await Promise.all([

        Order.find(query)

        // ========================================
        // CUSTOMER DETAILS
        // ========================================

        .populate(
            "user",
            "name email profileImage role isActive"
        )

        // ========================================
        // DELIVERY PARTNER DETAILS
        // ========================================

        .populate(
            "deliveryPartner",
            "name email profileImage"
        )

        // ========================================
        // PAYMENT DETAILS
        // ========================================

        .populate(
            "payment",
            "paymentMethod amount currency status razorpayOrderId razorpayPaymentId failureReason capturedAt paidAt"
        )

        .sort({
            createdAt:
                -1
        })

        .skip(
            skip
        )

        .limit(
            currentLimit
        ),


        Order.countDocuments(
            query
        )

    ]);


    return {

        orders,

        pagination: {

            page: currentPage,

            limit: currentLimit,

            total:

                total,

            pages: Math.ceil(
                total /
                currentLimit
            )

        }

    };
};


// ========================================
// ADMIN GET SINGLE ORDER
// ========================================

const getAdminOrderById = async(
    orderId
) => {

    return Order.findById(
        orderId
    )

    // ========================================
    // CUSTOMER DETAILS
    // ========================================

    .populate(
        "user",
        "name email profileImage role isActive"
    )

    // ========================================
    // DELIVERY PARTNER
    // ========================================

    .populate(
        "deliveryPartner",
        "name email profileImage"
    )

    // ========================================
    // PAYMENT DETAILS
    // ========================================

    .populate(
        "payment",
        "paymentMethod amount currency status razorpayOrderId razorpayPaymentId failureReason capturedAt paidAt"
    );
};


// ========================================
// ADMIN UPDATE ORDER STATUS
// ========================================

const updateOrderStatus = async(
    orderId,
    newStatus
) => {

    const order =
        await Order.findById(
            orderId
        );


    if (!order) {

        const error =
            new Error(
                "Order not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // ========================================
    // VALID STATUS FLOW
    // ========================================

    const allowedTransitions = {

        PLACED: [

            "CONFIRMED",

            "CANCELLED"

        ],

        CONFIRMED: [

            "PREPARING",

            "CANCELLED"

        ],

        PREPARING: [

            "READY_FOR_PICKUP"

        ],

        READY_FOR_PICKUP: [

            "OUT_FOR_DELIVERY"

        ],

        OUT_FOR_DELIVERY: [

            "DELIVERED"

        ],

        DELIVERED: [],

        CANCELLED: []

    };


    const allowed =
        allowedTransitions[
            order.status
        ] || [];


    if (!allowed.includes(
            newStatus
        )) {

        const error =
            new Error(
                `Cannot change order status from ${order.status} to ${newStatus}`
            );

        error.statusCode = 400;

        throw error;
    }


    order.status =
        newStatus;


    await order.save();


    // ========================================
    // STATUS NOTIFICATION
    // ========================================

    await createNotification({

        userId: order.user,

        type: "ORDER",

        title: "Order status updated",

        message: `Your order ${order.orderNumber} is now ${newStatus}.`,

        data: {

            orderId: order._id,

            orderNumber: order.orderNumber,

            status: newStatus

        }

    });


    return order;
};


// ========================================
// ADMIN CANCEL ORDER
// ========================================

const cancelOrderByAdmin = async(
    orderId,
    reason
) => {

    const session =
        await mongoose.startSession();


    try {

        session.startTransaction();


        const order =
            await Order.findById(
                orderId
            ).session(session);


        if (!order) {

            const error =
                new Error(
                    "Order not found"
                );

            error.statusCode = 404;

            throw error;
        }


        // ========================================
        // CANNOT CANCEL
        // ========================================

        if (
            [
                "DELIVERED",
                "CANCELLED",
                "OUT_FOR_DELIVERY"
            ].includes(
                order.status
            )
        ) {

            const error =
                new Error(
                    "This order cannot be cancelled"
                );

            error.statusCode = 400;

            throw error;
        }


        // ========================================
        // RESTORE STOCK
        // ========================================

        for (
            const item of order.items
        ) {

            const food =
                await Food.findById(
                    item.food
                ).session(session);


            if (!food) {

                continue;
            }


            food.stock +=
                item.quantity;


            food.isAvailable =
                food.stock > 0;


            await food.save({
                session
            });
        }


        // ========================================
        // UPDATE ORDER
        // ========================================

        order.status =
            "CANCELLED";

        order.cancellationReason =
            reason ||
            "Cancelled by admin";

        order.cancelledBy =
            "admin";

        order.cancelledAt =
            new Date();


        await order.save({
            session
        });


        await session.commitTransaction();


        // ========================================
        // ADMIN CANCELLATION NOTIFICATION
        // ========================================

        await createNotification({

            userId: order.user,

            type: "ORDER",

            title: "Order cancelled",

            message: `Your order ${order.orderNumber} has been cancelled by the restaurant.`,

            data: {

                orderId: order._id,

                orderNumber: order.orderNumber,

                status: order.status

            }

        });


        return order;

    } catch (error) {

        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();
        }

        throw error;

    } finally {

        await session.endSession();
    }
};


// ========================================
// EXPORTS
// ========================================

export {

    createOrder,

    getMyOrders,

    getMyOrderById,

    cancelMyOrder,

    getAllOrders,

    getAdminOrderById,

    updateOrderStatus,

    cancelOrderByAdmin

};