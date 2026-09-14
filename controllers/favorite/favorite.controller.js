import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../../services/favorite/favorite.service.js";


// ========================================
// GET
// ========================================

const get = async(
    req,
    res,
    next
) => {

    try {

        const favorites =
            await getFavorites(
                req.user.userId
            );

        return res.status(200).json({

            success: true,

            data: favorites

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADD
// ========================================

const add = async(
    req,
    res,
    next
) => {

    try {

        const favorite =
            await addFavorite(

                req.user.userId,

                req.body.foodId

            );


        return res.status(201).json({

            success: true,

            message: "Food added to favorites",

            data: favorite

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// REMOVE
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        await removeFavorite(

            req.user.userId,

            req.params.foodId

        );


        return res.status(200).json({

            success: true,

            message: "Food removed from favorites"

        });

    } catch (error) {

        next(error);
    }
};


export {
    get,
    add,
    remove
};