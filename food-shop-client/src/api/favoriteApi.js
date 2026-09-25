import { api } from "./axios";

const getFavorites = async() => {
    const response = await api.get(
        "/favorites"
    );

    return response.data;
};

const addFavorite = async(
    foodId
) => {
    const response = await api.post(
        "/favorites", {
            foodId
        }
    );

    return response.data;
};

const removeFavorite = async(
    foodId
) => {
    const response = await api.delete(
        "/favorites/" + foodId
    );

    return response.data;
};

export {
    getFavorites,
    addFavorite,
    removeFavorite
};