import PDFDocument from "pdfkit";

const generateReceipt = async(
    order,
    payment
) => {

    const document =
        new PDFDocument({
            size: "A4",
            margin: 50
        });


    const chunks = [];


    document.on(
        "data",
        (chunk) => {
            chunks.push(chunk);
        }
    );


    const promise =
        new Promise(
            (resolve, reject) => {

                document.on(
                    "end",
                    () => {

                        resolve(
                            Buffer.concat(
                                chunks
                            )
                        );
                    }
                );


                document.on(
                    "error",
                    reject
                );
            }
        );


    // ========================================
    // HEADER
    // ========================================

    document
        .fontSize(24)
        .text(
            "FOOD SHOP", {
                align: "center"
            }
        );


    document
        .moveDown();


    document
        .fontSize(18)
        .text(
            "Payment Receipt", {
                align: "center"
            }
        );


    document
        .moveDown(2);


    // ========================================
    // ORDER INFO
    // ========================================

    document
        .fontSize(11)
        .text(
            `Order ID: ${order.orderNumber}`
        );

    document
        .text(
            `Date: ${order.createdAt.toLocaleString()}`
        );

    document
        .text(
            `Payment Method: ${payment.paymentMethod}`
        );

    document
        .text(
            `Payment Status: ${payment.status}`
        );


    if (
        payment.razorpayPaymentId
    ) {

        document
            .text(
                `Transaction ID: ${payment.razorpayPaymentId}`
            );
    }


    document
        .moveDown();


    // ========================================
    // CUSTOMER
    // ========================================

    document
        .fontSize(14)
        .text(
            "Delivery Details"
        );


    document
        .fontSize(11)
        .moveDown(0.5);


    document
        .text(
            order.deliveryAddress.fullName
        );

    document
        .text(
            order.deliveryAddress.phone
        );

    document
        .text(
            order.deliveryAddress.addressLine
        );


    if (
        order.deliveryAddress.landmark
    ) {

        document.text(
            order.deliveryAddress.landmark
        );
    }


    document.text(
        `${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.postalCode}`
    );


    document
        .moveDown();


    // ========================================
    // ITEMS
    // ========================================

    document
        .fontSize(14)
        .text(
            "Order Items"
        );


    document
        .moveDown(0.5);


    for (
        const item of order.items
    ) {

        document
            .fontSize(11)
            .text(
                `${item.name} x ${item.quantity}    ₹${item.subtotal.toFixed(2)}`
            );
    }


    document
        .moveDown();


    // ========================================
    // TOTAL
    // ========================================

    document
        .fontSize(11)
        .text(
            `Subtotal: ₹${order.subtotal.toFixed(2)}`
        );

    document
        .text(
            `Discount: ₹${order.discount.toFixed(2)}`
        );

    document
        .text(
            `Delivery Fee: ₹${order.deliveryFee.toFixed(2)}`
        );

    document
        .text(
            `Tax: ₹${order.tax.toFixed(2)}`
        );


    document
        .moveDown();


    document
        .fontSize(16)
        .text(
            `Total Paid: ₹${order.totalAmount.toFixed(2)}`, {
                align: "right"
            }
        );


    document
        .moveDown(2);


    document
        .fontSize(10)
        .text(
            "Thank you for ordering from Food Shop.", {
                align: "center"
            }
        );


    document.end();


    return promise;
};


export default generateReceipt;