import { api } from "./axios";

const getFoods = async(params) => {
    const response = await api.get("/foods", {
        params
    });

    return response.data;
};

const getFoodById = async(foodId) => {
    const response = await api.get("/foods/" + foodId);

    return response.data;
};

const adminGetFoods = async(params) => {
    const response = await api.get("/admin/foods", {
        params
    });

    return response.data &&
        response.data.data ?
        response.data.data :
        response.data;
};

const adminGetFoodById = async(foodId) => {
    const response = await api.get("/admin/foods/" + foodId);

    return response.data;
};

const adminCreateFood = async(formData) => {
    const response = await api.post(
        "/admin/foods",
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

const adminUpdateFood = async(
    foodId,
    formData
) => {
    const response = await api.patch(
        "/admin/foods/" + foodId,
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

const adminUpdatePrice = async(
    foodId,
    data
) => {
    const response = await api.patch(
        "/admin/foods/" + foodId + "/price",
        data
    );

    return response.data;
};

const adminUpdateStock = async(
    foodId,
    stock
) => {
    const response = await api.patch(
        "/admin/foods/" + foodId + "/stock", {
            stock
        }
    );

    return response.data;
};

const adminUpdateAvailability = async(
    foodId,
    isAvailable
) => {
    const response = await api.patch(
        "/admin/foods/" + foodId + "/availability", {
            isAvailable
        }
    );

    return response.data;
};

const adminDeleteFood = async(
    foodId
) => {
    const response = await api.delete(
        "/admin/foods/" + foodId
    );

    return response.data;
};

export {
    getFoods,
    getFoodById,
    adminGetFoods,
    adminGetFoodById,
    adminCreateFood,
    adminUpdateFood,
    adminUpdatePrice,
    adminUpdateStock,
    adminUpdateAvailability,
    adminDeleteFood
};