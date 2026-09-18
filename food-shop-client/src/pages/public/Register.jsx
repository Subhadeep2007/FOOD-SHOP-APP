import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    registerUser
} from "../../api/authApi";

import {
    Eye,
    EyeOff
} from "lucide-react";

function Register() {

    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState({
        name: "",
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

                await registerUser(
                    form
                );

                sessionStorage.setItem(
                    "verificationEmail",
                    form.email
                );

                toast.success(
                    "Verification OTP sent."
                );

                navigate(
                    "/verify-email"
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Registration failed."
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

                    <h1 className="mt-2 text-3xl font-black">
                        Create account
                    </h1>

                    <form
                        onSubmit={
                            submit
                        }
                        className="mt-7 space-y-4"
                    >

                        <input
                            required
                            minLength="2"
                            maxLength="50"
                            placeholder="Full name"
                            value={
                                form.name
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    name:
                                        event.target.value
                                })
                            }
                            className="w-full rounded-xl border px-4 py-3"
                        />

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
                            className="w-full rounded-xl border px-4 py-3"
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
                                className="w-full rounded-xl border px-4 py-3 pr-12"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
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
                            disabled={
                                loading
                            }
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60"
                        >
                            {loading
                                ? "Creating..."
                                : "Create Account"}
                        </button>

                    </form>

                    <p className="mt-5 text-center text-sm text-slate-500">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-bold text-slate-900"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </main>
    );
}

export default Register;