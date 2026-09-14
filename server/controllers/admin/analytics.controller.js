import {
    getDashboardSummary,
    getSalesAnalytics,
    getOrderStatusAnalytics,
    getPaymentAnalytics,
    getTopSellingFoods,
    getFoodPerformance,
    getUserAnalytics,
    getRefundAnalytics,
    getDailySales,
    getCompleteAnalytics
} from "../../services/admin/analytics.service.js";


// ========================================
// DASHBOARD SUMMARY
// ========================================

const dashboard = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getDashboardSummary();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// SALES ANALYTICS
// ========================================

const sales = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getSalesAnalytics({

                startDate: req.query.startDate,

                endDate: req.query.endDate

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
// ORDER STATUS ANALYTICS
// ========================================

const orderStatus = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getOrderStatusAnalytics();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// PAYMENT ANALYTICS
// ========================================

const payments = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getPaymentAnalytics();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// TOP SELLING FOODS
// ========================================

const topFoods = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getTopSellingFoods({

                limit: req.query.limit || 10

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
// FOOD PERFORMANCE
// ========================================

const foodPerformance = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getFoodPerformance();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// USER ANALYTICS
// ========================================

const users = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getUserAnalytics();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// REFUND ANALYTICS
// ========================================

const refunds = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getRefundAnalytics();


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DAILY SALES
// ========================================

const dailySales = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getDailySales({

                startDate: req.query.startDate,

                endDate: req.query.endDate

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
// COMPLETE ANALYTICS
// ========================================

const complete = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getCompleteAnalytics({

                startDate: req.query.startDate,

                endDate: req.query.endDate,

                topFoodLimit: req.query.topFoodLimit || 10

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
// EXPORTS
// ========================================

export {

    dashboard,

    sales,

    orderStatus,

    payments,

    topFoods,

    foodPerformance,

    users,

    refunds,

    dailySales,

    complete

};