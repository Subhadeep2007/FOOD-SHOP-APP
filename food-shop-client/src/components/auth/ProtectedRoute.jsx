import {
    Navigate,
    Outlet,
    useLocation
} from "react-router";

import {
    useSelector
} from "react-redux";

function ProtectedRoute({
    adminOnly = false
}) {

    const location =
        useLocation();

    const {
        user,
        isAuthenticated
    } = useSelector(
        (state) =>
            state.auth
    );

    if (!isAuthenticated) {

        return (
            <Navigate
                to={
                    adminOnly
                        ? "/admin/login"
                        : "/login"
                }
                replace
                state={{
                    from:
                        location
                }}
            />
        );
    }

    if (
        adminOnly &&
        (
            !user ||
            user.role !==
            "admin"
        )
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    if (
        !adminOnly &&
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

    return (
        <Outlet />
    );
}

export default ProtectedRoute;