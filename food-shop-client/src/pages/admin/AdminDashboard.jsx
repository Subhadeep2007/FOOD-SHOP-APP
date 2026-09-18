import {
    Link
} from "react-router";

import {
    useSelector
} from "react-redux";

import {
    useEffect,
    useState
} from "react";

import toast from "react-hot-toast";

import {
    getDashboard
} from "../../api/adminApi";

function AdminDashboard() {

    const {
        user
    } = useSelector(
        (state) =>
            state.auth
    );

    const [
        dashboard,
        setDashboard
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        const load =
            async () => {

                try {

                    setDashboard(
                        await getDashboard()
                    );

                } catch (error) {

                    toast.error(
                        error.response &&
                        error.response.data &&
                        error.response.data.message
                            ? error.response.data.message
                            : "Unable to load dashboard analytics."
                    );

                } finally {

                    setLoading(false);
                }
            };

        load();

    }, []);

    return (
        <main className="min-h-screen bg-slate-100 p-4 md:p-8">

            <div className="mx-auto max-w-7xl">

                <div className="rounded-3xl bg-slate-900 p-8 text-white">

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        FoodShop Admin
                    </p>

                    <h1 className="mt-2 text-4xl font-black">
                        Admin Dashboard
                    </h1>

                    <p className="mt-3 text-slate-300">
                        Welcome{" "}
                        {
                            user &&
                            user.name
                                ? user.name
                                : "Admin"
                        }
                    </p>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {loading ? (

                        <div className="col-span-full rounded-2xl bg-white p-6 text-slate-500">
                            Loading live analytics...
                        </div>

                    ) : (

                        <>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm font-bold text-slate-500">
                                    Total Users
                                </p>
                                <p className="mt-2 text-3xl font-black">
                                    {dashboard &&
                                    dashboard.users
                                        ? dashboard.users.total
                                        : 0}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm font-bold text-slate-500">
                                    Total Orders
                                </p>
                                <p className="mt-2 text-3xl font-black">
                                    {dashboard &&
                                    dashboard.orders
                                        ? dashboard.orders.total
                                        : 0}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm font-bold text-slate-500">
                                    Delivered Revenue
                                </p>
                                <p className="mt-2 text-3xl font-black">
                                    ₹{Number(
                                        dashboard &&
                                        dashboard.revenue
                                            ? dashboard.revenue.totalRevenue
                                            : 0
                                    ).toFixed(2)}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm font-bold text-slate-500">
                                    Active Foods
                                </p>
                                <p className="mt-2 text-3xl font-black">
                                    {dashboard &&
                                    dashboard.foods
                                        ? dashboard.foods.active
                                        : 0}
                                </p>
                            </div>

                        </>
                    )}

                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                    <Link
                        to="/admin/orders"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            Orders
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Review orders, delivery details and status.
                        </p>
                    </Link>

                    <Link
                        to="/admin/foods"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            Food Management
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage foods, price, stock and availability.
                        </p>
                    </Link>

                    <Link
                        to="/admin/categories"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            Categories
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage food categories.
                        </p>
                    </Link>

                    <Link
                        to="/admin/reviews"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            Reviews
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            View customer reviews.
                        </p>
                    </Link>

                    <Link
                        to="/admin/account"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            My Account
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            View your profile, change your password and manage sessions.
                        </p>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            All Customers
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            View customer profiles, email verification and account status.
                        </p>
                    </Link>

                    <Link
                        to="/admin/refunds"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-black">
                            Refunds
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Process Razorpay online refunds and COD bank-transfer refunds.
                        </p>
                    </Link>

                </div>

            </div>

        </main>
    );
}

export default AdminDashboard;
