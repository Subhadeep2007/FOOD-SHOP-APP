import { body } from "express-validator";

const categorySchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage(
        "Category name is required"
    )
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Category name must be 2-50 characters"
    ),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 300
    })
    .withMessage(
        "Description is too long"
    ),

    body("image")
    .optional()
    .isString()
    .withMessage(
        "Image must be a string"
    ),

    body("sortOrder")
    .optional()
    .isInt({
        min: 0
    })
    .withMessage(
        "Sort order must be a positive integer"
    )
];


const updateCategorySchema = [

    body("name")
    .optional()
    .trim()
    .isLength({
        min: 2,
        max: 50
    }),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 300
    }),

    body("image")
    .optional()
    .isString(),

    body("sortOrder")
    .optional()
    .isInt({
        min: 0
    }),

    body("isActive")
    .optional()
    .isBoolean()
];


export {
    categorySchema,
    updateCategorySchema
};