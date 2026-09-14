import Address from "../../models/address.model.js";


// ========================================
// CREATE ADDRESS
// ========================================

const createAddress = async(
    userId,
    data
) => {

    // ----------------------------------------
    // If first address OR default requested
    // ----------------------------------------

    const existingCount =
        await Address.countDocuments({
            user: userId,
            isActive: true
        });


    let isDefault =
        Boolean(data.isDefault);


    if (
        existingCount === 0
    ) {

        isDefault = true;
    }


    if (isDefault) {

        await Address.updateMany({
            user: userId,
            isActive: true
        }, {
            isDefault: false
        });
    }


    return Address.create({

        ...data,

        user: userId,

        isDefault

    });
};


// ========================================
// GET ADDRESSES
// ========================================

const getAddresses = async(
    userId
) => {

    return Address.find({

        user: userId,

        isActive: true

    }).sort({

        isDefault: -1,

        createdAt: -1

    });
};


// ========================================
// GET ONE
// ========================================

const getAddressById = async(
    userId,
    addressId
) => {

    return Address.findOne({

        _id: addressId,

        user: userId,

        isActive: true

    });
};


// ========================================
// UPDATE
// ========================================

const updateAddress = async(
    userId,
    addressId,
    data
) => {

    if (data.isDefault) {

        await Address.updateMany({
            user: userId,
            isActive: true
        }, {
            isDefault: false
        });
    }


    const address =
        await Address.findOneAndUpdate(

            {
                _id: addressId,

                user: userId,

                isActive: true

            },

            data,

            {
                new: true,

                runValidators: true
            }
        );


    if (!address) {

        const error =
            new Error(
                "Address not found"
            );

        error.statusCode = 404;

        throw error;
    }


    return address;
};


// ========================================
// DELETE
// ========================================

const deleteAddress = async(
    userId,
    addressId
) => {

    const address =
        await Address.findOneAndUpdate(

            {
                _id: addressId,

                user: userId,

                isActive: true

            },

            {
                isActive: false,

                isDefault: false

            },

            {
                new: true
            }
        );


    if (!address) {

        const error =
            new Error(
                "Address not found"
            );

        error.statusCode = 404;

        throw error;
    }


    // ----------------------------------------
    // Promote another address if needed
    // ----------------------------------------

    if (address.isDefault) {

        const nextAddress =
            await Address.findOne({

                user: userId,

                isActive: true

            }).sort({

                createdAt: 1

            });


        if (nextAddress) {

            nextAddress.isDefault =
                true;

            await nextAddress.save();
        }
    }


    return address;
};


export {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
};