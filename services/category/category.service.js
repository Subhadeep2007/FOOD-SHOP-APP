import Category
from "../../models/category.model.js";


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
// GET CATEGORY BY ID
// ========================================

const getCategoryById = async(
    categoryId
) => {

    return Category.findOne({

        _id: categoryId,

        isActive: true

    });

};


// ========================================
// EXPORTS
// ========================================

export {

    getCategories,

    getCategoryById

};