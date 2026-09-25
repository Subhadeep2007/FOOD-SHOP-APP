import {
    registerUser,
    registerAdmin,
    verifyEmail as verifyEmailService,
    resendVerificationOTP as resendVerificationOTPService,
    loginUser,
    loginAdmin,
    refreshAccessToken,
    logoutUser,
    logoutAllSessions,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    changePassword,
    updateProfileImage,
    updateShopLocation,
    getShopLocation
} from "../../services/auth/auth.service.js";


// ========================================
// COOKIE OPTIONS
// ========================================

const refreshCookieOptions = {

    httpOnly: true,

    secure: process.env.NODE_ENV ===
        "production",

    sameSite: "strict",

    maxAge: 7 *
        24 *
        60 *
        60 *
        1000
};


// ========================================
// USER REGISTER
// ========================================

const register = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await registerUser(
                req.body
            );


        return res.status(201).json({

            success: true,

            message: "Verification OTP sent to your email.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN REGISTER
// ========================================

const adminRegister = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await registerAdmin(
                req.body
            );


        return res.status(201).json({

            success: true,

            message: "Admin verification OTP sent to your email.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await verifyEmailService(
                req.body
            );


        return res.status(200).json({

            success: true,

            message: "Email verified successfully.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// RESEND VERIFICATION
// ========================================

const resendVerificationOTP = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await resendVerificationOTPService(
                req.body.email
            );


        return res.status(200).json({

            success: true,

            message: "Verification OTP sent successfully.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// USER LOGIN
// ========================================

const login = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await loginUser(
                req.body
            );


        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshCookieOptions
        );


        return res.status(200).json({

            success: true,

            message: "Login successful.",

            data: {

                user: result.user,

                accessToken: result.accessToken

            }

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN LOGIN
// ========================================

const adminLogin = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await loginAdmin(
                req.body
            );


        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshCookieOptions
        );


        return res.status(200).json({

            success: true,

            message: "Admin login successful.",

            data: {

                user: result.user,

                accessToken: result.accessToken

            }

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// REFRESH TOKEN
// ========================================

const refreshToken = async(
    req,
    res,
    next
) => {

    try {

        const token =
            req.cookies.refreshToken;


        const result =
            await refreshAccessToken(
                token
            );


        return res.status(200).json({

            success: true,

            message: "Access token refreshed successfully.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// LOGOUT
// ========================================

const logout = async(
    req,
    res,
    next
) => {

    try {

        const refreshToken =
            req.cookies.refreshToken;


        await logoutUser(
            refreshToken
        );


        res.clearCookie(
            "refreshToken",
            refreshCookieOptions
        );


        return res.status(200).json({

            success: true,

            message: "Logout successful."

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// LOGOUT ALL SESSIONS
// ========================================

const logoutAll = async(
    req,
    res,
    next
) => {

    try {

        await logoutAllSessions(
            req.user.userId
        );


        res.clearCookie(
            "refreshToken",
            refreshCookieOptions
        );


        return res.status(200).json({

            success: true,

            message: "All sessions logged out successfully."

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPasswordController = async(
    req,
    res,
    next
) => {

    try {

        await forgotPassword(
            req.body.email
        );


        return res.status(200).json({

            success: true,

            message: "Password reset OTP sent successfully."

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// RESET PASSWORD
// ========================================

const verifyPasswordResetOTPController = async(req, res, next) => {
    try {
        await verifyPasswordResetOTP(req.body);
        return res.status(200).json({ success: true, message: "OTP verified successfully." });
    } catch (error) {
        next(error);
    }
};

const resetPasswordController = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await resetPassword(
                req.body
            );


        return res.status(200).json({

            success: true,

            message: "Password reset successfully.",

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePasswordController = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await changePassword({

                userId: req.user.userId,

                currentPassword: req.body.currentPassword,

                newPassword: req.body.newPassword

            });


        return res.status(200).json({

            success: true,

            message: result.message

        });

    } catch (error) {

        next(error);
    }
};


const updateProfileImageController = async(
    req,
    res,
    next
) => {

    try {

        const user =
            await updateProfileImage(
                req.user.userId,
                req.file
            );

        return res.status(200).json({

            success: true,

            message: "Profile image updated successfully.",

            data: {
                user
            }
        });

    } catch (error) {

        next(error);
    }
};

const updateShopLocationController = async(req, res, next) => {
    try {
        const shopLocation = await updateShopLocation(req.user.userId, req.body);
        return res.status(200).json({ success: true, data: { shopLocation } });
    } catch (error) {
        next(error);
    }
};

const getShopLocationController = async(req, res, next) => {
    try {
        const shopLocation = await getShopLocation();
        return res.status(200).json({ success: true, data: { shopLocation } });
    } catch (error) {
        next(error);
    }
};


export {

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
    verifyPasswordResetOTPController,

    resetPasswordController,

    changePasswordController,

    updateProfileImageController,
    updateShopLocationController,
    getShopLocationController

};
