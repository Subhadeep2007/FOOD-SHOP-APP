import User from "../../models/user.model.js";


// ========================================
// GET ALL USERS
// ========================================

const getAllUsers = async({
    page = 1,
    limit = 20,
    search
}) => {

    const currentPage =
        Math.max(1, Number(page));

    const currentLimit =
        Math.max(1, Number(limit));

    const skip =
        (currentPage - 1) *
        currentLimit;


    const query = {
        role: "user"
    };


    // ========================================
    // SEARCH
    // ========================================

    if (search) {

        query.$or = [

            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                email: {
                    $regex: search,
                    $options: "i"
                }
            }

        ];
    }


    const [
        users,
        total
    ] = await Promise.all([

        User.find(query)
        .select(
            "name email profileImage isEmailVerified role isActive createdAt updatedAt"
        )
        .sort({
            createdAt: -1
        })
        .skip(skip)
        .limit(currentLimit),

        User.countDocuments(query)

    ]);


    return {

        users,

        pagination: {

            page: currentPage,

            limit: currentLimit,

            total,

            pages: Math.ceil(
                total /
                currentLimit
            )

        }

    };
};


// ========================================
// GET SINGLE USER
// ========================================

const getUserById = async(
    userId
) => {

    const user =
        await User.findOne({

            _id: userId,

            role: "user"

        })
        .select(
            "name email profileImage isEmailVerified role isActive createdAt updatedAt"
        );


    if (!user) {

        const error =
            new Error(
                "Customer not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return user;
};


// ========================================
// UPDATE USER STATUS
// ========================================

const updateUserStatus = async(
    userId,
    isActive
) => {

    const user =
        await User.findOne({

            _id: userId,

            role: "user"

        });


    if (!user) {

        const error =
            new Error(
                "Customer not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        typeof isActive !== "boolean"
    ) {

        const error =
            new Error(
                "isActive must be true or false"
            );

        error.statusCode = 400;

        throw error;
    }


    user.isActive =
        isActive;


    await user.save();


    return await User.findById(
            user._id
        )
        .select(
            "name email profileImage isEmailVerified role isActive createdAt updatedAt"
        );
};


// ========================================
// DELETE USER
// ========================================

const deleteUser = async(
    userId
) => {

    const user =
        await User.findOne({

            _id: userId,

            role: "user"

        });


    if (!user) {

        const error =
            new Error(
                "Customer not found"
            );

        error.statusCode = 404;

        throw error;
    }


    await User.deleteOne({

        _id: userId,

        role: "user"

    });


    return {

        message: "Customer deleted successfully"

    };
};


// ========================================
// EXPORTS
// ========================================

export {

    getAllUsers,

    getUserById,

    updateUserStatus,

    deleteUser

};