import api from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const createRefundRequest = async (data) => unwrap(await api.post("/refunds", data));
const getMyRefunds = async () => unwrap(await api.get("/refunds/my"));
const getAdminRefunds = async (params) => unwrap(await api.get("/refunds/admin/all", { params }));
const rejectRefund = async (id, note) => unwrap(await api.patch("/refunds/admin/" + id + "/reject", { note }));
const approveRefund = async (id, approvedAmount) => unwrap(await api.patch("/refunds/admin/" + id + "/approve", { approvedAmount }));
const completeCODRefund = async (id, bankTransferReference) => unwrap(await api.patch("/refunds/admin/" + id + "/complete-cod", { bankTransferReference }));
const deleteMyRefund = async (id) => unwrap(await api.delete("/refunds/my/" + id));
const deleteAdminRefund = async (id) => unwrap(await api.delete("/refunds/admin/" + id));

export { createRefundRequest, getMyRefunds, getAdminRefunds, rejectRefund, approveRefund, completeCODRefund, deleteMyRefund, deleteAdminRefund };
