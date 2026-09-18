import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/user.model.js";
import PendingRegistration from "../../models/pendingRegistration.model.js";
import cloudinary from "../../config/cloudinary.js";

import generateOTP from "../../utils/generateOTP.js";
import sendEmail from "../../utils/sendEmail.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../../utils/generateToken.js";


// ========================================
// ERROR HELPER
// ========================================

const createError = (
    message,
    statusCode = 400
) => {

    const error = new Error(message);

    error.statusCode = statusCode;

    return error;
};


// ========================================
// NORMALIZE EMAIL
// ========================================

const normalizeEmail = (email) => {
    return email
        .trim()
        .toLowerCase();
};


// ========================================
// SAFE USER RESPONSE
// ========================================

const getSafeUser = (user) => {

    return {
        userId: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        profileImage: user.profileImage,

        isEmailVerified: user.isEmailVerified,

        isActive: user.isActive
    };
};


// ========================================
// ADMIN SECRET CHECK
// ========================================

const isValidAdminSecret = (
    providedSecret
) => {

    const expectedSecret =
        process.env.ADMIN_SECRET_KEY;

    if (!providedSecret ||
        !expectedSecret
    ) {
        return false;
    }

    return providedSecret === expectedSecret;
};


// ========================================
// EMAIL - VERIFICATION OTP
// ========================================

const sendVerificationOTP = async(
    email,
    otp,
    role = "user"
) => {

    const title =
        role === "admin" ?
        "Food Shop Admin Verification" :
        "Food Shop Email Verification";

    await sendEmail({

        to: email,

        subject: title,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 35px;
                background: #111827;
                color: white;
                border-radius: 16px;
            ">

                <h2 style="
                    color: #f59e0b;
                    margin-bottom: 20px;
                ">
                    Food Shop
                </h2>

                <p>
                    Your email verification OTP is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    text-align: center;
                    padding: 18px;
                    margin: 25px 0;
                    background: #1f2937;
                    border-radius: 12px;
                ">
                    ${otp}
                </div>

                <p style="
                    color: #d1d5db;
                ">
                    This OTP is valid for 10 minutes.
                </p>

                <p style="
                    color: #9ca3af;
                    font-size: 13px;
                    margin-top: 30px;
                ">
                    If you did not start this registration,
                    you can safely ignore this email.
                </p>

            </div>
        `
    });
};


// ========================================
// EMAIL - PASSWORD RESET
// ========================================

const sendPasswordResetOTP = async(
    email,
    otp
) => {

    await sendEmail({

        to: email,

        subject: "Food Shop Password Reset OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 35px;
                background: #111827;
                color: white;
                border-radius: 16px;
            ">

                <h2 style="
                    color: #f59e0b;
                ">
                    Food Shop
                </h2>

                <p>
                    Use the OTP below to reset your password:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    text-align: center;
                    padding: 18px;
                    margin: 25px 0;
                    background: #1f2937;
                    border-radius: 12px;
                ">
                    ${otp}
                </div>

                <p style="
                    color: #d1d5db;
                ">
                    This OTP is valid for 10 minutes.
                </p>

            </div>
        `
    });
};


// ========================================
// CREATE PENDING REGISTRATION
// ========================================

