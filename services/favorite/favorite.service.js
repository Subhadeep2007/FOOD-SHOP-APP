import Favorite from "../../models/favorite.model.js";
import Food from "../../models/food.model.js";


// ========================================
// ADD
// ========================================

const addFavorite = async(
    userId,
    foodId
) => {

    const food =
        await Food.findOne({

            _id: foodId,

            isActive: true

        });


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const existing =
        await Favorite.findOne({

            user: userId,

            food: foodId

        });


    if (existing) {

        return existing;
    }


    return Favorite.create({

        user: userId,

        food: foodId

    });
};


// ========================================
// GET
// ========================================

const getFavorites = async(
    userId
) => {

    return Favorite.find({
            user: userId
        })
        .populate(
            "food"
        )
        .sort({
            createdAt: -1
        });
};


// ========================================
// REMOVE
// ========================================

const removeFavorite = async(
    userId,
    foodId
) => {

    const favorite =
        await Favorite.findOneAndDelete({

            user: userId,

            food: foodId

        });


    if (!favorite) {

        const error =
            new Error(
                "Favorite not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return true;
};


export {
    addFavorite,
    getFavorites,
    removeFavorite
};