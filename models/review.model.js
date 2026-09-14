import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
        index: true
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000
    },

    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


// One review per user per food per order
reviewSchema.index({
    user: 1,
    food: 1,
    order: 1
}, {
    unique: true
});


const Review =
    mongoose.models.Review ||
    mongoose.model(
        "Review",
        reviewSchema
    );

export default Review;