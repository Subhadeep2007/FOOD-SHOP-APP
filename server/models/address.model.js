import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    label: {
        type: String,
        enum: [
            "home",
            "work",
            "other"
        ],
        default: "home"
    },

    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    addressLine: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },

    landmark: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    state: {
        type: String,
        required: true,
        trim: true
    },

    postalCode: {
        type: String,
        required: true,
        trim: true
    },

    country: {
        type: String,
        default: "India",
        trim: true
    },

    // ========================================
    // MAP DATA
    // ========================================

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    placeId: {
        type: String,
        default: ""
    },

    formattedAddress: {
        type: String,
        default: ""
    },

    isDefault: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Address =
    mongoose.models.Address ||
    mongoose.model(
        "Address",
        addressSchema
    );

export default Address;