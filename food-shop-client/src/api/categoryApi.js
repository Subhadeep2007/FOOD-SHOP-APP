import { api } from "./axios";

const getCategories = async() => {
    const response = await api.get("/categories");

    return response.data;
};

const getCategoryById = async(
    categoryId
) => {
    const response = await api.get(
        "/categories/" + categoryId
    );

    return response.data;
};

const adminGetCategories = async(
    params
) => {
    const response = await api.get(
        "/admin/categories", {
            params
        }
    );

    return response.data;
};

const adminGetCategoryById = async(
    categoryId
) => {
    const response = await api.get(
        "/admin/categories/" + categoryId
    );

    return response.data;
};

const adminCreateCategory = async(
    formData
) => {
    const response = await api.post(
        "/admin/categories",
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

const adminUpdateCategory = async(
    categoryId,
    formData
) => {
    const response = await api.patch(
        "/admin/categories/" + categoryId,
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

const adminDeleteCategory = async(
    categoryId
) => {
    const response = await api.delete(
        "/admin/categories/" + categoryId
    );

    return response.data;
};

export {
    getCategories,
    getCategoryById,
    adminGetCategories,
    adminGetCategoryById,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory
};