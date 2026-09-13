import Food from "../../models/food.model.js";

import cloudinary
from "../../config/cloudinary.js";

import streamifier
from "streamifier";


const createSlug = (name) => {

    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

};


// ========================================
// UPLOAD IMAGE TO CLOUDINARY
// ========================================

const uploadImage = async(
    file
) => {

    return new Promise(
        (resolve, reject) => {

            const uploadStream =
                cloudinary
                .uploader
                .upload_stream(

                    {
                        folder: "food-shop/foods"
                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            reject(
                                error
                            );

                            return;
                        }


                        resolve(
                            result.secure_url
                        );

                    }

                );


            streamifier
                .createReadStream(
                    file.buffer
                )
                .pipe(
                    uploadStream
                );

        }
    );
};


// ========================================
// UPLOAD MULTIPLE IMAGES
// ========================================

const uploadImages = async(
    files
) => {

    const images = [];


    for (
        const file of files
    ) {

        const imageUrl =
            await uploadImage(
                file
            );

        images.push(
            imageUrl
        );
    }


    return images;
};


// ========================================
// CREATE FOOD
// ========================================

const createFood = async(
    data,
    files = []
) => {

    const slug =
        createSlug(
            data.name
        );


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


    let images = [];


    if (
        files.length > 0
    ) {

        images =
            await uploadImages(
                files
            );
    }


    return Food.create({

        ...data,

        slug,

        images

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


    const skip =
        (
            Number(page) - 1
        ) *
        Number(limit);


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
            Number(limit)
        ),

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
                total /
                Number(limit)
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

        })
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
    data,
    files = []
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


    // ========================================
    // UPDATE IMAGE
    // ========================================

    if (
        files.length > 0
    ) {

        updateData.images =
            await uploadImages(
                files
            );

    }


    const food =
        await Food.findOneAndUpdate(

            {

                _id: foodId

            },

            updateData,

            {

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

            foodId,

            {

                isActive: false,

                isAvailable: false

            },

            {

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


// ========================================
// EXPORTS
// ========================================

export {

    createFood,

    getFoods,

    getFoodById,

    updateFood,

    deleteFood

};