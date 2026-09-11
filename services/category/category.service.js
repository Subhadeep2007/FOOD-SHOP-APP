import Category from "../../models/category.model.js";

const createSlug = (name) => {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};


// ========================================
// CREATE CATEGORY
// ========================================

const createCategory = async({
    name,
    description,
    image,
    sortOrder
}) => {

    const slug =
        createSlug(name);

    const existingCategory =
        await Category.findOne({
            $or: [
                { name },
                { slug }
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

    return Category.create({
        name,
        slug,
        description,
        image,
        sortOrder
    });
};


// ========================================
// GET ALL CATEGORIES
// ========================================

const getCategories = async() => {

    return Category.find({
            isActive: true
        })
        .sort({
            sortOrder: 1,
            name: 1
        });
};


// ========================================
// GET CATEGORY
// ========================================

const getCategoryById = async(
    categoryId
) => {

    return Category.findById(
        categoryId
    );
};


// ========================================
// UPDATE CATEGORY
// ========================================

const updateCategory = async(
    categoryId,
    data
) => {

    const updateData = {
        ...data
    };

    if (data.name) {

        updateData.slug =
            createSlug(data.name);
    }

    const category =
        await Category.findByIdAndUpdate(
            categoryId,
            updateData, {
                new: true,
                runValidators: true
            }
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
// DELETE CATEGORY
// ========================================

const deleteCategory = async(
    categoryId
) => {

    const category =
        await Category.findByIdAndUpdate(
            categoryId, {
                isActive: false
            }, {
                new: true
            }
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


export {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};