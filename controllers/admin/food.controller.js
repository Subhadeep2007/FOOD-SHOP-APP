import {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    updateFoodPrice,
    updateFoodStock,
    updateFoodAvailability,
    deleteFood
} from "../../services/admin/food.service.js";


// ========================================
// GET ALL FOODS
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllFoods({

                page: req.query.page || 1,

                limit: req.query.limit || 20,

                search: req.query.search,

                category: req.query.category,

                foodType: req.query.foodType,

                isAvailable: req.query.isAvailable,

                isActive: req.query.isActive

            });


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// GET SINGLE FOOD
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await getFoodById(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// CREATE FOOD
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await createFood(

                req.body,

                req.files || []

            );


        return res.status(201).json({

            success: true,

            message: "Food created successfully",

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE FOOD
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await updateFood(

                req.params.id,

                req.body,

                req.files || []

            );


        return res.status(200).json({

            success: true,

            message: "Food updated successfully",

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE PRICE
// ========================================

const updatePrice = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await updateFoodPrice(

                req.params.id,

                req.body.price,

                req.body.discountPercentage

            );


        return res.status(200).json({

            success: true,

            message: "Food price updated successfully",

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE STOCK
// ========================================

const updateStock = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await updateFoodStock(

                req.params.id,

                req.body.stock

            );


        return res.status(200).json({

            success: true,

            message: "Food stock updated successfully",

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE AVAILABILITY
// ========================================

const updateAvailability = async(
    req,
    res,
    next
) => {

    try {

        const food =
            await updateFoodAvailability(

                req.params.id,

                req.body.isAvailable

            );


        return res.status(200).json({

            success: true,

            message: "Food availability updated successfully",

            data: food

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE FOOD
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await deleteFood(
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

    updatePrice,

    updateStock,

    updateAvailability,

    remove

};