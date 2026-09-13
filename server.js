import "dotenv/config";

import http from "http";

import app from "./app.js";

import connectDatabase
from "./config/database.js";

import initializeSocket
from "./socket/socket.js";


// ========================================
// ENVIRONMENT
// ========================================

const PORT =
    process.env.PORT || 8080;


// ========================================
// HTTP SERVER
// ========================================

const httpServer =
    http.createServer(
        app
    );


// ========================================
// SOCKET.IO
// ========================================

const io =
    initializeSocket(
        httpServer
    );


// ========================================
// MAKE SOCKET.IO AVAILABLE
// ========================================

app.set(
    "io",
    io
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