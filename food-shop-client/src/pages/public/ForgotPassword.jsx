import {
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    forgotPassword
} from "../../api/authApi";

function ForgotPassword() {

    const navigate =
        useNavigate();

    const [
        email,
        setEmail
    ] = useState("");

    const [
        loading,
        setLoading
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

                await forgotPassword(
                    email
                );

                sessionStorage.setItem(
                    "resetEmail",
                    email
                );

                toast.success(
                    "Password reset OTP sent."
                );

                navigate(
                    "/reset-password"
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to send OTP."
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
                    Forgot password
                </h1>

                <p className="mt-2 text-slate-500">
                    Enter your account email.
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
                            email
                        }
                        onChange={(
                            event
                        ) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="Email"
                        className="w-full rounded-xl border px-4 py-3"
                    />

                    <button
                        disabled={
                            loading
                        }
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                    >
                        {loading
                            ? "Sending..."
                            : "Send OTP"}
                    </button>

                </form>

            </div>

        </main>
    );
}

export default ForgotPassword;