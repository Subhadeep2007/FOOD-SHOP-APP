import {
    BrowserRouter,
    Route,
    Routes
} from "react-router";

import {
    useEffect
} from "react";

import {
    useDispatch
} from "react-redux";

import {
    Toaster
} from "react-hot-toast";

import MainLayout
    from "./layouts/MainLayout";

import ProtectedRoute
    from "./components/auth/ProtectedRoute";

import PublicOnlyRoute
    from "./components/auth/PublicOnlyRoute";

import Home
    from "./pages/public/Home";

import Menu
    from "./pages/public/Menu";

import Categories
    from "./pages/public/Categories";

import FoodDetails
    from "./pages/public/FoodDetails";

import Favorites
    from "./pages/public/Favorites";

import Login
    from "./pages/public/Login";

import Register
    from "./pages/public/Register";

import VerifyEmail
    from "./pages/public/VerifyEmail";

import ForgotPassword
    from "./pages/public/ForgotPassword";

import ResetPassword
    from "./pages/public/ResetPassword";

import Account
    from "./pages/public/Account";

import ChangePassword
    from "./pages/public/ChangePassword";

import Cart
    from "./pages/public/Cart";

import Addresses
    from "./pages/public/Addresses";

import Orders
    from "./pages/public/Orders";

import OrderDetails
    from "./pages/public/OrderDetails";

import Checkout
    from "./pages/public/Checkout";

import AdminLogin
    from "./pages/admin/AdminLogin";

import AdminRegister
    from "./pages/admin/AdminRegister";

import AdminDashboard
    from "./pages/admin/AdminDashboard";

import AdminFoods
    from "./pages/admin/AdminFoods";

import AdminCategories
    from "./pages/admin/AdminCategories";

import AdminReviews
    from "./pages/admin/AdminReviews";

import AdminOrders
    from "./pages/admin/AdminOrders";

import AdminUsers
    from "./pages/admin/AdminUsers";

import Notifications
    from "./pages/public/Notifications";

import Refunds
    from "./pages/public/Refunds";

import AdminRefunds
    from "./pages/admin/AdminRefunds";

import {
    logout
} from "./store/authSlice";

import {
    resetCart
} from "./store/cartSlice";

function App() {

    const dispatch =
        useDispatch();

    useEffect(() => {

        const clearExpiredSession =
            () => {

                dispatch(
                    logout()
                );

                dispatch(
                    resetCart()
                );
            };

        window.addEventListener(
            "foodshop:auth-expired",
            clearExpiredSession
        );

        return () => {

            window.removeEventListener(
                "foodshop:auth-expired",
                clearExpiredSession
            );
        };

    }, [dispatch]);

    return (
        <BrowserRouter>

            <Toaster
                position="top-right"
            />

            <Routes>

                <Route
                    element={
                        <MainLayout />
                    }
                >

                    <Route
                        path="/"
                        element={
                            <Home />
                        }
                    />

                    <Route
                        path="/menu"
                        element={
                            <Menu />
                        }
                    />

                    <Route
                        path="/categories"
                        element={
                            <Categories />
                        }
                    />

                    <Route
                        path="/foods/:foodId"
                        element={
                            <FoodDetails />
                        }
                    />

                    <Route
                        path="/favorites"
                        element={
                            <Favorites />
                        }
                    />

                    <Route
                        element={
                            <ProtectedRoute />
                        }
                    >

                        <Route
                            path="/cart"
                            element={
                                <Cart />
                            }
                        />

                        <Route
                            path="/addresses"
                            element={
                                <Addresses />
                            }
                        />

                        <Route
                            path="/orders"
                            element={
                                <Orders />
                            }
                        />

                        <Route
                            path="/checkout"
                            element={
                                <Checkout />
                            }
                        />

                        <Route
                        path="/orders/:id"
                            element={
                                <OrderDetails />
                            }
                        />

                    </Route>

                </Route>

                <Route
                    element={
                        <PublicOnlyRoute />
                    }
                >

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <Register />
                        }
                    />

                </Route>

                <Route
                    path="/verify-email"
                    element={
                        <VerifyEmail />
                    }
                />

                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />

                <Route
                    path="/reset-password"
                    element={
                        <ResetPassword />
                    }
                />

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >

                    <Route
                        path="/account"
                        element={
                            <Account />
                        }
                    />

                    <Route path="/refunds" element={<Refunds />} />

                    <Route path="/notifications" element={<Notifications />} />

                    <Route
                        path="/change-password"
                        element={
                            <ChangePassword />
                        }
                    />

                </Route>

                <Route
                    path="/admin/login"
                    element={
                        <AdminLogin />
                    }
                />

                <Route
                    path="/admin/register"
                    element={
                        <AdminRegister />
                    }
                />

                <Route
                    element={
                        <ProtectedRoute
                            adminOnly={true}
                        />
                    }
                >

                    <Route
                        path="/admin"
                        element={
                            <AdminDashboard />
                        }
                    />

                    <Route
                        path="/admin/foods"
                        element={
                            <AdminFoods />
                        }
                    />

                    <Route
                        path="/admin/categories"
                        element={
                            <AdminCategories />
                        }
                    />

                    <Route
                        path="/admin/reviews"
                        element={
                            <AdminReviews />
                        }
                    />

                    <Route
                        path="/admin/orders"
                        element={
                            <AdminOrders />
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <AdminUsers />
                        }
                    />

                    <Route path="/admin/refunds" element={<AdminRefunds />} />

                    <Route
                        path="/admin/account"
                        element={
                            <Account />
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;
