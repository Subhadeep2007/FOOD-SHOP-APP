import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    resetPassword
} from "../../api/authApi";

function ResetPassword() {

    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState({
        email: "",
        otp: "",
        newPassword: ""
    });

    const [
        loading,
        setLoading
    ] = useState(false);

    useEffect(() => {

        const email =
            sessionStorage.getItem(
                "resetEmail"
            );

        if (email) {

            setForm(
                (current) => ({
                    ...current,
                    email
                })
            );
        }

    }, []);

    const submit =
        async (
            event
        ) => {

            event.preventDefault();

            setLoading(
                true
            );

            try {

                await resetPassword(
                    form
                );

                sessionStorage.removeItem(
                    "resetEmail"
                );

                toast.success(
                    "Password reset successfully."
                );

                navigate(
                    "/login"
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to reset password."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-12">

            <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm md:p-8">

                <h1 className="text-3xl font-black">
                    Reset password
                </h1>

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
                        className="w-full rounded-xl border px-4 py-3"
                    />

                    <input
                        required
                        maxLength="6"
                        placeholder="OTP"
                        value={
                            form.otp
                        }
                        onChange={(
                            event
                        ) =>
                            setForm({
                                ...form,
                                otp:
                                    event.target.value
                            })
                        }
                        className="w-full rounded-xl border px-4 py-3 text-center font-bold tracking-[0.35em]"
                    />

                    <input
                        required
                        minLength="8"
                        type="password"
                        placeholder="New password"
                        value={
                            form.newPassword
                        }
                        onChange={(
                            event
                        ) =>
                            setForm({
                                ...form,
                                newPassword:
                                    event.target.value
                            })
                        }
                        className="w-full rounded-xl border px-4 py-3"
                    />

                    <button
                        disabled={
                            loading
                        }
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>

                </form>

            </div>

        </main>
    );
}

export default ResetPassword;