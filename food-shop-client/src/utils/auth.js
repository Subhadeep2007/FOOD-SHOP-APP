const getStoredUser = () => {
    const rawUser =
        localStorage.getItem("user");

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        return null;
    }
};

const getCurrentUserId = () => {
    const user =
        getStoredUser();

    if (!user) {
        return "";
    }

    return (
        user._id ||
        user.id ||
        ""
    );
};

const isAdminUser = () => {
    const user =
        getStoredUser();

    return Boolean(
        user &&
        user.role === "admin"
    );
};

export {
    getStoredUser,
    getCurrentUserId,
    isAdminUser
};