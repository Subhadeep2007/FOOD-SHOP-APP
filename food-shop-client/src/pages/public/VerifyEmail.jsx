import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    resendVerificationOTP,
    verifyEmail
} from "../../api/authApi";

function VerifyEmail() {

    const navigate =
        useNavigate();

    const [
        email,
        setEmail
    ] = useState("");

    const [
        otp,
        setOtp
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        resendLoading,
        setResendLoading
    ] = useState(false);

    useEffect(() => {

        const savedEmail =
            sessionStorage.getItem(
                "verificationEmail"
            );

        if (savedEmail) {

            setEmail(
                savedEmail
            );
        }

    }, []);

    const verify =
        async (
            event
        ) => {

            event.preventDefault();

            setLoading(
                true
            );

            try {

                await verifyEmail({
                    email,
                    otp
                });

                sessionStorage.removeItem(
                    "verificationEmail"
                );

                toast.success(
                    "Email verified successfully."
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
                        : "Verification failed."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    const resend =
        async () => {

            if (!email) {

                toast.error(
                    "Enter your email."
                );

                return;
            }

            setResendLoading(
                true
            );

            try {

                await resendVerificationOTP(
                    email
                );

                toast.success(
                    "New OTP sent."
                );

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to resend OTP."
                );

            } finally {

                setResendLoading(
                    false
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-12">

            <div className="mx-auto max-w-md">

                <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">

                    <h1 className="text-3xl font-black">
                        Verify email
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Enter the OTP sent to your email.
                    </p>

                    <form
                        onSubmit={
                            verify
                        }
                        className="mt-7 space-y-4"
                    >

                        <input
                            required
                            type="email"
                            placeholder="Email"
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
                            className="w-full rounded-xl border px-4 py-3"
                        />

                        <input
                            required
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="6 digit OTP"
                            value={
                                otp
                            }
                            onChange={(
                                event
                            ) =>
                                setOtp(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border px-4 py-3 text-center text-xl font-black tracking-[0.4em]"
                        />

                        <button
                            disabled={
                                loading
                            }
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60"
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify Email"}
                        </button>

                    </form>

                    <button
                        type="button"
                        onClick={
                            resend
                        }
                        disabled={
                            resendLoading
                        }
                        className="mt-4 w-full rounded-xl border px-4 py-3 font-bold"
                    >
                        {resendLoading
                            ? "Sending..."
                            : "Resend OTP"}
                    </button>

                    <Link
                        to="/register"
                        className="mt-4 block text-center text-sm font-semibold text-slate-500"
                    >
                        Back to registration
                    </Link>

                </div>

            </div>

        </main>
    );
}

export default VerifyEmail;