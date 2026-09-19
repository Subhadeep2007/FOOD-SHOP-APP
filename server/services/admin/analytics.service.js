import User
from "../../models/user.model.js";

import Food
from "../../models/food.model.js";

import Order
from "../../models/order.model.js";

import Payment
from "../../models/payment.model.js";

import Refund
from "../../models/refund.model.js";


// ========================================
// DASHBOARD SUMMARY
// ========================================

const getDashboardSummary = async() => {

    const [
        totalUsers,
        activeUsers,
        totalFoods,
        activeFoods,
        totalOrders,
        deliveredOrders,
        cancelledOrders
    ] = await Promise.all([

        User.countDocuments({}),

        User.countDocuments({
            isActive: true,
            role: "user"
        }),

        Food.countDocuments({}),

        Food.countDocuments({
            isActive: true
        }),

        Order.countDocuments({}),

        Order.countDocuments({
            status: "DELIVERED"
        }),

        Order.countDocuments({
            status: "CANCELLED"
        })

    ]);


    const revenueResult =
        await Order.aggregate([

            {
                $match: {
                    status: "DELIVERED"
                }
            },

            {
                $group: {

                    _id: null,

                    totalRevenue: {
                        $sum: "$totalAmount"
                    },

                    averageOrderValue: {
                        $avg: "$totalAmount"
                    }

                }
            }

        ]);


    const revenue =
        revenueResult.length > 0 ?
        revenueResult[0] : {
            totalRevenue: 0,
            averageOrderValue: 0
        };


    return {

        users: {

            total: totalUsers,

            active: activeUsers

        },

        foods: {

            total: totalFoods,

            active: activeFoods

        },

        orders: {

            total: totalOrders,

            delivered: deliveredOrders,

            cancelled: cancelledOrders

        },

        revenue: {

            totalRevenue: Number(
                Number(
                    revenue.totalRevenue || 0
                ).toFixed(2)
            ),

            averageOrderValue: Number(
                Number(
                    revenue.averageOrderValue || 0
                ).toFixed(2)
            )

        }

    };
};


// ========================================
// SALES ANALYTICS
// ========================================