const createPendingRegistration = async({
    name,
    email,
    password,
    role
}) => {

    const normalizedEmail =
        normalizeEmail(email);

    // ----------------------------------------
    // Check actual user
    // ----------------------------------------

    const existingUser =
        await User.findOne({
            email: normalizedEmail
        });

    if (existingUser) {

        throw createError(
            "User already exists with this email",
            409
        );
    }


    // ----------------------------------------
    // Check pending registration
    // ----------------------------------------

    const existingPending =
        await PendingRegistration.findOne({
            email: normalizedEmail
        });

    if (existingPending) {

        await PendingRegistration.deleteOne({
            _id: existingPending._id
        });
    }


    // ----------------------------------------
    // Hash password
    // ----------------------------------------

    const hashedPassword =
        await bcrypt.hash(
            password,
            12
        );


    // ----------------------------------------
    // Generate OTP
    // ----------------------------------------

    const otp =
        generateOTP();

    const otpExpire =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    // ----------------------------------------
    // Save pending registration
    // ----------------------------------------

    await PendingRegistration.create({

        name,

        email: normalizedEmail,

        password: hashedPassword,

        role,

        verificationOTP: otp,

        verificationOTPExpire: otpExpire

    });


    // ----------------------------------------
    // Send OTP
    // ----------------------------------------

    try {

        await sendVerificationOTP(
            normalizedEmail,
            otp,
            role
        );

    } catch (error) {

        await PendingRegistration.deleteOne({
            email: normalizedEmail
        });

        throw createError(
            "Unable to send verification email. Please try again.",
            500
        );
    }


    return {

        message: "Verification OTP sent successfully.",

        email: normalizedEmail,

        requiresEmailVerification: true

    };
};


// ========================================
// USER REGISTER
// ========================================

const registerUser = async({
    name,
    email,
    password
}) => {

    return createPendingRegistration({

        name,

        email,

        password,

        role: "user"

    });
};


// ========================================
// ADMIN REGISTER
// ========================================

const registerAdmin = async({
    name,
    email,
    password,
    adminSecretKey
}) => {

    // ----------------------------------------
    // Admin secret
    // ----------------------------------------

    if (!process.env.ADMIN_SECRET_KEY) {

        throw createError(
            "Admin secret key is not configured on server",
            500
        );
    }


    if (!isValidAdminSecret(
            adminSecretKey
        )) {

        throw createError(
            "Invalid admin secret key",
            401
        );
    }


    // ----------------------------------------
    // Only one admin
    // ----------------------------------------

    const existingAdmin =
        await User.findOne({
            role: "admin"
        });

    if (existingAdmin) {

        throw createError(
            "Admin account already exists",
            409
        );
    }


    return createPendingRegistration({

        name,

        email,

        password,

        role: "admin"

    });
};


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async({
    email,
    otp
}) => {

    const normalizedEmail =
        normalizeEmail(email);


    const pending =
        await PendingRegistration.findOne({
            email: normalizedEmail
        });


    if (!pending) {

        throw createError(
            "Registration request not found. Please register again.",
            404
        );
    }


    // ----------------------------------------
    // OTP expiration
    // ----------------------------------------

    if (!pending.verificationOTPExpire ||
        pending.verificationOTPExpire <
        new Date()
    ) {

        await PendingRegistration.deleteOne({
            _id: pending._id
        });

        throw createError(
            "OTP has expired. Please register again.",
            400
        );
    }


    // ----------------------------------------
    // OTP validation
    // ----------------------------------------

    if (
        pending.verificationOTP !==
        otp
    ) {

        throw createError(
            "Invalid OTP",
            400
        );
    }


    // ----------------------------------------
    // Race-condition protection
    // ----------------------------------------

    const existingUser =
        await User.findOne({
            email: normalizedEmail
        });

    if (existingUser) {

        await PendingRegistration.deleteOne({
            _id: pending._id
        });

        throw createError(
            "User already exists with this email",
            409
        );
    }


    // ----------------------------------------
    // Create actual user
    // ----------------------------------------

    const user =
        await User.create({

            name: pending.name,

            email: pending.email,

            password: pending.password,

            role: pending.role,

            isEmailVerified: true,

            isActive: true

        });


    // ----------------------------------------
    // Delete pending registration
    // ----------------------------------------

    await PendingRegistration.deleteOne({
        _id: pending._id
    });


    return {

        message: "Email verified successfully.",

        user: getSafeUser(user)

    };
};


// ========================================
// RESEND VERIFICATION OTP
// ========================================

const resendVerificationOTP = async(
    email
) => {

    const normalizedEmail =
        normalizeEmail(email);


    const pending =
        await PendingRegistration.findOne({
            email: normalizedEmail
        });


    if (!pending) {

        throw createError(
            "No pending registration found",
            404
        );
    }


    const otp =
        generateOTP();

    const otpExpire =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    pending.verificationOTP =
        otp;

    pending.verificationOTPExpire =
        otpExpire;


    await pending.save();


    await sendVerificationOTP(
        normalizedEmail,
        otp,
        pending.role
    );


    return {

        message: "Verification OTP sent successfully.",

        email: normalizedEmail

    };
};


