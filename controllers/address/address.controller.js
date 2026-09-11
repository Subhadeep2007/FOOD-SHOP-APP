import {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
} from "../../services/address/address.service.js";


// ========================================
// CREATE
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const address =
            await createAddress(
                req.user.userId,
                req.body
            );


        return res.status(201).json({

            success: true,

            message: "Address saved successfully",

            data: address

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// GET ALL
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const addresses =
            await getAddresses(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            data: addresses

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// GET ONE
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const address =
            await getAddressById(

                req.user.userId,

                req.params.id

            );


        if (!address) {

            return res.status(404).json({

                success: false,

                message: "Address not found"

            });
        }


        return res.status(200).json({

            success: true,

            data: address

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

        const address =
            await updateAddress(

                req.user.userId,

                req.params.id,

                req.body

            );


        return res.status(200).json({

            success: true,

            message: "Address updated successfully",

            data: address

        });

    } catch (error) {

        next(error);
    }
};


// ========================================
// DELETE
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        await deleteAddress(

            req.user.userId,

            req.params.id

        );


        return res.status(200).json({

            success: true,

            message: "Address deleted successfully"

        });

    } catch (error) {

        next(error);
    }
};


export {
    create,
    getAll,
    getOne,
    update,
    remove
};