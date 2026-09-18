import api from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const getAdminOrders = async (params) => unwrap(await api.get("/orders/admin/all", { params }));
const getAdminOrder = async (id) => unwrap(await api.get("/orders/admin/" + id));
const updateAdminOrderStatus = async (id, data) => unwrap(await api.patch("/orders/admin/" + id + "/status", data));
const cancelAdminOrder = async (id, reason) => unwrap(await api.patch("/orders/admin/" + id + "/cancel", { reason }));
const getDashboard = async () => unwrap(await api.get("/admin/analytics/dashboard"));
const getAdminUsers = async (params) => unwrap(await api.get("/admin/users", { params }));
const getAdminUser = async (id) => unwrap(await api.get("/admin/users/" + id));
const updateAdminUserStatus = async (id, isActive) => unwrap(await api.patch("/admin/users/" + id + "/status", { isActive }));
const deleteAdminUser = async (id) => unwrap(await api.delete("/admin/users/" + id));
const getCoupons = async () => unwrap(await api.get("/admin/coupons"));
const createCoupon = async (data) => unwrap(await api.post("/admin/coupons", data));
const updateCoupon = async (id, data) => unwrap(await api.patch("/admin/coupons/" + id, data));
const updateCouponStatus = async (id, isActive) => unwrap(await api.patch("/admin/coupons/" + id + "/status", { isActive }));
const deleteCoupon = async (id) => unwrap(await api.delete("/admin/coupons/" + id));

export { getAdminOrders, getAdminOrder, updateAdminOrderStatus, cancelAdminOrder, getDashboard, getAdminUsers, getAdminUser, updateAdminUserStatus, deleteAdminUser, getCoupons, createCoupon, updateCoupon, updateCouponStatus, deleteCoupon };
