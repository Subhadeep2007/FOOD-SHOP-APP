import jwt from "jsonwebtoken";

import Order
from "../models/order.model.js";

let socketServer = null;


// ========================================
// SOCKET AUTHENTICATION
// ========================================

const authenticateSocket = (
    socket,
    next
) => {

    try {

        const auth =
            socket.handshake.auth;


        if (!auth ||
            !auth.token
        ) {

            return next(
                new Error(
                    "Socket authentication required"
                )
            );
        }


        const decoded =
            jwt.verify(

                auth.token,

                process.env.ACCESS_TOKEN_SECRET

            );


        socket.user = {

            userId: decoded.userId,

            role: decoded.role

        };


        next();

    } catch (error) {

        next(
            new Error(
                "Invalid or expired socket token"
            )
        );
    }
};


// ========================================
// JOIN ORDER ROOM
// ========================================

const joinOrderRoom = async(
    io,
    socket,
    orderId
) => {

    try {

        if (!orderId) {

            socket.emit(
                "socket-error", {
                    message: "Order ID is required"
                }
            );

            return;
        }


        const order =
            await Order.findById(
                orderId
            )
            .select(
                "user deliveryPartner status"
            );


        if (!order) {

            socket.emit(
                "socket-error", {
                    message: "Order not found"
                }
            );

            return;
        }


        const userId =
            socket.user.userId;


        const isCustomer =
            order.user &&
            order.user.toString() ===
            userId;


        const isDeliveryPartner =
            order.deliveryPartner &&
            order.deliveryPartner.toString() ===
            userId;


        const isAdmin =
            socket.user.role ===
            "admin";


        if (!isCustomer &&
            !isDeliveryPartner &&
            !isAdmin
        ) {

            socket.emit(
                "socket-error", {
                    message: "You are not allowed to access this order"
                }
            );

            return;
        }


        const room =
            `order:${orderId}`;


        socket.join(
            room
        );


        socket.emit(
            "order-room-joined", {

                orderId,

                room,

                status: order.status

            }
        );


    } catch (error) {

        socket.emit(
            "socket-error", {
                message: "Unable to join order room"
            }
        );
    }
};


// ========================================
// JOIN DELIVERY ROOM
// ========================================

const joinDeliveryRoom = async(
    socket,
    orderId
) => {

    try {

        if (!orderId) {

            socket.emit(
                "socket-error", {
                    message: "Order ID is required"
                }
            );

            return;
        }


        const order =
            await Order.findById(
                orderId
            )
            .select(
                "deliveryPartner"
            );


        if (!order) {

            socket.emit(
                "socket-error", {
                    message: "Order not found"
                }
            );

            return;
        }


        const userId =
            socket.user.userId;


        const isAssignedDeliveryPartner =
            order.deliveryPartner &&
            order.deliveryPartner.toString() ===
            userId;


        const isAdmin =
            socket.user.role ===
            "admin";


        if (!isAssignedDeliveryPartner &&
            !isAdmin
        ) {

            socket.emit(
                "socket-error", {
                    message: "You are not allowed to access the delivery room"
                }
            );

            return;
        }


        const room =
            `order:${orderId}`;


        socket.join(
            room
        );


        socket.emit(
            "delivery-room-joined", {

                orderId,

                room

            }
        );


    } catch (error) {

        socket.emit(
            "socket-error", {
                message: "Unable to join delivery room"
            }
        );
    }
};


// ========================================
// DELIVERY LOCATION UPDATE
// ========================================

