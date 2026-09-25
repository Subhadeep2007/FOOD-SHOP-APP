import { api } from "./axios";

const getFoodReviews = async(
    foodId
) => {
    const response = await api.get(
        "/reviews/food/" + foodId
    );

    return response.data;
};

const createReview = async(
    data
) => {
    const response = await api.post(
        "/reviews",
        data
    );

    return response.data;
};

const updateOwnReview = async(
    reviewId,
    data
) => {
    const response = await api.patch(
        "/reviews/" + reviewId,
        data
    );

    return response.data;
};

const deleteOwnReview = async(
    reviewId
) => {
    const response = await api.delete(
        "/reviews/" + reviewId
    );

    return response.data;
};

const adminGetAllReviews = async() => {
    const response = await api.get(
        "/reviews/admin/all"
    );

    return response.data;
};

export {
    getFoodReviews,
    createReview,
    updateOwnReview,
    deleteOwnReview,
    adminGetAllReviews
};