import { body, param } from "express-validator";

const addToCartSchema = [

    body("foodId")
    .isMongoId()
    .withMessage(
        "Valid food ID is required"
    ),

    body("quantity")
    .isInt({
        min: 1,
        max: 20
    })
    .withMessage(
        "Quantity must be between 1 and 20"
    )
];


const updateCartSchema = [

    param("foodId")
    .isMongoId()
    .withMessage(
        "Valid food ID is required"
    ),

    body("quantity")
    .isInt({
        min: 1,
        max: 20
    })
    .withMessage(
        "Quantity must be between 1 and 20"
    )
];


export {
    addToCartSchema,
    updateCartSchema
};