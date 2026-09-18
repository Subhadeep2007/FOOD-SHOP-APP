import Notification
from "../../models/notification.model.js";


// ========================================
// CREATE
// ========================================

const createNotification = async({
    userId,
    type,
    title,
    message,
    data = {}
}) => {

    return Notification.create({

        user: userId,

        type,

        title,

        message,

        data

    });
};


// ========================================
// GET MY NOTIFICATIONS
// ========================================

const getMyNotifications = async(
    userId,
    page = 1,
    limit = 20
) => {

    const skip =
        (
            Number(page) - 1
        ) *
        Number(limit);


    const [
        notifications,
        total
    ] =
    await Promise.all([

        Notification.find({
            user: userId
        })
        .sort({
            createdAt: -1
        })
        .skip(skip)
        .limit(
            Number(limit)
        ),

        Notification.countDocuments({
            user: userId
        })

    ]);


    return {

        notifications,

        pagination: {

            page: Number(page),

            limit: Number(limit),

            total,

            pages: Math.ceil(
                total /
                Number(limit)
            )

        }

    };
};


// ========================================
// MARK READ
// ========================================

const markNotificationAsRead = async(
    userId,
    notificationId
) => {

    const notification =
        await Notification.findOneAndUpdate(

            {
                _id: notificationId,

                user: userId

            },

            {
                isRead: true,

                readAt: new Date()

            },

            {
                new: true
            }
        );


    if (!notification) {

        const error =
            new Error(
                "Notification not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return notification;
};


// ========================================
// MARK ALL READ
// ========================================

const markAllNotificationsAsRead = async(
    userId
) => {

    await Notification.updateMany(

        {
            user: userId,

            isRead: false

        },

        {

            isRead: true,

            readAt: new Date()

        }

    );


    return true;
};


const deleteMyNotification = async(userId, notificationId) => {
    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
    });
    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        throw error;
    }
    return true;
};


export {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteMyNotification
};
