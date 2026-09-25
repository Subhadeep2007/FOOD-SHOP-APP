import { api } from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const createRazorpayOrder = async(orderId) => unwrap(await api.post("/payments/create-order", { orderId }));
const verifyRazorpayPayment = async(data) => unwrap(await api.post("/payments/verify", data));
const createCODPayment = async(orderId) => unwrap(await api.post("/payments/cod", { orderId }));
const getPaymentByOrder = async(orderId) => unwrap(await api.get("/payments/order/" + orderId));

export { createRazorpayOrder, verifyRazorpayPayment, createCODPayment, getPaymentByOrder };