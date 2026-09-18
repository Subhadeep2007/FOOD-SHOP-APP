import rateLimit from "express-rate-limit";


// ========================================
// AUTH RATE LIMITER
// ========================================

const authRateLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 80,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message: "Too many authentication requests. Please try again later."

    }

});


export default authRateLimiter;