// ========================================
// USER LOGIN
// ========================================

const loginUser = async({
    email,
    password
}) => {

    const normalizedEmail =
        normalizeEmail(email);


    const user =
        await User.findOne({
            email: normalizedEmail,
            role: "user"
        });


    if (!user) {

        throw createError(
            "Invalid email or password",
            401
        );
    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );
    }


    const passwordValid =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!passwordValid) {

        throw createError(
            "Invalid email or password",
            401
        );
    }


    // ----------------------------------------
    // Access token
    // ----------------------------------------

    const accessToken =
        generateAccessToken(user);


    // ----------------------------------------
    // Refresh token
    // ----------------------------------------

    const refreshToken =
        generateRefreshToken(user);


    user.refreshToken =
        refreshToken;


    await user.save();


    return {

        message: "Login successful.",

        user: getSafeUser(user),

        accessToken,

        refreshToken

    };
};


// ========================================
// ADMIN LOGIN
// ========================================

const loginAdmin = async({
    email,
    password,
    adminSecretKey
}) => {

    if (!process.env.ADMIN_SECRET_KEY) {

        throw createError(
            "Admin secret key is not configured on server",
            500
        );
    }


    if (!isValidAdminSecret(
            adminSecretKey
        )) {

        throw createError(
            "Invalid admin secret key",
            401
        );
    }


    const normalizedEmail =
        normalizeEmail(email);


    const admin =
        await User.findOne({
            email: normalizedEmail,
            role: "admin"
        });


    if (!admin) {

        throw createError(
            "Invalid admin credentials",
            401
        );
    }


    if (!admin.isActive) {

        throw createError(
            "Admin account is deactivated",
            403
        );
    }


    const passwordValid =
        await bcrypt.compare(
            password,
            admin.password
        );


    if (!passwordValid) {

        throw createError(
            "Invalid admin credentials",
            401
        );
    }


    const accessToken =
        generateAccessToken(admin);


    const refreshToken =
        generateRefreshToken(admin);


    admin.refreshToken =
        refreshToken;


    await admin.save();


    return {

        message: "Admin login successful.",

        user: getSafeUser(admin),

        accessToken,

        refreshToken

    };
};


// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refreshAccessToken = async(
    refreshToken
) => {

    if (!refreshToken) {

        throw createError(
            "Refresh token missing",
            401
        );
    }


    let decoded;


    try {

        decoded =
            jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );

    } catch {

        throw createError(
            "Invalid or expired refresh token",
            401
        );
    }


    const user =
        await User.findById(
            decoded.userId
        );


    if (!user) {

        throw createError(
            "User not found",
            401
        );
    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );
    }


    if (!user.refreshToken) {

        throw createError(
            "Refresh session not found",
            401
        );
    }


    if (
        user.refreshToken !==
        refreshToken
    ) {

        throw createError(
            "Invalid refresh token",
            401
        );
    }


    const accessToken =
        generateAccessToken(user);


    return {

        accessToken,

        user: getSafeUser(user)

    };
};


// ========================================
// LOGOUT
// ========================================

const logoutUser = async(
    refreshToken
) => {

    if (!refreshToken) {

        return;
    }


    try {

        const decoded =
            jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );


        await User.findByIdAndUpdate(
            decoded.userId, {
                $set: {
                    refreshToken: null
                }
            }
        );

    } catch {
        // Logout should remain successful
        // even if refresh token is expired.
    }
};


// ========================================
// LOGOUT ALL
// ========================================

