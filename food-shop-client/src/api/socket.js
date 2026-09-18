import { io } from "socket.io-client";
import { getAccessToken } from "./axios";

const socketUrl = import.meta.env.VITE_SOCKET_URL || String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

const createOrderSocket = () => io(socketUrl, {
    auth: { token: getAccessToken() },
    transports: ["websocket", "polling"]
});

export { createOrderSocket };
