import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    useDispatch
} from "react-redux";

import {
    loginAdmin
} from "../../api/authApi";

import {
    setCredentials
} from "../../store/authSlice";

import {
    setAccessToken
} from "../../api/axios";

import {
    Eye,
    EyeOff
} from "lucide-react";

function AdminLogin() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState({
        email: "",
        password: "",
        adminSecretKey: ""
    });

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [
        showSecretKey,
        setShowSecretKey
    ] = useState(false);

    const submit =
        async (
            event
        ) => {

            event.preventDefault();

            setLoading(
                true
            );

            try {

                const response =
                    await loginAdmin(
                        form
                    );

                const data =
                    response &&
                    response.data
                        ? response.data
                        : response;

                if (
                    data.accessToken
                ) {

                    setAccessToken(
                        data.accessToken
                    );
                }

                dispatch(
                    setCredentials(
                        response
                    )
                );

                toast.success(
                    "Admin login successful."
                );

                navigate(
                    "/admin"
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Admin login failed."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-12">

            <div className="mx-auto max-w-md">

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl md:p-8">

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        FoodShop Admin
                    </p>

                    <h1 className="mt-2 text-3xl font-black">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Login to access the admin panel.
                    </p>

                    <form
                        onSubmit={
                            submit
                        }
                        className="mt-7 space-y-4"
                    >

                        <input
                            required
                            type="email"
                            value={
                                form.email
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    email:
                                        event.target.value
                                })
                            }
                            placeholder="Admin email"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white"
                        />

                        <div className="relative">

                            <input
                                required
                                minLength="8"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    form.password
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm({
                                        ...form,
                                        password:
                                            event.target.value
                                    })
                                }
                                placeholder="Password"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                            >

                                {showPassword ? (

                                    <EyeOff
                                        size={20}
                                    />

                                ) : (

                                    <Eye
                                        size={20}
                                    />

                                )}

                            </button>

                        </div>

                        <div className="relative">

                            <input
                                required
                                type={
                                    showSecretKey
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    form.adminSecretKey
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm({
                                        ...form,
                                        adminSecretKey:
                                            event.target.value
                                    })
                                }
                                placeholder="Admin secret key"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowSecretKey(
                                        !showSecretKey
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                            >

                                {showSecretKey ? (

                                    <EyeOff
                                        size={20}
                                    />

                                ) : (

                                    <Eye
                                        size={20}
                                    />

                                )}

                            </button>

                        </div>

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="w-full rounded-xl bg-white px-4 py-3 font-black text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? "Logging in..."
                                : "Login as Admin"}

                        </button>

                    </form>

                    <Link
                        to="/admin/register"
                        className="mt-5 block text-center text-sm font-bold text-slate-400 transition hover:text-white"
                    >
                        Register Admin
                    </Link>

                </div>

            </div>

        </main>
    );
}

export default AdminLogin;