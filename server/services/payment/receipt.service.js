import Order from "../../models/order.model.js";
import Payment from "../../models/payment.model.js";

import generateReceipt
from "../../utils/generateReceipt.js";


const generateOrderReceipt = async(
    userId,
    orderId
) => {

    const order =
        await Order.findOne({

            _id: orderId,

            user: userId

        });


    if (!order) {

        const error =
            new Error(
                "Order not found"
            );

        error.statusCode = 404;

        throw error;
    }


    const payment =
        await Payment.findOne({

            order: order._id,

            user: userId

        });


    if (!payment) {

        const error =
            new Error(
                "Payment not found"
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        payment.paymentMethod ===
        "ONLINE" &&
        payment.status !==
        "CAPTURED"
    ) {

        const error =
            new Error(
                "Receipt is available only after successful payment"
            );

        error.statusCode = 400;

        throw error;
    }


    const pdfBuffer =
        await generateReceipt(
            order,
            payment
        );


    return pdfBuffer;
};


export default generateOrderReceipt;