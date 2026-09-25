import { body } from "express-validator";


// ========================================
// USER REGISTER
// ========================================

const registerSchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Name must be between 2 and 50 characters"
    ),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
        min: 8
    })
    .withMessage(
        "Password must be at least 8 characters"
    )
];


// ========================================
// ADMIN REGISTER
// ========================================

const adminRegisterSchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Name must be between 2 and 50 characters"
    ),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
        min: 8
    })
    .withMessage(
        "Password must be at least 8 characters"
    ),

    body("adminSecretKey")
    .notEmpty()
    .withMessage(
        "Admin secret key is required"
    )
    .isString()
    .withMessage(
        "Admin secret key must be a string"
    )
];


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmailSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({
        min: 6,
        max: 6
    })
    .withMessage(
        "OTP must be 6 digits"
    )
    .isNumeric()
    .withMessage(
        "OTP must contain only numbers"
    )
];


// ========================================
// RESEND VERIFICATION
// ========================================

const resendVerificationSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail()
];


// ========================================
// LOGIN
// ========================================

const loginSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
];


// ========================================
// ADMIN LOGIN
// ========================================

const adminLoginSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required"),

    body("adminSecretKey")
    .notEmpty()
    .withMessage(
        "Admin secret key is required"
    )
];


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPasswordSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail()
];


// ========================================
// RESET PASSWORD
// ========================================

const verifyPasswordResetOTPSchema = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
    body("otp").trim().notEmpty().withMessage("OTP is required").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric().withMessage("OTP must contain only numbers")
];

const resetPasswordSchema = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail(),

    body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({
        min: 6,
        max: 6
    })
    .withMessage(
        "OTP must be 6 digits"
    )
    .isNumeric()
    .withMessage(
        "OTP must contain only numbers"
    ),

    body("newPassword")
    .notEmpty()
    .withMessage(
        "New password is required"
    )
    .isLength({
        min: 8
    })
    .withMessage(
        "Password must be at least 8 characters"
    )
];


// ========================================
// CHANGE PASSWORD
// ========================================

const changePasswordSchema = [

    body("currentPassword")
    .notEmpty()
    .withMessage(
        "Current password is required"
    ),

    body("newPassword")
    .notEmpty()
    .withMessage(
        "New password is required"
    )
    .isLength({
        min: 8
    })
    .withMessage(
        "New password must be at least 8 characters"
    )
];

const shopLocationSchema = [
    body("name").trim().notEmpty().withMessage("Shop name is required").isLength({ max: 100 }),
    body("address").trim().notEmpty().withMessage("Shop address is required").isLength({ max: 300 }),
    body("phone").trim().matches(/^[0-9+()\-\s]{7,20}$/).withMessage("Enter a valid shop contact number"),
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Enter a valid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Enter a valid longitude")
];


export {
    registerSchema,
    adminRegisterSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    loginSchema,
    adminLoginSchema,
    forgotPasswordSchema,
    verifyPasswordResetOTPSchema,
    resetPasswordSchema,
    changePasswordSchema,
    shopLocationSchema
};
