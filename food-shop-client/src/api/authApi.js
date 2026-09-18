import api from "./axios";

const registerUser = async(
    data
) => {

    const response =
        await api.post(
            "/auth/register",
            data
        );

    return response.data;
};


const registerAdmin = async(
    data
) => {

    const response =
        await api.post(
            "/auth/admin/register",
            data
        );

    return response.data;
};


const verifyEmail = async(
    data
) => {

    const response =
        await api.post(
            "/auth/verify-email",
            data
        );

    return response.data;
};


const resendVerificationOTP = async(
    email
) => {

    const response =
        await api.post(
            "/auth/resend-verification", {
                email
            }
        );

    return response.data;
};


const loginUser = async(
    data
) => {

    const response =
        await api.post(
            "/auth/login",
            data
        );

    return response.data;
};


const loginAdmin = async(
    data
) => {

    const response =
        await api.post(
            "/auth/admin/login",
            data
        );

    return response.data;
};


const refreshAccessToken = async() => {

    const response =
        await api.post(
            "/auth/refresh-token"
        );

    return response.data;
};


const logoutUser = async() => {

    const response =
        await api.post(
            "/auth/logout"
        );

    return response.data;
};


const logoutAllSessions = async() => {

    const response =
        await api.post(
            "/auth/logout-all"
        );

    return response.data;
};


const forgotPassword = async(
    email
) => {

    const response =
        await api.post(
            "/auth/forgot-password", {
                email
            }
        );

    return response.data;
};


const resetPassword = async(
    data
) => {

    const response =
        await api.post(
            "/auth/reset-password",
            data
        );

    return response.data;
};


const changePassword = async(
    data
) => {

    const response =
        await api.post(
            "/auth/change-password",
            data
        );

    return response.data;
};


const updateProfileImage = async(
    file
) => {

    const formData =
        new FormData();

    formData.append(
        "profileImage",
        file
    );

    const response =
        await api.patch(
            "/auth/profile-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

    return response.data;
};


export {
    registerUser,
    registerAdmin,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    loginAdmin,
    refreshAccessToken,
    logoutUser,
    logoutAllSessions,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfileImage
};
