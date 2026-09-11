import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";

const app = express();


// ========================================
// SECURITY
// ========================================

app.use(
    helmet()
);


// ========================================
// LOGGING
// ========================================

if (process.env.NODE_ENV !== "test") {
    app.use(
        morgan("dev")
    );
}


// ========================================
// CORS
// ========================================

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);


// ========================================
// BODY PARSERS
// ========================================

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


// ========================================
// COOKIES
// ========================================

app.use(
    cookieParser()
);


// ========================================
// HEALTH CHECK
// ========================================

app.get(
    "/api/health",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message: "Food Shop API is running",

            timestamp: new Date().toISOString()

        });
    }
);


// ========================================
// API ROUTES
// ========================================

app.use(
    "/api/auth",
    authRoutes
);


// ========================================
// 404 HANDLER
// ========================================

app.use(
    (req, res) => {

        return res.status(404).json({

            success: false,

            message: `Route not found: ${req.method} ${req.originalUrl}`

        });
    }
);


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
    (error, req, res, next) => {

        console.error(
            "ERROR:",
            error
        );


        const statusCode =
            error.statusCode || 500;


        return res.status(
            statusCode
        ).json({

            success: false,

            message: error.message ||
                "Internal server error"

        });
    }
);


export default app;