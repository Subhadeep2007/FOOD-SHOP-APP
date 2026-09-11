import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../../services/category/category.service.js";


// ========================================
// CREATE
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await createCategory(
                req.body
            );

        return res.status(201).json({

            success: true,

            message: "Category created successfully",

            data: category

        });

    } catch (error) {

        next(error);
    }
};


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
// UPDATE
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await updateCategory(
                req.params.id,
                req.body
            );

        return res.status(200).json({

            success: true,

            message: "Category updated successfully",

            data: category

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        await deleteCategory(
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Category deleted successfully"

        });

    } catch (error) {

        next(error);
    }
};


export {
    create,
    getAll,
    getOne,
    update,
    remove
};