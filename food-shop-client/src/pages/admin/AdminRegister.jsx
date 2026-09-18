import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    registerAdmin
} from "../../api/authApi";

import {
    Eye,
    EyeOff
} from "lucide-react";

function AdminRegister() {

    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState({
        name: "",
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

                await registerAdmin(
                    form
                );

                sessionStorage.setItem(
                    "verificationEmail",
                    form.email
                );

                toast.success(
                    "Admin verification OTP sent."
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
                        : "Admin registration failed."
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

                <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                        FoodShop
                    </p>

                    <h1 className="mt-2 text-3xl font-black">
                        Admin Registration
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
                            placeholder="Admin name"
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
                            placeholder="Admin email"
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

                        <div className="relative">

                            <input
                                required
                                type={
                                    showSecretKey
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Admin secret key"
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
                                className="w-full rounded-xl border px-4 py-3 pr-12"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowSecretKey(
                                        !showSecretKey
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
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
                            disabled={
                                loading
                            }
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                        >
                            {loading
                                ? "Creating..."
                                : "Create Admin"}
                        </button>

                    </form>

                    <Link
                        to="/admin/login"
                        className="mt-5 block text-center text-sm font-bold text-slate-500"
                    >
                        Already an admin? Login
                    </Link>

                </div>

            </div>

        </main>
    );
}

export default AdminRegister;