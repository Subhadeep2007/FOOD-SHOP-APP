import {
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    cancelOrderByAdmin
} from "../../services/order/order.service.js";


// ========================================
// CREATE ORDER
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await createOrder({

                userId: req.user.userId,

                addressId: req.body.addressId,

                paymentMethod: req.body.paymentMethod

            });


        return res.status(201).json({

            success: true,

            message: "Order placed successfully",

            data: order

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// MY ORDERS
// ========================================

const getMine = async(
    req,
    res,
    next
) => {

    try {

        const orders =
            await getMyOrders(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            data: orders

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// MY ORDER
// ========================================

const getMineById = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await getMyOrderById(

                req.user.userId,

                req.params.id

            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });
        }


        return res.status(200).json({

            success: true,

            data: order

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// CUSTOMER CANCEL
// ========================================

const cancelMine = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await cancelMyOrder(

                req.user.userId,

                req.params.id,

                req.body.reason

            );


        return res.status(200).json({

            success: true,

            message: "Order cancelled successfully",

            data: order

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN ALL ORDERS
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllOrders({

                status: req.query.status,

                page: req.query.page || 1,

                limit: req.query.limit || 20

            });


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN ONE ORDER
// ========================================

const getOneAdmin = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await getAdminOrderById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });
        }


        return res.status(200).json({

            success: true,

            data: order

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN UPDATE STATUS
// ========================================

const updateStatus = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await updateOrderStatus(

                req.params.id,

                req.body.status

            );


        return res.status(200).json({

            success: true,

            message: "Order status updated successfully",

            data: order

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN CANCEL
// ========================================

const cancelAdmin = async(
    req,
    res,
    next
) => {

    try {

        const order =
            await cancelOrderByAdmin(

                req.params.id,

                req.body.reason

            );


        return res.status(200).json({

            success: true,

            message: "Order cancelled successfully",

            data: order

        });

    } catch (error) {

        next(error);
    }
};


export {
    create,
    getMine,
    getMineById,
    cancelMine,
    getAll,
    getOneAdmin,
    updateStatus,
    cancelAdmin
};