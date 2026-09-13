import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});


favoriteSchema.index({
    user: 1,
    food: 1
}, {
    unique: true
});


const Favorite =
    mongoose.models.Favorite ||
    mongoose.model(
        "Favorite",
        favoriteSchema
    );

export default Favorite;