import {
    getCategories,
    getCategoryById
} from "../../services/category/category.service.js";


// ========================================
// GET ALL
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const categories =
            await getCategories();


        return res.status(200).json({

            success: true,

            data: categories

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET ONE
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await getCategoryById(
                req.params.id
            );


        if (!category) {

            return res.status(404).json({

                success: false,

                message: "Category not found"

            });

        }


        return res.status(200).json({

            success: true,

            data: category

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// EXPORTS
// ========================================

export {

    getAll,

    getOne

};