import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },

    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    _id: false
});


const addressSnapshotSchema =
    new mongoose.Schema({
        fullName: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        addressLine: {
            type: String,
            required: true
        },

        landmark: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        postalCode: {
            type: String,
            required: true
        },

        country: {
            type: String,
            default: "India"
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },

        formattedAddress: {
            type: String,
            default: ""
        },

        placeId: {
            type: String,
            default: ""
        }
    }, {
        _id: false
    });


const orderSchema =
    new mongoose.Schema({
        // ========================================
        // ORDER IDENTIFICATION
        // ========================================

        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ========================================
        // ITEMS SNAPSHOT
        // ========================================

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (
                    items
                ) => items.length > 0,

                message: "Order must contain at least one item"
            }
        },

        // ========================================
        // ADDRESS SNAPSHOT
        // ========================================

        deliveryAddress: {
            type: addressSnapshotSchema,
            required: true
        },

        // ========================================
        // PRICE
        // ========================================

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // ========================================
        // PAYMENT
        // ========================================

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "ONLINE"
            ],
            required: true
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        },

        razorpayOrderId: {
            type: String,
            default: null,
            index: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "PENDING",
                "SUCCESS",
                "FAILED",
                "CANCELLED",
                "REFUND_PENDING",
                "REFUNDED",
                "PARTIALLY_REFUNDED"
            ],
            default: "PENDING"
        },

        // ========================================
        // ORDER STATUS
        // ========================================

        status: {
            type: String,
            enum: [
                "PLACED",
                "CONFIRMED",
                "PREPARING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
                "PAYMENT_PENDING"
            ],
            default: "PLACED",
            index: true
        },

        // ========================================
        // CANCELLATION
        // ========================================

        cancellationReason: {
            type: String,
            default: ""
        },

        cancelledBy: {
            type: String,
            enum: [
                "customer",
                "admin",
                null
            ],
            default: null
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        couponCode: {
            type: String,
            default: null,
            uppercase: true,
            trim: true
        },

        // Visibility is tracked independently, so a customer hiding an order
        // does not remove it from the admin's operational history (and vice versa).
        deletedByCustomerAt: {
            type: Date,
            default: null
        },

        deletedByAdminAt: {
            type: Date,
            default: null
        },

        // ========================================
        // DELIVERY
        // ========================================

        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ========================================
        // DELIVERY BOY DETAILS
        // ========================================

        deliveryDetails: {
            name: {
                type: String,
                trim: true,
                default: ""
            },

            phone: {
                type: String,
                trim: true,
                default: ""
            },

            whatsappNumber: {
                type: String,
                trim: true,
                default: ""
            }
        },

        estimatedDeliveryTime: {
            type: Date,
            default: null
        }
    }, {
        timestamps: true
    });


const Order =
    mongoose.models.Order ||
    mongoose.model(
        "Order",
        orderSchema
    );


export default Order;
