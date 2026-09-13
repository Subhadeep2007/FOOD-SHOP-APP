import Food
from "../../models/food.model.js";


// ========================================
// GET FOODS
// ========================================

const getFoods = async({
    search,
    category,
    foodType,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12
}) => {

    const query = {

        isActive: true

    };


    // ========================================
    // SEARCH
    // ========================================

    if (search) {

        query.$or = [

            {

                name: {

                    $regex: search,

                    $options: "i"

                }

            },

            {

                description: {

                    $regex: search,

                    $options: "i"

                }

            }

        ];

    }


    // ========================================
    // CATEGORY
    // ========================================

    if (category) {

        query.category =
            category;

    }


    // ========================================
    // FOOD TYPE
    // ========================================

    if (foodType) {

        query.foodType =
            foodType;

    }


    // ========================================
    // PRICE
    // ========================================

    if (
        minPrice !== undefined ||
        maxPrice !== undefined
    ) {

        query.price = {};


        if (
            minPrice !== undefined
        ) {

            query.price.$gte =
                Number(
                    minPrice
                );

        }


        if (
            maxPrice !== undefined
        ) {

            query.price.$lte =
                Number(
                    maxPrice
                );

        }

    }


    // ========================================
    // SORT
    // ========================================

    let sortOption = {

        createdAt: -1

    };


    if (
        sort === "price-low"
    ) {

        sortOption = {

            price: 1

        };

    } else if (
        sort === "price-high"
    ) {

        sortOption = {

            price: -1

        };

    } else if (
        sort === "rating"
    ) {

        sortOption = {

            rating: -1

        };

    }


    // ========================================
    // PAGINATION
    // ========================================

    const currentPage =
        Math.max(
            1,
            Number(page)
        );


    const currentLimit =
        Math.max(
            1,
            Number(limit)
        );


    const skip =
        (
            currentPage - 1
        ) *
        currentLimit;


    const [
        foods,
        total
    ] =
    await Promise.all([

        Food.find(query)

        .populate(
            "category",
            "name slug"
        )

        .sort(
            sortOption
        )

        .skip(
            skip
        )

        .limit(
            currentLimit
        ),

        Food.countDocuments(
            query
        )

    ]);


    return {

        foods,

        pagination: {

            page: currentPage,

            limit: currentLimit,

            total,

            pages: Math.ceil(
                total /
                currentLimit
            )

        }

    };

};


// ========================================
// GET SINGLE FOOD
// ========================================

const getFoodById = async(
    foodId
) => {

    return Food.findOne({

            _id: foodId,

            isActive: true

        })
        .populate(
            "category",
            "name slug"
        );

};


// ========================================
// EXPORTS
// ========================================

export {

    getFoods,

    getFoodById

};