import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/admin/category.service.js";


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
            await getAllCategories({

                search: req.query.search,

                isActive: req.query.isActive

            });


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


        return res.status(200).json({

            success: true,

            data: category

        });

    } catch (error) {

        next(error);

    }

};


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

                req.body,

                req.file

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

                req.body,

                req.file

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

        const result =
            await deleteCategory(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            message: result.message

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

    getOne,

    create,

    update,

    remove

};