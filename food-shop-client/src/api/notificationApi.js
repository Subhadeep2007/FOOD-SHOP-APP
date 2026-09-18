import api from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const getNotifications = async (params) => unwrap(await api.get("/notifications", { params }));
const markNotificationRead = async (id) => unwrap(await api.patch("/notifications/" + id + "/read"));
const markAllNotificationsRead = async () => unwrap(await api.patch("/notifications/read-all"));

export { getNotifications, markNotificationRead, markAllNotificationsRead };
