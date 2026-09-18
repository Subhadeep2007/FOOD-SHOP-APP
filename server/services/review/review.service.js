import Review
from "../../models/review.model.js";

import Order
from "../../models/order.model.js";

import Food
from "../../models/food.model.js";


// ========================================
// CREATE REVIEW
// ========================================

const createReview = async({
    userId,
    foodId,
    orderId,
    rating,
    comment
}) => {

    let order;

    if (orderId) {
        order = await Order.findOne({
            _id: orderId,
            user: userId,
            status: "DELIVERED"
        });
    } else {
        const deliveredOrders = await Order.find({
            user: userId,
            status: "DELIVERED",
            "items.food": foodId
        }).sort({ createdAt: -1 });

        const reviewedOrders = await Review.find({
            user: userId,
            food: foodId,
            order: { $in: deliveredOrders.map((item) => item._id) }
        }).distinct("order");

        order = deliveredOrders.find(
            (item) => !reviewedOrders.some(
                (reviewedOrderId) => String(reviewedOrderId) === String(item._id)
            )
        );
    }


    if (!order) {

        const error =
            new Error(
                orderId
                    ? "You can review only this delivered order"
                    : "You have no unreviewed delivered order for this food"
            );

        error.statusCode = 400;

        throw error;
    }


    const orderedItem =
        order.items.find(
            item =>
            item.food.toString() ===
            foodId.toString()
        );


    if (!orderedItem) {

        const error =
            new Error(
                "This food was not part of the order"
            );

        error.statusCode = 400;

        throw error;
    }


    const existingReview =
        await Review.findOne({

            user: userId,

            food: foodId,

            order: order._id

        });


    if (existingReview) {

        const error =
            new Error(
                "You have already reviewed this food"
            );

        error.statusCode = 409;

        throw error;
    }


    const review =
        await Review.create({

            user: userId,

            food: foodId,

            order: order._id,

            rating: Number(rating),

            comment: comment || ""

        });


    // ========================================
    // UPDATE FOOD RATING
    // ========================================

    const reviews =
        await Review.find({

            food: foodId,

            isApproved: true

        });


    const totalRating =
        reviews.reduce(
            (
                total,
                item
            ) =>
            total +
            item.rating,
            0
        );


    const averageRating =
        reviews.length ?
        Number(
            (
                totalRating /
                reviews.length
            ).toFixed(1)
        ) :
        0;


    await Food.findByIdAndUpdate(

        foodId,

        {

            rating: averageRating,

            reviewCount: reviews.length

        }

    );


    return review;
};


// ========================================
// GET FOOD REVIEWS
// ========================================

const getFoodReviews = async(
    foodId
) => {

    return Review.find({

            food: foodId,

            isApproved: true

        })
        .populate(
            "user",
            "name profileImage"
        )
        .sort({

            createdAt: -1

        });
};


// ========================================
// UPDATE OWN REVIEW
// ========================================

const updateOwnReview = async(
    userId,
    reviewId,
    rating,
    comment
) => {

    const review =
        await Review.findOne({

            _id: reviewId,

            user: userId

        });


    if (!review) {

        const error =
            new Error(
                "Review not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // ========================================
    // UPDATE RATING
    // ========================================

    if (rating !== undefined) {

        review.rating =
            Number(rating);

    }


    // ========================================
    // UPDATE COMMENT
    // ========================================

    if (comment !== undefined) {

        review.comment =
            comment.trim();

    }


    await review.save();


    // ========================================
    // UPDATE FOOD RATING
    // ========================================

    const foodId =
        review.food;


    const reviews =
        await Review.find({

            food: foodId,

            isApproved: true

        });


    const totalRating =
        reviews.reduce(
            (
                total,
                item
            ) =>
            total +
            item.rating,
            0
        );


    const averageRating =
        reviews.length ?
        Number(
            (
                totalRating /
                reviews.length
            ).toFixed(1)
        ) :
        0;


    await Food.findByIdAndUpdate(

        foodId,

        {

            rating: averageRating,

            reviewCount: reviews.length

        }

    );


    return review;
};


// ========================================
// DELETE OWN REVIEW
// ========================================

const deleteOwnReview = async(
    userId,
    reviewId
) => {

    const review =
        await Review.findOne({

            _id: reviewId,

            user: userId

        });


    if (!review) {

        const error =
            new Error(
                "Review not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const foodId =
        review.food;


    await review.deleteOne();


    const reviews =
        await Review.find({

            food: foodId,

            isApproved: true

        });


    const totalRating =
        reviews.reduce(
            (
                total,
                item
            ) =>
            total +
            item.rating,
            0
        );


    const averageRating =
        reviews.length ?
        Number(
            (
                totalRating /
                reviews.length
            ).toFixed(1)
        ) :
        0;


    await Food.findByIdAndUpdate(

        foodId,

        {

            rating: averageRating,

            reviewCount: reviews.length

        }

    );


    return true;
};


// ========================================
// ADMIN GET ALL REVIEWS
// ========================================

const getAllReviewsForAdmin = async() => {

    return Review.find({})
        .populate(
            "user",
            "name email profileImage isEmailVerified role isActive createdAt updatedAt"
        )
        .populate({
            path: "food",
            select: "name slug description images price discountPercentage category foodType ingredients preparationTime stock isAvailable isActive rating reviewCount createdAt updatedAt",
            populate: {
                path: "category",
                select: "name slug description image isActive sortOrder createdAt updatedAt"
            }
        })
        .sort({

            createdAt: -1

        });
};


// ========================================
// EXPORTS
// ========================================

export {

    createReview,

    getFoodReviews,

    updateOwnReview,

    deleteOwnReview,

    getAllReviewsForAdmin

};
