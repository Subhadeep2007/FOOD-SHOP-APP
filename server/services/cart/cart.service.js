import Cart from "../../models/cart.model.js";
import Food from "../../models/food.model.js";


// ========================================
// GET CART
// ========================================

const getCart = async(
    userId
) => {

    let cart =
        await Cart.findOne({
            user: userId
        }).populate({
            path: "items.food",
            select: "name price discountPercentage images isAvailable isActive stock category"
        });


    if (!cart) {

        cart =
            await Cart.create({
                user: userId,
                items: []
            });
    }


    return cart;
};


// ========================================
// ADD TO CART
// ========================================

const addToCart = async(
    userId,
    foodId,
    quantity
) => {

    const food =
        await Food.findOne({
            _id: foodId,
            isActive: true,
            isAvailable: true
        });


    if (!food) {

        const error =
            new Error(
                "Food is not available"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        food.stock <
        quantity
    ) {

        const error =
            new Error(
                "Insufficient stock"
            );

        error.statusCode = 400;

        throw error;
    }


    let cart =
        await Cart.findOne({
            user: userId
        });


    if (!cart) {

        cart =
            await Cart.create({
                user: userId,
                items: []
            });
    }


    const existingItem =
        cart.items.find(
            item =>
            item.food.toString() ===
            foodId.toString()
        );


    if (existingItem) {

        const newQuantity =
            existingItem.quantity +
            Number(quantity);


        if (
            newQuantity >
            food.stock
        ) {

            const error =
                new Error(
                    "Requested quantity exceeds available stock"
                );

            error.statusCode = 400;

            throw error;
        }


        existingItem.quantity =
            newQuantity;

    } else {

        cart.items.push({

            food: foodId,

            quantity: Number(
                quantity
            )

        });
    }


    await cart.save();


    return getCart(userId);
};


// ========================================
// UPDATE QUANTITY
// ========================================

const updateCartItem = async(
    userId,
    foodId,
    quantity
) => {

    const cart =
        await Cart.findOne({
            user: userId
        });


    if (!cart) {

        const error =
            new Error(
                "Cart not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const item =
        cart.items.find(
            cartItem =>
            cartItem.food.toString() ===
            foodId.toString()
        );


    if (!item) {

        const error =
            new Error(
                "Food is not in cart"
            );

        error.statusCode = 404;

        throw error;
    }


    const food =
        await Food.findById(
            foodId
        );


    if (!food || !food.isActive) {

        const error =
            new Error(
                "Food not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        quantity >
        food.stock
    ) {

        const error =
            new Error(
                "Requested quantity exceeds stock"
            );

        error.statusCode = 400;

        throw error;
    }


    item.quantity =
        Number(quantity);


    await cart.save();


    return getCart(userId);
};


// ========================================
// REMOVE FROM CART
// ========================================

const removeFromCart = async(
    userId,
    foodId
) => {

    const cart =
        await Cart.findOne({
            user: userId
        });


    if (!cart) {

        const error =
            new Error(
                "Cart not found"
            );

        error.statusCode = 404;

        throw error;
    }


    cart.items =
        cart.items.filter(
            item =>
            item.food.toString() !==
            foodId.toString()
        );


    await cart.save();


    return getCart(userId);
};


// ========================================
// CLEAR CART
// ========================================

const clearCart = async(
    userId
) => {

    await Cart.findOneAndUpdate(

        {
            user: userId
        },

        {
            items: []
        },

        {
            new: true,
            upsert: true
        }
    );


    return getCart(userId);
};


export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};