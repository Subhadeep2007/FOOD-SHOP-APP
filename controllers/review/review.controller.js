import {
    createReview,
    getFoodReviews,
    updateOwnReview,
    deleteOwnReview,
    getAllReviewsForAdmin
} from "../../services/review/review.service.js";


// ========================================
// CREATE
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const review =
            await createReview({

                userId: req.user.userId,

                foodId: req.body.foodId,

                orderId: req.body.orderId,

                rating: req.body.rating,

                comment: req.body.comment

            });


        return res.status(201).json({

            success: true,

            message: "Review submitted successfully",

            data: review

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// FOOD REVIEWS
// PUBLIC
// ========================================

const getFood = async(
    req,
    res,
    next
) => {

    try {

        const reviews =
            await getFoodReviews(
                req.params.foodId
            );


        return res.status(200).json({

            success: true,

            data: reviews

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE OWN REVIEW
// USER
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const review =
            await updateOwnReview(

                req.user.userId,

                req.params.id,

                req.body.rating,

                req.body.comment

            );


        return res.status(200).json({

            success: true,

            message: "Review updated successfully",

            data: review

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE OWN REVIEW
// USER
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        await deleteOwnReview(

            req.user.userId,

            req.params.id

        );


        return res.status(200).json({

            success: true,

            message: "Review deleted successfully"

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN GET ALL REVIEWS
// ========================================

const getAllAdmin = async(
    req,
    res,
    next
) => {

    try {

        const reviews =
            await getAllReviewsForAdmin();


        return res.status(200).json({

            success: true,

            data: reviews

        });

    } catch (error) {

        next(error);
    }
};


export {
    create,
    getFood,
    update,
    remove,
    getAllAdmin
};