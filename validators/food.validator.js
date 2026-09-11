import { body } from "express-validator";

const foodSchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage(
        "Food name is required"
    )
    .isLength({
        min: 2,
        max: 100
    }),

    body("description")
    .trim()
    .notEmpty()
    .withMessage(
        "Food description is required"
    )
    .isLength({
        max: 1000
    }),

    body("price")
    .isFloat({
        min: 0
    })
    .withMessage(
        "Price must be a valid positive number"
    ),

    body("category")
    .isMongoId()
    .withMessage(
        "Valid category ID is required"
    ),

    body("foodType")
    .isIn([
        "veg",
        "non-veg",
        "egg"
    ])
    .withMessage(
        "Invalid food type"
    ),

    body("discountPercentage")
    .optional()
    .isFloat({
        min: 0,
        max: 100
    }),

    body("preparationTime")
    .optional()
    .isInt({
        min: 1
    }),

    body("stock")
    .optional()
    .isInt({
        min: 0
    }),

    body("images")
    .optional()
    .isArray()
    .withMessage(
        "Images must be an array"
    ),

    body("ingredients")
    .optional()
    .isArray()
    .withMessage(
        "Ingredients must be an array"
    )
];


const updateFoodSchema = [

    body("name")
    .optional()
    .trim()
    .isLength({
        min: 2,
        max: 100
    }),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 1000
    }),

    body("price")
    .optional()
    .isFloat({
        min: 0
    }),

    body("category")
    .optional()
    .isMongoId(),

    body("foodType")
    .optional()
    .isIn([
        "veg",
        "non-veg",
        "egg"
    ]),

    body("discountPercentage")
    .optional()
    .isFloat({
        min: 0,
        max: 100
    }),

    body("preparationTime")
    .optional()
    .isInt({
        min: 1
    }),

    body("stock")
    .optional()
    .isInt({
        min: 0
    }),

    body("isAvailable")
    .optional()
    .isBoolean(),

    body("isActive")
    .optional()
    .isBoolean(),

    body("images")
    .optional()
    .isArray(),

    body("ingredients")
    .optional()
    .isArray()
];


export {
    foodSchema,
    updateFoodSchema
};