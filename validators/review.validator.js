import {
    body,
    param
} from "express-validator";


// ========================================
// CREATE REVIEW
// ========================================

const createReviewSchema = [

    body("foodId")
    .isMongoId()
    .withMessage(
        "Valid food ID is required"
    ),

    body("orderId")
    .isMongoId()
    .withMessage(
        "Valid order ID is required"
    ),

    body("rating")
    .isInt({
        min: 1,
        max: 5
    })
    .withMessage(
        "Rating must be between 1 and 5"
    ),

    body("comment")
    .optional()
    .trim()
    .isLength({
        max: 1000
    })
    .withMessage(
        "Review comment cannot exceed 1000 characters"
    )

];


// ========================================
// UPDATE OWN REVIEW
// ========================================

const updateReviewSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid review ID is required"
    ),

    body("rating")
    .optional()
    .isInt({
        min: 1,
        max: 5
    })
    .withMessage(
        "Rating must be between 1 and 5"
    ),

    body("comment")
    .optional()
    .trim()
    .isLength({
        max: 1000
    })
    .withMessage(
        "Review comment cannot exceed 1000 characters"
    )

];


// ========================================
// DELETE OWN REVIEW
// ========================================

const deleteReviewSchema = [

    param("id")
    .isMongoId()
    .withMessage(
        "Valid review ID is required"
    )

];


// ========================================
// GET FOOD REVIEWS
// ========================================

const getFoodReviewsSchema = [

    param("foodId")
    .isMongoId()
    .withMessage(
        "Valid food ID is required"
    )

];


export {
    createReviewSchema,
    updateReviewSchema,
    deleteReviewSchema,
    getFoodReviewsSchema
};