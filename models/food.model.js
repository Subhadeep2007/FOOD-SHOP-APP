import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },

    images: {
        type: [String],
        default: []
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true
    },

    foodType: {
        type: String,
        enum: [
            "veg",
            "non-veg",
            "egg"
        ],
        required: true
    },

    ingredients: {
        type: [String],
        default: []
    },

    preparationTime: {
        type: Number,
        default: 15,
        min: 1
    },

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },

    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

const Food =
    mongoose.models.Food ||
    mongoose.model(
        "Food",
        foodSchema
    );

export default Food;