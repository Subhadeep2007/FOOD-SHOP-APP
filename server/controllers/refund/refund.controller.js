import {
    createRefundRequest,
    getMyRefunds,
    getMyRefundById,
    getAllRefunds,
    rejectRefund,
    approveRefund,
    completeCODRefund,
    softDeleteMyRefund,
    softDeleteRefundByAdmin
} from "../../services/refund/refund.service.js";


// ========================================
// CREATE REQUEST
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const refund =
            await createRefundRequest({

                userId: req.user.userId,

                orderId: req.body.orderId,

                amount: req.body.amount,

                reason: req.body.reason,

                bankDetails: req.body.bankDetails

            });


        return res.status(201).json({

            success: true,

            message: "Refund request created successfully",

            data: refund

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// MY REFUNDS
// ========================================

const getMine = async(
    req,
    res,
    next
) => {

    try {

        const refunds =
            await getMyRefunds(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            data: refunds

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// MY REFUND
// ========================================

const getMineById = async(
    req,
    res,
    next
) => {

    try {

        const refund =
            await getMyRefundById(

                req.user.userId,

                req.params.id

            );


        if (!refund) {

            return res.status(404).json({

                success: false,

                message: "Refund not found"

            });
        }


        return res.status(200).json({

            success: true,

            data: refund

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN ALL
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllRefunds({

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
// ADMIN REJECT
// ========================================

const reject = async(
    req,
    res,
    next
) => {

    try {

        const refund =
            await rejectRefund({

                refundId: req.params.id,

                adminId: req.user.userId,

                note: req.body.note

            });


        return res.status(200).json({

            success: true,

            message: "Refund rejected",

            data: refund

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN APPROVE
// ========================================

const approve = async(
    req,
    res,
    next
) => {

    try {

        const refund =
            await approveRefund({

                refundId: req.params.id,

                adminId: req.user.userId,

                approvedAmount: req.body.approvedAmount

            });


        return res.status(200).json({

            success: true,

            message: "Refund processed successfully",

            data: refund

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// ADMIN COMPLETE COD REFUND
// ========================================

const completeCOD = async(
    req,
    res,
    next
) => {

    try {

        const refund =
            await completeCODRefund({

                refundId: req.params.id,

                adminId: req.user.userId,

                bankTransferReference: req.body.bankTransferReference

            });


        return res.status(200).json({

            success: true,

            message: "COD refund completed successfully",

            data: refund

        });

    } catch (error) {

        next(error);
    }
};


const deleteMine = async(req, res, next) => {
    try {
        await softDeleteMyRefund(req.user.userId, req.params.id);
        return res.status(200).json({ success: true, message: "Refund request deleted successfully" });
    } catch (error) { next(error); }
};

const deleteAdmin = async(req, res, next) => {
    try {
        await softDeleteRefundByAdmin(req.params.id);
        return res.status(200).json({ success: true, message: "Refund request deleted successfully" });
    } catch (error) { next(error); }
};


export {
    create,
    getMine,
    getMineById,
    getAll,
    reject,
    approve,
    completeCOD,
    deleteMine,
    deleteAdmin
};
