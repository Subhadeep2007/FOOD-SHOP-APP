import crypto from "crypto";

const generateOrderId = () => {

    const timestamp =
        Date.now().toString(36).toUpperCase();

    const random =
        crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `FS-${timestamp}-${random}`;
};

export default generateOrderId;