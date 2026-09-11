import "dotenv/config";

import http from "http";

import app from "./app.js";

import connectDatabase
from "./config/db.js";

import { Server } from "socket.io";


// ========================================
// ENVIRONMENT
// ========================================

const PORT =
    process.env.PORT || 8080;


// ========================================
// HTTP SERVER
// ========================================

const httpServer =
    http.createServer(app);


// ========================================
// SOCKET.IO
// ========================================

const io =
    new Server(
        httpServer, {
            cors: {

                origin: process.env.FRONTEND_URL,

                credentials: true
            }
        }
    );


// ========================================
// SOCKET CONNECTION
// ========================================

io.on(
    "connection",
    (socket) => {

        console.log(
            `Socket connected: ${socket.id}`
        );


        // ----------------------------------------
        // USER JOINS ORDER ROOM
        // ----------------------------------------

        socket.on(
            "join-order-room",
            (orderId) => {

                if (!orderId) {
                    return;
                }


                const room =
                    `order:${orderId}`;


                socket.join(
                    room
                );


                console.log(
                    `Socket ${socket.id} joined ${room}`
                );
            }
        );


        // ----------------------------------------
        // DELIVERY PARTNER JOINS ORDER ROOM
        // ----------------------------------------

        socket.on(
            "join-delivery-room",
            (orderId) => {

                if (!orderId) {
                    return;
                }


                const room =
                    `order:${orderId}`;


                socket.join(
                    room
                );


                console.log(
                    `Delivery socket ${socket.id} joined ${room}`
                );
            }
        );


        // ----------------------------------------
        // DISCONNECT
        // ----------------------------------------

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


// ========================================
// DATABASE + SERVER START
// ========================================

const startServer = async() => {

    try {

        await connectDatabase();


        httpServer.listen(
            PORT,
            () => {

                console.log(
                    `Food Shop server running on port ${PORT}`
                );

                console.log(
                    `Frontend:
${process.env.FRONTEND_URL}`
                );

            }
        );

    } catch (error) {

        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};


startServer();