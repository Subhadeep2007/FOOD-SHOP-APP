import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../../services/cart/cart.service.js";


// ========================================
// GET
// ========================================

const get = async(
    req,
    res,
    next
) => {

    try {

        const cart =
            await getCart(
                req.user.userId
            );

        return res.status(200).json({

            success: true,

            data: cart

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADD
// ========================================

const add = async(
    req,
    res,
    next
) => {

    try {

        const cart =
            await addToCart(

                req.user.userId,

                req.body.foodId,

                req.body.quantity

            );


        return res.status(200).json({

            success: true,

            message: "Food added to cart",

            data: cart

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const cart =
            await updateCartItem(

                req.user.userId,

                req.params.foodId,

                req.body.quantity

            );


        return res.status(200).json({

            success: true,

            message: "Cart updated successfully",

            data: cart

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// REMOVE
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        const cart =
            await removeFromCart(

                req.user.userId,

                req.params.foodId

            );


        return res.status(200).json({

            success: true,

            message: "Food removed from cart",

            data: cart

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// CLEAR
// ========================================

const clear = async(
    req,
    res,
    next
) => {

    try {

        await clearCart(
            req.user.userId
        );


        return res.status(200).json({

            success: true,

            message: "Cart cleared successfully"

        });

    } catch (error) {

        next(error);
    }
};


export {
    get,
    add,
    update,
    remove,
    clear
};