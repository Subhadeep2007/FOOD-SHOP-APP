import {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser
} from "../../services/admin/user.service.js";


// ========================================
// GET ALL USERS
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllUsers({

                page: req.query.page || 1,

                limit: req.query.limit || 20,

                search: req.query.search

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
// GET SINGLE USER
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const user =
            await getUserById(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            data: user

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// UPDATE USER STATUS
// ========================================

const updateStatus = async(
    req,
    res,
    next
) => {

    try {

        const user =
            await updateUserStatus(

                req.params.id,

                req.body.isActive

            );


        return res.status(200).json({

            success: true,

            message: "Customer status updated successfully",

            data: user

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE USER
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await deleteUser(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            message: result.message

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// EXPORTS
// ========================================

export {

    getAll,

    getOne,

    updateStatus,

    remove

};