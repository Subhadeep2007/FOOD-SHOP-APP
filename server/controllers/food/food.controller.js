import {
    getFoods,
    getFoodById
} from "../../services/food/food.service.js";


// ========================================
// GET ALL
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getFoods({

                search: req.query.search,

                category: req.query.category,

                foodType: req.query.foodType,

                minPrice: req.query.minPrice,

                maxPrice: req.query.maxPrice,

                sort: req.query.sort,

                page: req.query.page || 1,

                limit: req.query.limit || 12

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
// GET ONE
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


        if (!food) {

            return res.status(404).json({

                success: false,

                message: "Food not found"

            });

        }


        return res.status(200).json({

            success: true,

            data: food

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