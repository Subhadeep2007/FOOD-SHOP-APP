import Category
from "../../models/category.model.js";

import cloudinary
from "../../config/cloudinary.js";


// ========================================
// CREATE SLUG
// ========================================

const createSlug = (
    name
) => {

    return name
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /(^-|-$)/g,
            ""
        );

};


// ========================================
// UPLOAD IMAGE
// ========================================

const uploadImage = async(
    file
) => {

    const base64Image =
        file.buffer.toString(
            "base64"
        );


    const dataUri =
        `data:${file.mimetype};base64,${base64Image}`;


    const result =
        await cloudinary.uploader.upload(

            dataUri,

            {

                folder: "food-shop/categories"

            }

        );


    return result.secure_url;

};


// ========================================
// GET ALL CATEGORIES
// ADMIN
// ========================================

const getAllCategories = async({
    search,
    isActive
}) => {

    const query = {};


    if (search) {

        query.name = {

            $regex: search,

            $options: "i"

        };

    }


    if (
        isActive !== undefined
    ) {

        query.isActive =
            isActive === "true";

    }


    return Category.find(query)

    .sort({

        sortOrder: 1,

        name: 1

    });

};


// ========================================
// GET CATEGORY
// ADMIN
// ========================================

const getCategoryById = async(
    categoryId
) => {

    const category =
        await Category.findById(
            categoryId
        );


    if (!category) {

        const error =
            new Error(
                "Category not found"
            );

        error.statusCode = 404;

        throw error;

    }


    return category;

};


// ========================================
// CREATE CATEGORY
// ========================================

const createCategory = async(
    data,
    file
) => {

    const slug =
        createSlug(
            data.name
        );


    const existingCategory =
        await Category.findOne({

            $or: [

                {
                    name: data.name
                },

                {
                    slug: slug
                }

            ]

        });


    if (existingCategory) {

        const error =
            new Error(
                "Category already exists"
            );

        error.statusCode = 409;

        throw error;

    }


    let image = "";


    if (file) {

        image =
            await uploadImage(
                file
            );

    }


    const category =
        await Category.create({

            name: data.name,

            slug,

            description: data.description || "",

            image,

            sortOrder: data.sortOrder || 0

        });


    return category;

};


// ========================================
// UPDATE CATEGORY
// ========================================

const updateCategory = async(
    categoryId,
    data,
    file
) => {

    const category =
        await Category.findById(
            categoryId
        );


    if (!category) {

        const error =
            new Error(
                "Category not found"
            );

        error.statusCode = 404;

        throw error;

    }


    // ========================================
    // UPDATE FIELDS
    // ========================================

    if (
        data.name !== undefined
    ) {

        category.name =
            data.name;

        category.slug =
            createSlug(
                data.name
            );

    }


    if (
        data.description !== undefined
    ) {

        category.description =
            data.description;

    }


    if (
        data.sortOrder !== undefined
    ) {

        category.sortOrder =
            Number(
                data.sortOrder
            );

    }


    if (
        data.isActive !== undefined
    ) {

        category.isActive =
            data.isActive === true ||
            data.isActive === "true";

    }


    // ========================================
    // UPDATE IMAGE
    // ========================================

    if (file) {

        category.image =
            await uploadImage(
                file
            );

    }


    await category.save();


    return category;

};


// ========================================
// DELETE CATEGORY
// ========================================

const deleteCategory = async(
    categoryId
) => {

    const category =
        await Category.findById(
            categoryId
        );


    if (!category) {

        const error =
            new Error(
                "Category not found"
            );

        error.statusCode = 404;

        throw error;

    }


    // Soft delete

    category.isActive =
        false;


    await category.save();


    return {

        message: "Category deleted successfully"

    };

};


// ========================================
// EXPORTS
// ========================================

export {

    getAllCategories,

    getCategoryById,

    createCategory,

    updateCategory,

    deleteCategory

};