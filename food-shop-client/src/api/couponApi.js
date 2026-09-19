import api from "./axios";

const validateCoupon = async (code, orderAmount) => {
    const response = await api.post("/coupons/validate", { code, orderAmount });
    return response.data && response.data.data ? response.data.data : response.data;
};

const getAvailableCoupons = async () => {
    const response = await api.get("/coupons/available");
    return response.data && response.data.data ? response.data.data : response.data;
};

export { validateCoupon, getAvailableCoupons };
