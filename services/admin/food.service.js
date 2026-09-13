import Food from "../../models/food.model.js";


// ========================================
// GET ALL FOODS
// ========================================

const getAllFoods = async({
    page = 1,
    limit = 20,
    search,
    category,
    foodType,
    isAvailable,
    isActive
}) => {

    const currentPage =
        Math.max(1, Number(page));

    const currentLimit =
        Math.max(1, Number(limit));

    const skip =
        (currentPage - 1) *
        currentLimit;


    const query = {};


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
    // AVAILABILITY
    // ========================================

    if (
        isAvailable !== undefined
    ) {

        query.isAvailable =
            isAvailable === "true";
    }


    // ========================================
    // ACTIVE STATUS
    // ========================================

    if (
        isActive !== undefined
    ) {

        query.isActive =
            isActive === "true";
    }


    const [
        foods,
        total
    ] = await Promise.all([

        Food.find(query)
        .populate(
            "category",
            "name slug"
        )
        .sort({
            createdAt: -1
        })
        .skip(skip)
        .limit(currentLimit),

        Food.countDocuments(query)

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

    const food =
        await Food.findById(
            foodId
        )
        .populate(
            "category",
            "name slug"
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return food;
};


// ========================================
// CREATE FOOD
// ========================================

const createFood = async(
    foodData
) => {

    const food =
        await Food.create(
            foodData
        );


    return await Food.findById(
            food._id
        )
        .populate(
            "category",
            "name slug"
        );
};


// ========================================
// UPDATE FOOD
// ========================================

const updateFood = async(
    foodId,
    foodData
) => {

    const food =
        await Food.findById(
            foodId
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    Object.keys(foodData).forEach(
        (key) => {

            if (
                foodData[key] !== undefined
            ) {

                food[key] =
                    foodData[key];

            }

        }
    );


    await food.save();


    return await Food.findById(
            food._id
        )
        .populate(
            "category",
            "name slug"
        );
};


// ========================================
// UPDATE PRICE
// ========================================

const updateFoodPrice = async(
    foodId,
    price,
    discountPercentage
) => {

    const food =
        await Food.findById(
            foodId
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        price !== undefined
    ) {

        const numericPrice =
            Number(price);

        if (
            Number.isNaN(
                numericPrice
            ) ||
            numericPrice < 0
        ) {

            const error =
                new Error(
                    "Price must be a valid positive number"
                );

            error.statusCode = 400;

            throw error;
        }

        food.price =
            numericPrice;
    }


    if (
        discountPercentage !== undefined
    ) {

        const numericDiscount =
            Number(
                discountPercentage
            );

        if (
            Number.isNaN(
                numericDiscount
            ) ||
            numericDiscount < 0 ||
            numericDiscount > 100
        ) {

            const error =
                new Error(
                    "Discount percentage must be between 0 and 100"
                );

            error.statusCode = 400;

            throw error;
        }

        food.discountPercentage =
            numericDiscount;
    }


    await food.save();


    return food;
};


// ========================================
// UPDATE STOCK
// ========================================

const updateFoodStock = async(
    foodId,
    stock
) => {

    const food =
        await Food.findById(
            foodId
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const numericStock =
        Number(stock);


    if (
        Number.isNaN(
            numericStock
        ) ||
        numericStock < 0
    ) {

        const error =
            new Error(
                "Stock must be a valid non-negative number"
            );

        error.statusCode = 400;

        throw error;
    }


    food.stock =
        numericStock;


    food.isAvailable =
        numericStock > 0;


    await food.save();


    return food;
};


// ========================================
// UPDATE AVAILABILITY
// ========================================

const updateFoodAvailability = async(
    foodId,
    isAvailable
) => {

    const food =
        await Food.findById(
            foodId
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        typeof isAvailable !==
        "boolean"
    ) {

        const error =
            new Error(
                "isAvailable must be true or false"
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        isAvailable &&
        food.stock <= 0
    ) {

        const error =
            new Error(
                "Food cannot be made available when stock is zero"
            );

        error.statusCode = 400;

        throw error;
    }


    food.isAvailable =
        isAvailable;


    await food.save();


    return food;
};


// ========================================
// DELETE FOOD
// ========================================

const deleteFood = async(
    foodId
) => {

    const food =
        await Food.findById(
            foodId
        );


    if (!food) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // Soft delete

    food.isActive =
        false;

    food.isAvailable =
        false;


    await food.save();


    return {

        message: "Food deleted successfully"

    };
};


// ========================================
// EXPORTS
// ========================================

export {

    getAllFoods,

    getFoodById,

    createFood,

    updateFood,

    updateFoodPrice,

    updateFoodStock,

    updateFoodAvailability,

    deleteFood

};