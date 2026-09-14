import { Server } from "socket.io";

import {
    initializeOrderSocket
} from "./order.socket.js";


// ========================================
// INITIALIZE SOCKET.IO
// ========================================

const initializeSocket = (
    httpServer
) => {

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
    // INITIALIZE ORDER SOCKET
    // ========================================

    initializeOrderSocket(
        io
    );


    return io;
};


// ========================================
// EXPORT
// ========================================

export default initializeSocket;