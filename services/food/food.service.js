import Food from "../../models/food.model.js";

const createSlug = (name) => {

    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};


// ========================================
// CREATE FOOD
// ========================================

const createFood = async(data) => {

    const slug =
        createSlug(data.name);

    const existingFood =
        await Food.findOne({
            slug
        });

    if (existingFood) {

        const error =
            new Error(
                "Food with this name already exists"
            );

        error.statusCode = 409;

        throw error;
    }

    return Food.create({
        ...data,
        slug
    });
};


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

    // Search
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


    // Category
    if (category) {
        query.category =
            category;
    }


    // Food type
    if (foodType) {
        query.foodType =
            foodType;
    }


    // Price
    if (
        minPrice !== undefined ||
        maxPrice !== undefined
    ) {

        query.price = {};

        if (
            minPrice !== undefined
        ) {
            query.price.$gte =
                Number(minPrice);
        }

        if (
            maxPrice !== undefined
        ) {
            query.price.$lte =
                Number(maxPrice);
        }
    }


    let sortOption = {
        createdAt: -1
    };


    if (sort === "price-low") {

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


    const skip =
        (page - 1) * limit;


    const [foods, total] =
    await Promise.all([

        Food.find(query)
        .populate(
            "category",
            "name slug"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),

        Food.countDocuments(
            query
        )

    ]);


    return {

        foods,

        pagination: {

            page: Number(page),

            limit: Number(limit),

            total,

            pages: Math.ceil(
                total / limit
            )

        }

    };
};


// ========================================
// GET FOOD
// ========================================

const getFoodById = async(
    foodId
) => {

    return Food.findOne({
        _id: foodId,
        isActive: true
    }).populate(
        "category",
        "name slug"
    );
};


// ========================================
// UPDATE FOOD
// ========================================

const updateFood = async(
    foodId,
    data
) => {

    const updateData = {
        ...data
    };


    if (data.name) {

        updateData.slug =
            createSlug(
                data.name
            );
    }


    const food =
        await Food.findOneAndUpdate({
                _id: foodId
            },
            updateData, {
                new: true,
                runValidators: true
            }
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
// DELETE FOOD
// ========================================

const deleteFood = async(
    foodId
) => {

    const food =
        await Food.findByIdAndUpdate(
            foodId, {
                isActive: false,
                isAvailable: false
            }, {
                new: true
            }
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


export {
    createFood,
    getFoods,
    getFoodById,
    updateFood,
    deleteFood
};