const updateDeliveryLocation = async(
    io,
    socket,
    data
) => {

    try {

        if (!data ||
            !data.orderId ||
            data.latitude === undefined ||
            data.longitude === undefined
        ) {

            socket.emit(
                "socket-error", {
                    message: "Order ID, latitude and longitude are required"
                }
            );

            return;
        }


        const latitude =
            Number(
                data.latitude
            );


        const longitude =
            Number(
                data.longitude
            );


        if (!Number.isFinite(
                latitude
            ) ||
            !Number.isFinite(
                longitude
            )
        ) {

            socket.emit(
                "socket-error", {
                    message: "Invalid location coordinates"
                }
            );

            return;
        }


        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {

            socket.emit(
                "socket-error", {
                    message: "Location coordinates are out of range"
                }
            );

            return;
        }


        const order =
            await Order.findById(
                data.orderId
            )
            .select(
                "deliveryPartner status"
            );


        if (!order) {

            socket.emit(
                "socket-error", {
                    message: "Order not found"
                }
            );

            return;
        }


        const userId =
            socket.user.userId;


        const isAssignedDeliveryPartner =
            order.deliveryPartner &&
            order.deliveryPartner.toString() ===
            userId;


        if (!isAssignedDeliveryPartner) {

            socket.emit(
                "socket-error", {
                    message: "Only the assigned delivery partner can update location"
                }
            );

            return;
        }


        // ========================================
        // LOCATION UPDATE ONLY DURING DELIVERY
        // ========================================

        if (
            order.status !==
            "OUT_FOR_DELIVERY"
        ) {

            socket.emit(
                "socket-error", {
                    message: "Live location is available only when order is out for delivery"
                }
            );

            return;
        }


        const locationData = {

            orderId: data.orderId,

            latitude,

            longitude,

            updatedAt: new Date()

        };


        const room =
            `order:${data.orderId}`;


        io.to(
            room
        ).emit(
            "delivery-location-updated",
            locationData
        );


    } catch (error) {

        socket.emit(
            "socket-error", {
                message: "Unable to update delivery location"
            }
        );
    }
};


// ========================================
// ORDER STATUS BROADCAST
// ========================================

const broadcastOrderStatus = async(
    io,
    orderId,
    status
) => {

    if (!orderId ||
        !status
    ) {

        return;
    }


    const activeIo =
        io ||
        socketServer;

    if (!activeIo) {
        return;
    }

    const room =
        `order:${orderId}`;


    activeIo.to(
        room
    ).emit(
        "order-status-updated", {

            orderId,

            status,

            updatedAt: new Date()

        }
    );
};


// ========================================
// ORDER CANCELLED BROADCAST
// ========================================

const broadcastOrderCancellation = async(
    io,
    order
) => {

    if (!order) {

        return;
    }


    if (!socketServer) {
        return;
    }

    const room =
        `order:${order._id}`;


    socketServer.to(
        room
    ).emit(
        "order-cancelled", {

            orderId: order._id,

            orderNumber: order.orderNumber,

            status: order.status,

            cancellationReason: order.cancellationReason,

            cancelledBy: order.cancelledBy,

            cancelledAt: order.cancelledAt

        }
    );
};


// ========================================
// REGISTER ORDER SOCKET EVENTS
// ========================================

const registerOrderSocket =
    (
        io,
        socket
    ) => {

        socket.on(
            "join-order-room",
            async(
                orderId
            ) => {

                await joinOrderRoom(

                    io,

                    socket,

                    orderId

                );

            }
        );


        socket.on(
            "join-delivery-room",
            async(
                orderId
            ) => {

                await joinDeliveryRoom(

                    socket,

                    orderId

                );

            }
        );


        socket.on(
            "delivery-location-update",
            async(
                data
            ) => {

                await updateDeliveryLocation(

                    io,

                    socket,

                    data

                );

            }
        );

    };


// ========================================
// INITIALIZE ORDER SOCKET
// ========================================

const initializeOrderSocket = (
    io
) => {

    socketServer = io;

    io.use(
        authenticateSocket
    );


    io.on(
        "connection",
        (socket) => {

            console.log(

                `Socket connected: ${socket.id} | User: ${socket.user.userId}`

            );


            registerOrderSocket(

                io,

                socket

            );


            socket.on(
                "disconnect",
                (reason) => {

                    console.log(

                        `Socket disconnected: ${socket.id} | ${reason}`

                    );

                }
            );

        }
    );

};


// ========================================
// EXPORTS
// ========================================

export {

    initializeOrderSocket,

    broadcastOrderStatus,

    broadcastOrderCancellation

};