const logoutAllSessions = async(
    userId
) => {

    await User.findByIdAndUpdate(
        userId, {
            $set: {
                refreshToken: null
            }
        }
    );

    return {

        message: "All sessions logged out successfully."

    };
};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async(
    email
) => {

    const normalizedEmail =
        normalizeEmail(email);


    const user =
        await User.findOne({
            email: normalizedEmail
        });


    if (!user) {

        throw createError(
            "No account found with this email",
            404
        );
    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );
    }


    const otp =
        generateOTP();


    user.resetPasswordOTP =
        otp;

    user.resetPasswordOTPExpire =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    await user.save();


    await sendPasswordResetOTP(
        normalizedEmail,
        otp
    );
};


// ========================================
// RESET PASSWORD
// ========================================

const resetPassword = async({
    email,
    otp,
    newPassword
}) => {

    const normalizedEmail =
        normalizeEmail(email);


    const user =
        await User.findOne({
            email: normalizedEmail
        });


    if (!user) {

        throw createError(
            "User not found",
            404
        );
    }


    if (!user.resetPasswordOTP) {

        throw createError(
            "No password reset OTP found",
            400
        );
    }


    if (!user.resetPasswordOTPExpire ||
        user.resetPasswordOTPExpire <
        new Date()
    ) {

        throw createError(
            "OTP has expired. Please request a new one.",
            400
        );
    }


    if (
        user.resetPasswordOTP !==
        otp
    ) {

        throw createError(
            "Invalid OTP",
            400
        );
    }


    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            12
        );


    user.password =
        hashedPassword;


    user.resetPasswordOTP =
        null;


    user.resetPasswordOTPExpire =
        null;


    // Invalidate current login
    user.refreshToken =
        null;


    await user.save();


    return {

        message: "Password reset successfully. Please login again."

    };
};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async({
    userId,
    currentPassword,
    newPassword
}) => {

    const user =
        await User.findById(userId);


    if (!user) {

        throw createError(
            "User not found",
            404
        );
    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );
    }


    const valid =
        await bcrypt.compare(
            currentPassword,
            user.password
        );


    if (!valid) {

        throw createError(
            "Current password is incorrect",
            401
        );
    }


    if (
        currentPassword ===
        newPassword
    ) {

        throw createError(
            "New password must be different from current password",
            400
        );
    }


    user.password =
        await bcrypt.hash(
            newPassword,
            12
        );


    // Invalidate old refresh session
    user.refreshToken =
        null;


    await user.save();


    return {

        message: "Password changed successfully. Please login again."

    };
};


const updateProfileImage = async(
    userId,
    file
) => {

    if (!file) {
        throw createError(
            "Profile image is required",
            400
        );
    }

    if (!file.mimetype ||
        !file.mimetype.startsWith(
            "image/"
        )
    ) {
        throw createError(
            "Only image files are allowed",
            400
        );
    }

    const user =
        await User.findById(
            userId
        );

    if (!user) {
        throw createError(
            "User not found",
            404
        );
    }

    const imageData =
        "data:" +
        file.mimetype +
        ";base64," +
        file.buffer.toString(
            "base64"
        );

    const result =
        await cloudinary.uploader.upload(
            imageData,
            {
                folder: "food-shop/profiles",
                resource_type: "image"
            }
        );

    user.profileImage =
        result.secure_url;

    await user.save();

    return getSafeUser(
        user
    );
};


const updateShopLocation = async(userId, location) => {
    const user = await User.findOne({ _id: userId, role: "admin" });
    if (!user) throw createError("Admin account not found", 404);
    user.shopLocation = {
        name: location.name,
        address: location.address,
        phone: location.phone,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
    };
    await user.save();
    return user.shopLocation;
};

const getShopLocation = async() => {
    const admin = await User.findOne({
        role: "admin",
        "shopLocation.latitude": { $type: "number" },
        "shopLocation.longitude": { $type: "number" }
    }).select("name email profileImage shopLocation").sort({ updatedAt: -1 });
    if (!admin) return null;
    return {
        ...admin.shopLocation.toObject(),
        ownerName: admin.name,
        ownerEmail: admin.email,
        image: admin.profileImage
    };
};

export {
    registerUser,
    registerAdmin,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    loginAdmin,
    refreshAccessToken,
    logoutUser,
    logoutAllSessions,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfileImage,
    updateShopLocation,
    getShopLocation
};
