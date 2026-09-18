import express from "express";

import {
    register,
    adminRegister,
    verifyEmail,
    resendVerificationOTP,
    login,
    adminLogin,
    refreshToken,
    logout,
    logoutAll,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController,
    updateProfileImageController
} from "../controllers/auth/auth.controller.js";

import {
    registerSchema,
    adminRegisterSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    loginSchema,
    adminLoginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from "../validators/auth.validator.js";

import validate
from "../middleware/validate.middleware.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import authRateLimiter
from "../middleware/rateLimit.middleware.js";

import upload
from "../middleware/upload.middleware.js";


const router =
    express.Router();


// ========================================
// USER REGISTER
// ========================================

router.post(
    "/register",
    authRateLimiter,
    validate(registerSchema),
    register
);


// ========================================
// ADMIN REGISTER
// ========================================

router.post(
    "/admin/register",
    authRateLimiter,
    validate(adminRegisterSchema),
    adminRegister
);


// ========================================
// VERIFY EMAIL
// ========================================

router.post(
    "/verify-email",
    authRateLimiter,
    validate(verifyEmailSchema),
    verifyEmail
);


// ========================================
// RESEND VERIFICATION
// ========================================

router.post(
    "/resend-verification",
    authRateLimiter,
    validate(resendVerificationSchema),
    resendVerificationOTP
);


// ========================================
// USER LOGIN
// ========================================

router.post(
    "/login",
    authRateLimiter,
    validate(loginSchema),
    login
);


// ========================================
// ADMIN LOGIN
// ========================================

router.post(
    "/admin/login",
    authRateLimiter,
    validate(adminLoginSchema),
    adminLogin
);


// ========================================
// REFRESH TOKEN
// ========================================

router.post(
    "/refresh-token",
    refreshToken
);


// ========================================
// LOGOUT
// ========================================

router.post(
    "/logout",
    logout
);


// ========================================
// LOGOUT ALL
// ========================================

router.post(
    "/logout-all",
    authMiddleware,
    logoutAll
);


// ========================================
// FORGOT PASSWORD
// ========================================

router.post(
    "/forgot-password",
    authRateLimiter,
    validate(forgotPasswordSchema),
    forgotPasswordController
);


// ========================================
// RESET PASSWORD
// ========================================

router.post(
    "/reset-password",
    authRateLimiter,
    validate(resetPasswordSchema),
    resetPasswordController
);


// ========================================
// CHANGE PASSWORD
// ========================================

router.post(
    "/change-password",
    authMiddleware,
    validate(changePasswordSchema),
    changePasswordController
);


router.patch(
    "/profile-image",
    authMiddleware,
    upload.single(
        "profileImage"
    ),
    updateProfileImageController
);


export default router;
