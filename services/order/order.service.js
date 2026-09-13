import mongoose from "mongoose";

import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import Food from "../../models/food.model.js";
import Address from "../../models/address.model.js";

import generateOrderId
from "../../utils/generateOrderId.js";


// ========================================
// CONSTANTS
// ========================================

const DELIVERY_FEE = 40;

const TAX_PERCENTAGE = 0;


// ========================================
// CREATE ORDER
// ========================================

const createOrder = async({
    userId,
    addressId,
    paymentMethod
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
                        `Food is no longer available`
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


            // ----------------------------------------
            // Server-side price calculation
            // ----------------------------------------

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

                image: food.images && food.images.length > 0 ?
                    food.images[0] : "",

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
        // PRICE CALCULATION
        // ========================================

        const discount = 0;

        const deliveryFee =
            DELIVERY_FEE;

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

                deliveryAddress,

                subtotal,

                discount,

                deliveryFee,

                tax,

                totalAmount,

                paymentMethod,

                paymentStatus: "PENDING",

                status: "PLACED"

            });


        await order.save({
            session
        });


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


            // Automatically unavailable
            // when stock reaches zero.

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


        return Order.findById(
                order._id
            )
            .populate(
                "user",
                "name email"
            );

    } catch (error) {

        await session.abortTransaction();

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
            createdAt: -1
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
            "name email"
        )
        .populate(
            "deliveryPartner",
            "name"
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


        order.status =
            "CANCELLED";

        order.cancellationReason =
            reason || "Cancelled by customer";

        order.cancelledBy =
            "customer";

        order.cancelledAt =
            new Date();


        // Payment is handled by Day 5
        // and refund by Day 6.

        await order.save({
            session
        });


        await session.commitTransaction();


        return order;

    } catch (error) {

        await session.abortTransaction();

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


    const skip =
        (
            Number(page) - 1
        ) *
        Number(limit);


    const [
        orders,
        total
    ] =
    await Promise.all([

        Order.find(query)

        .populate(
            "user",
            "name email"
        )

        .populate(
            "deliveryPartner",
            "name"
        )

        .sort({
            createdAt: -1
        })

        .skip(skip)

        .limit(
            Number(limit)
        ),

        Order.countDocuments(
            query
        )

    ]);


    return {

        orders,

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
// ADMIN GET ONE
// ========================================

const getAdminOrderById = async(
    orderId
) => {

    return Order.findById(
            orderId
        )
        .populate(
            "user",
            "name email"
        )
        .populate(
            "deliveryPartner",
            "name"
        );
};


// ========================================
// ADMIN UPDATE STATUS
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


        // Restore stock

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


        return order;

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();
    }
};


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