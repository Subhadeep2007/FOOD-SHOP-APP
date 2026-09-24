import {
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    useDispatch
} from "react-redux";

import {
    loginUser
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

function Login() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();

    const location = useLocation();

    const [
        form,
        setForm
    ] = useState({
        email: "",
        password: ""
    });

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        showPassword,
        setShowPassword
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
                    await loginUser(
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
                    "Login successful."
                );

                navigate(
                    location.state && location.state.from && location.state.from.pathname
                        ? location.state.from.pathname
                        : "/account",
                    { replace: true }
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Login failed."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-12">

            <div className="mx-auto max-w-md">

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                        FoodShop
                    </p>

                    <h1 className="mt-2 text-3xl font-black text-slate-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Login to continue ordering.
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
                            placeholder="Email"
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
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
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
                                placeholder="Password"
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
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-slate-900"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
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

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"}

                        </button>

                    </form>

                    <div className="mt-5 flex justify-between gap-3 text-sm">

                        <Link
                            to="/forgot-password"
                            className="font-semibold text-slate-600 hover:text-slate-900"
                        >
                            Forgot password?
                        </Link>

                        <Link
                            to="/register"
                            className="font-bold text-slate-900"
                        >
                            Create account
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Login;
