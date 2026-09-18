import api from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const createOrder = async (data) => unwrap(await api.post("/orders", data));
const getMyOrders = async () => unwrap(await api.get("/orders/my-orders"));
const getMyOrderById = async (id) => unwrap(await api.get("/orders/my-orders/" + id));
const cancelMyOrder = async (id, reason) => unwrap(await api.patch("/orders/my-orders/" + id + "/cancel", { reason }));

export { createOrder, getMyOrders, getMyOrderById, cancelMyOrder };
