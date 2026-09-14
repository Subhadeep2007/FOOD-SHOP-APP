import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    }
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },

    items: {
        type: [cartItemSchema],
        default: []
    }
}, {
    timestamps: true
});

const Cart =
    mongoose.models.Cart ||
    mongoose.model(
        "Cart",
        cartSchema
    );

export default Cart;