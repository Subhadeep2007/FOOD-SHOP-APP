import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../../services/notification/notification.service.js";


// ========================================
// GET
// ========================================

const getMine = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getMyNotifications(

                req.user.userId,

                req.query.page || 1,

                req.query.limit || 20

            );


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// READ ONE
// ========================================

const read = async(
    req,
    res,
    next
) => {

    try {

        const notification =
            await markNotificationAsRead(

                req.user.userId,

                req.params.id

            );


        return res.status(200).json({

            success: true,

            data: notification

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// READ ALL
// ========================================

const readAll = async(
    req,
    res,
    next
) => {

    try {

        await markAllNotificationsAsRead(
            req.user.userId
        );


        return res.status(200).json({

            success: true,

            message: "All notifications marked as read"

        });

    } catch (error) {

        next(error);
    }
};


export {
    getMine,
    read,
    readAll
};