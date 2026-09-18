import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import {
    useDispatch,
    useSelector
} from "react-redux";

import toast from "react-hot-toast";

import {
    logoutUser,
    logoutAllSessions,
    updateProfileImage
} from "../../api/authApi";

import {
    logout,
    setUser
} from "../../store/authSlice";

function Account() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();

    const {
        user
    } = useSelector(
        (state) =>
            state.auth
    );

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        selectedImage,
        setSelectedImage
    ] = useState(null);

    const [
        previewImage,
        setPreviewImage
    ] = useState("");

    const [
        uploadingImage,
        setUploadingImage
    ] = useState(false);

    const handleLogout =
        async () => {

            setLoading(
                true
            );

            try {

                await logoutUser();

            } catch {
                // Frontend logout should still continue.
            } finally {

                dispatch(
                    logout()
                );

                setLoading(
                    false
                );

                navigate(
                    loginPath
                );

            }
        };

    const chooseProfileImage =
        (event) => {

            const file =
                event.target.files &&
                event.target.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                toast.error("Please choose an image file.");
                event.target.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error("Profile image must be 5 MB or smaller.");
                event.target.value = "";
                return;
            }

            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
        };

    const uploadProfileImage =
        async () => {

            if (!selectedImage) {
                toast.error("Choose an image first.");
                return;
            }

            setUploadingImage(true);

            try {

                const response =
                    await updateProfileImage(selectedImage);

                const data =
                    response && response.data
                        ? response.data
                        : response;

                const updatedUser =
                    data && data.user
                        ? data.user
                        : null;

                if (!updatedUser) {
                    throw new Error("Profile image response is invalid.");
                }

                dispatch(setUser(updatedUser));
                setSelectedImage(null);
                setPreviewImage("");
                toast.success("Profile image updated.");

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to upload profile image."
                );

            } finally {

                setUploadingImage(false);
            }
        };

    const handleLogoutAll =
        async () => {

            setLoading(
                true
            );

            try {

                await logoutAllSessions();

            } catch {
                // Continue logout.
            } finally {

                dispatch(
                    logout()
                );

                setLoading(
                    false
                );

                toast.success(
                    "All sessions logged out."
                );

                navigate(
                    loginPath
                );

            }
        };

    const profileImage =
        user &&
        user.profileImage
            ? user.profileImage
            : "https://placehold.co/160x160?text=User";

    const loginPath =
        user &&
        user.role === "admin"
            ? "/admin/login"
            : "/login";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">

            <div className="mx-auto max-w-4xl">

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

                    <div className="flex flex-col items-center gap-5 sm:flex-row">

                        <img
                            src={
                                previewImage ||
                                profileImage
                            }
                            alt={
                                user &&
                                user.name
                                    ? user.name
                                    : "User"
                            }
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-slate-100"
                        />

                        <div>

                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                My Account
                            </p>

                            <h1 className="mt-1 text-3xl font-black text-slate-900">
                                {
                                    user &&
                                    user.name
                                        ? user.name
                                        : "User"
                                }
                            </h1>

                            <p className="mt-1 text-slate-500">
                                {
                                    user &&
                                    user.email
                                        ? user.email
                                        : "-"
                                }
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                        <p className="font-bold text-slate-900">
                            Profile image
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            JPG, PNG, WEBP, or GIF up to 5 MB.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">

                            <input
                                type="file"
                                accept="image/*"
                                onChange={chooseProfileImage}
                                className="max-w-full text-sm"
                            />

                            <button
                                type="button"
                                disabled={
                                    !selectedImage ||
                                    uploadingImage
                                }
                                onClick={uploadProfileImage}
                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploadingImage
                                    ? "Uploading..."
                                    : "Upload image"}
                            </button>

                        </div>

                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">

                        <div className="rounded-2xl bg-slate-50 p-4">

                            <p className="text-xs font-bold uppercase text-slate-400">
                                Role
                            </p>

                            <p className="mt-1 font-bold">
                                {
                                    user &&
                                    user.role
                                        ? user.role
                                        : "-"
                                }
                            </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">

                            <p className="text-xs font-bold uppercase text-slate-400">
                                Email verification
                            </p>

                            <p className="mt-1 font-bold">
                                {
                                    user &&
                                    user.isEmailVerified
                                        ? "Verified"
                                        : "Not Verified"
                                }
                            </p>

                        </div>

                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">

                        <Link
                            to="/orders"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            My Orders
                        </Link>

                        <Link
                            to="/addresses"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            My Addresses
                        </Link>

                        <Link
                            to="/cart"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            My Cart
                        </Link>

                        <Link
                            to="/change-password"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            Change Password
                        </Link>

                        <Link
                            to="/favorites"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            My Favorites
                        </Link>

                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <button
                            type="button"
                            disabled={
                                loading
                            }
                            onClick={
                                handleLogout
                            }
                            className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50"
                        >
                            Logout
                        </button>

                        <button
                            type="button"
                            disabled={
                                loading
                            }
                            onClick={
                                handleLogoutAll
                            }
                            className="rounded-xl border border-red-200 px-4 py-3 font-bold text-red-600 disabled:opacity-50"
                        >
                            Logout All Sessions
                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Account;