const getSalesAnalytics = async({
    startDate,
    endDate
}) => {

    const match = {

        status: "DELIVERED"

    };


    if (startDate || endDate) {

        match.createdAt = {};


        if (startDate) {

            match.createdAt.$gte =
                new Date(startDate);

        }


        if (endDate) {

            const end =
                new Date(endDate);

            end.setHours(
                23,
                59,
                59,
                999
            );

            match.createdAt.$lte =
                end;
        }

    }


    const [result, revenueByPaymentMethod] =
        await Promise.all([
            Order.aggregate([

            {
                $match: match
            },

            {
                $group: {

                    _id: null,

                    totalRevenue: {
                        $sum: "$totalAmount"
                    },

                    totalOrders: {
                        $sum: 1
                    },

                    averageOrderValue: {
                        $avg: "$totalAmount"
                    },

                    totalDiscount: {
                        $sum: "$discount"
                    },

                    totalDeliveryFee: {
                        $sum: "$deliveryFee"
                    },

                    totalTax: {
                        $sum: "$tax"
                    },

                    totalSubtotal: {
                        $sum: "$subtotal"
                    }

                }
            }

            ]),

            // Revenue is intentionally based on delivered orders, so both COD
            // and online payments are counted only after a successful delivery.
            Order.aggregate([
                {
                    $match: match
                },

                {
                    $group: {
                        _id: "$paymentMethod",
                        orders: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },

                {
                    $sort: { revenue: -1 }
                }
            ])
        ]);


    if (
        result.length === 0
    ) {

        return {

            totalRevenue: 0,

            totalOrders: 0,

            averageOrderValue: 0,

            totalDiscount: 0,

            totalDeliveryFee: 0,

            totalTax: 0,

            totalSubtotal: 0,

            revenueByPaymentMethod: []

        };
    }


    return {

        totalRevenue: Number(
            Number(
                result[0].totalRevenue || 0
            ).toFixed(2)
        ),

        totalOrders: result[0].totalOrders,

        averageOrderValue: Number(
            Number(
                result[0].averageOrderValue || 0
            ).toFixed(2)
        ),

        totalDiscount: Number(
            Number(
                result[0].totalDiscount || 0
            ).toFixed(2)
        ),

        totalDeliveryFee: Number(
            Number(
                result[0].totalDeliveryFee || 0
            ).toFixed(2)
        ),

        totalTax: Number(
            Number(
                result[0].totalTax || 0
            ).toFixed(2)
        ),

        totalSubtotal: Number(
            Number(
                result[0].totalSubtotal || 0
            ).toFixed(2)
        ),

        revenueByPaymentMethod: revenueByPaymentMethod.map(
            item => ({
                paymentMethod: item._id,
                orders: item.orders,
                revenue: Number(Number(item.revenue || 0).toFixed(2))
            })
        )

    };
};


// ========================================
// ORDER STATUS ANALYTICS
// ========================================

const getOrderStatusAnalytics = async() => {

    const result =
        await Order.aggregate([

            {
                $group: {

                    _id: "$status",

                    count: {
                        $sum: 1
                    }

                }
            },

            {
                $sort: {
                    count: -1
                }
            }

        ]);


    return result.map(
        item => ({

            status: item._id,

            count: item.count

        })
    );
};


// ========================================
// COD PAYMENTS AWAITING DELIVERY COLLECTION
// ========================================

const getPendingCODPayments = async() => {

    return Order.find({
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: {
            $nin: [
                "DELIVERED",
                "CANCELLED",
                "PAYMENT_PENDING"
            ]
        },
        deletedByAdminAt: null
    })
    .select(
        "orderNumber items totalAmount paymentMethod paymentStatus status deliveryAddress createdAt"
    )
    .populate(
        "user",
        "name email profileImage"
    )
    .sort({
        createdAt: -1
    })
    .limit(20);
};


// ========================================
// PAYMENT ANALYTICS
// ========================================

const getPaymentAnalytics = async() => {

    const byMethod =
        await Payment.aggregate([

            {
                $group: {

                    _id: "$paymentMethod",

                    count: {
                        $sum: 1
                    },

                    amount: {
                        $sum: "$amount"
                    }

                }
            },

            {
                $sort: {
                    amount: -1
                }
            }

        ]);


    const byStatus =
        await Payment.aggregate([

            {
                $group: {

                    _id: "$status",

                    count: {
                        $sum: 1
                    },

                    amount: {
                        $sum: "$amount"
                    }

                }
            },

            {
                $sort: {
                    count: -1
                }
            }

        ]);


    return {

        byMethod: byMethod.map(
            item => ({

                paymentMethod: item._id,

                count: item.count,

                amount: Number(
                    Number(
                        item.amount || 0
                    ).toFixed(2)
                )

            })
        ),

        byStatus: byStatus.map(
            item => ({

                status: item._id,

                count: item.count,

                amount: Number(
                    Number(
                        item.amount || 0
                    ).toFixed(2)
                )

            })
        )

    };
};


// ========================================
// TOP SELLING FOODS
// ========================================

const getTopSellingFoods = async({
    limit = 10
} = {}) => {

    const result =
        await Order.aggregate([

            {
                $match: {

                    status: "DELIVERED"

                }
            },

            {
                $unwind: "$items"

            },

            {
                $group: {

                    _id: "$items.food",

                    foodName: {
                        $first: "$items.name"
                    },

                    image: {
                        $first: "$items.image"
                    },

                    quantitySold: {
                        $sum: "$items.quantity"
                    },

                    revenue: {
                        $sum: "$items.subtotal"
                    }

                }
            },

            {
                $sort: {

                    quantitySold:
                        -1

                }
            },

            {
                $limit: Number(limit)

            }

        ]);


    return result.map(
        item => ({

            foodId: item._id,

            foodName: item.foodName,

            image: item.image,

            quantitySold: item.quantitySold,

            revenue: Number(
                Number(
                    item.revenue || 0
                ).toFixed(2)
            )

        })
    );
};


// ========================================
// FOOD PERFORMANCE
// ========================================

const getFoodPerformance = async() => {

    return Food.find({

            isActive: true

        })
        .select(
            "name images price discountPercentage stock isAvailable rating reviewCount"
        )
        .sort({

            rating: -1,

            reviewCount: -1

        });
};


// ========================================
// USER ANALYTICS
// ========================================

const getUserAnalytics = async() => {

    const result =
        await User.aggregate([

            {
                $match: {

                    role: "user"

                }
            },

            {
                $group: {

                    _id: null,

                    totalUsers: {
                        $sum: 1
                    },

                    verifiedUsers: {

                        $sum: {

                            $cond: [

                                {
                                    $eq: [
                                        "$isEmailVerified",
                                        true
                                    ]
                                },

                                1,

                                0

                            ]

                        }

                    },

                    activeUsers: {

                        $sum: {

                            $cond: [

                                {
                                    $eq: [
                                        "$isActive",
                                        true
                                    ]
                                },

                                1,

                                0

                            ]

                        }

                    }

                }
            }

        ]);


    const registrationTrend =
        await User.aggregate([

            {
                $match: {

                    role: "user"

                }
            },

            {
                $group: {

                    _id: {

                        year: {
                            $year: "$createdAt"
                        },

                        month: {
                            $month: "$createdAt"
                        }

                    },

                    users: {
                        $sum: 1
                    }

                }
            },

            {
                $sort: {

                    "_id.year": 1,

                    "_id.month": 1

                }

            }

        ]);


    return {

        summary: result.length > 0 ?

            result[0] :

            {
                totalUsers: 0,
                verifiedUsers: 0,
                activeUsers: 0
            },

        registrationTrend: registrationTrend.map(
            item => ({

                year: item._id.year,

                month: item._id.month,

                users: item.users

            })
        )

    };
};


// ========================================
// REFUND ANALYTICS
// ========================================

const getRefundAnalytics = async() => {

    const result =
        await Refund.aggregate([

            {
                $group: {

                    _id: "$status",

                    count: {
                        $sum: 1
                    },

                    requestedAmount: {
                        $sum: "$requestedAmount"
                    },

                    approvedAmount: {
                        $sum: "$approvedAmount"
                    }

                }
            },

            {
                $sort: {

                    count:
                        -1

                }

            }

        ]);


    const totalResult =
        await Refund.aggregate([

            {
                $match: {

                    status: "COMPLETED"

                }
            },

            {
                $group: {

                    _id: null,

                    totalRefunded: {

                        $sum: "$approvedAmount"

                    }

                }

            }

        ]);


    const totalRefunded =
        totalResult.length > 0 ?
        totalResult[0].totalRefunded :
        0;


    return {

        byStatus: result.map(
            item => ({

                status: item._id,

                count: item.count,

                requestedAmount: Number(
                    Number(
                        item.requestedAmount || 0
                    ).toFixed(2)
                ),

                approvedAmount: Number(
                    Number(
                        item.approvedAmount || 0
                    ).toFixed(2)
                )

            })
        ),

        totalRefunded: Number(
            Number(
                totalRefunded
            ).toFixed(2)
        )

    };
};


// ========================================
// DAILY SALES
// ========================================

const getDailySales = async({
    startDate,
    endDate
}) => {

    const match = {

        status: "DELIVERED"

    };


    if (startDate || endDate) {

        match.createdAt = {};


        if (startDate) {

            match.createdAt.$gte =
                new Date(startDate);

        }


        if (endDate) {

            const end =
                new Date(endDate);

            end.setHours(
                23,
                59,
                59,
                999
            );

            match.createdAt.$lte =
                end;
        }

    }


    const result =
        await Order.aggregate([

            {
                $match: match
            },

            {
                $group: {

                    _id: {

                        year: {
                            $year: "$createdAt"
                        },

                        month: {
                            $month: "$createdAt"
                        },

                        day: {
                            $dayOfMonth: "$createdAt"
                        }

                    },

                    orders: {
                        $sum: 1
                    },

                    revenue: {
                        $sum: "$totalAmount"
                    }

                }
            },

            {
                $sort: {

                    "_id.year": 1,

                    "_id.month": 1,

                    "_id.day": 1

                }

            }

        ]);


    return result.map(
        item => ({

            year: item._id.year,

            month: item._id.month,

            day: item._id.day,

            orders: item.orders,

            revenue: Number(
                Number(
                    item.revenue || 0
                ).toFixed(2)
            )

        })
    );
};


// ========================================
// COMPLETE ANALYTICS
// ========================================

const getCompleteAnalytics = async({
    startDate,
    endDate,
    topFoodLimit = 10
} = {}) => {

    const [
        dashboard,
        sales,
        orderStatus,
        payments,
        topFoods,
        foodPerformance,
        users,
        refunds,
        dailySales,
        pendingCODPayments
    ] = await Promise.all([

        getDashboardSummary(),

        getSalesAnalytics({

            startDate,
            endDate

        }),

        getOrderStatusAnalytics(),

        getPaymentAnalytics(),

        getTopSellingFoods({

            limit: topFoodLimit

        }),

        getFoodPerformance(),

        getUserAnalytics(),

        getRefundAnalytics(),

        getDailySales({

            startDate,
            endDate

        }),

        getPendingCODPayments()

    ]);


    return {

        dashboard,

        sales,

        orderStatus,

        payments,

        topFoods,

        foodPerformance,

        users,

        refunds,

        dailySales,

        pendingCODPayments

    };
};


// ========================================
// EXPORTS
// ========================================

export {

    getDashboardSummary,

    getSalesAnalytics,

    getOrderStatusAnalytics,

    getPaymentAnalytics,

    getTopSellingFoods,

    getFoodPerformance,

    getUserAnalytics,

    getRefundAnalytics,

    getDailySales,

    getPendingCODPayments,

    getCompleteAnalytics

};
