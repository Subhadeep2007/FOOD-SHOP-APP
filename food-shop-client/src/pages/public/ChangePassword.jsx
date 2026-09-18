import {
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    useDispatch
} from "react-redux";

import {
    changePassword
} from "../../api/authApi";

import {
    logout
} from "../../store/authSlice";

function ChangePassword() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState({
        currentPassword: "",
        newPassword: ""
    });

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

                await changePassword(
                    form
                );

                dispatch(
                    logout()
                );

                toast.success(
                    "Password changed. Please login again."
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
                        : "Unable to change password."
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
                    Change password
                </h1>

                <form
                    onSubmit={
                        submit
                    }
                    className="mt-7 space-y-4"
                >

                    <input
                        required
                        minLength="8"
                        type="password"
                        placeholder="Current password"
                        value={
                            form.currentPassword
                        }
                        onChange={(
                            event
                        ) =>
                            setForm({
                                ...form,
                                currentPassword:
                                    event.target.value
                            })
                        }
                        className="w-full rounded-xl border px-4 py-3"
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
                            ? "Changing..."
                            : "Change Password"}
                    </button>

                </form>

            </div>

        </main>
    );
}

export default ChangePassword;