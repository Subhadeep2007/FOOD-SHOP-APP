import {
    Navigate,
    Outlet
} from "react-router";

import {
    useSelector
} from "react-redux";

function PublicOnlyRoute() {

    const {
        user,
        isAuthenticated
    } = useSelector(
        (state) =>
            state.auth
    );

    if (
        isAuthenticated &&
        user &&
        user.role === "admin"
    ) {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    if (
        isAuthenticated
    ) {

        return (
            <Navigate
                to="/account"
                replace
            />
        );
    }

    return (
        <Outlet />
    );
}

export default PublicOnlyRoute;