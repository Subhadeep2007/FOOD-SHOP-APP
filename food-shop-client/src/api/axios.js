import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

let accessToken = localStorage.getItem("accessToken") || "";
let refreshPromise = null;

export const setAccessToken = (
    token
) => {

    accessToken = token || "";

    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
    } else {
        localStorage.removeItem("accessToken");
    }
};

export const getAccessToken = () => {

    return accessToken;
};

api.interceptors.request.use(
    (config) => {

        if (
            accessToken
        ) {

            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },

    (error) =>
    Promise.reject(
        error
    )
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response && error.response.status;
        const isRefreshRequest = originalRequest && originalRequest.url === "/auth/refresh-token";

        if (!originalRequest || status !== 401 || originalRequest._retry || isRefreshRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api.post("/auth/refresh-token").then((response) => {
                    const body = response.data;
                    const data = body && body.data ? body.data : body;

                    if (!data || !data.accessToken) {
                        throw new Error("No access token returned while refreshing session.");
                    }

                    setAccessToken(data.accessToken);
                    return data.accessToken;
                }).finally(() => {
                    refreshPromise = null;
                });
            }

            const token = await refreshPromise;
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
        } catch (refreshError) {
            setAccessToken("");
            window.dispatchEvent(new Event("foodshop:auth-expired"));
            return Promise.reject(refreshError);
        }
    }
);

export default api;
