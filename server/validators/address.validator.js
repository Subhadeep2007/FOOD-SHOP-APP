import { body } from "express-validator";

const addressSchema = [

    body("label")
    .optional()
    .isIn([
        "home",
        "work",
        "other"
    ])
    .withMessage(
        "Invalid address label"
    ),

    body("fullName")
    .trim()
    .notEmpty()
    .withMessage(
        "Full name is required"
    ),

    body("phone")
    .trim()
    .notEmpty()
    .withMessage(
        "Phone number is required"
    ),

    body("addressLine")
    .trim()
    .notEmpty()
    .withMessage(
        "Address is required"
    ),

    body("landmark")
    .optional()
    .trim(),

    body("city")
    .trim()
    .notEmpty()
    .withMessage(
        "City is required"
    ),

    body("state")
    .trim()
    .notEmpty()
    .withMessage(
        "State is required"
    ),

    body("postalCode")
    .trim()
    .notEmpty()
    .withMessage(
        "Postal code is required"
    ),

    body("country")
    .optional()
    .trim(),

    body("latitude")
    .isFloat({
        min: -90,
        max: 90
    })
    .withMessage(
        "Valid latitude is required"
    ),

    body("longitude")
    .isFloat({
        min: -180,
        max: 180
    })
    .withMessage(
        "Valid longitude is required"
    ),

    body("placeId")
    .optional()
    .isString(),

    body("formattedAddress")
    .optional()
    .isString(),

    body("isDefault")
    .optional()
    .isBoolean()
];


const updateAddressSchema = [

    body("label")
    .optional()
    .isIn([
        "home",
        "work",
        "other"
    ]),

    body("fullName")
    .optional()
    .trim()
    .notEmpty(),

    body("phone")
    .optional()
    .trim()
    .notEmpty(),

    body("addressLine")
    .optional()
    .trim()
    .notEmpty(),

    body("landmark")
    .optional()
    .trim(),

    body("city")
    .optional()
    .trim()
    .notEmpty(),

    body("state")
    .optional()
    .trim()
    .notEmpty(),

    body("postalCode")
    .optional()
    .trim()
    .notEmpty(),

    body("latitude")
    .optional()
    .isFloat({
        min: -90,
        max: 90
    }),

    body("longitude")
    .optional()
    .isFloat({
        min: -180,
        max: 180
    }),

    body("placeId")
    .optional()
    .isString(),

    body("formattedAddress")
    .optional()
    .isString(),

    body("isDefault")
    .optional()
    .isBoolean()
];


export {
    addressSchema,
    updateAddressSchema
};