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
    updateProfileImage,
    updateShopLocation
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

    const [shopLocation, setShopLocation] = useState({ name: "", address: "", phone: "", latitude: "", longitude: "" });
    const [savingLocation, setSavingLocation] = useState(false);

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

    const isAdmin =
        Boolean(user && user.role === "admin");

    const saveShopLocation = async(event) => {
        event.preventDefault();
        setSavingLocation(true);
        try {
            await updateShopLocation(shopLocation);
            toast.success("Shop location saved. It is now visible on the home page.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save shop location.");
        } finally {
            setSavingLocation(false);
        }
    };

    const useCurrentShopLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Location is not supported by this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setShopLocation({
                    ...shopLocation,
                    latitude: String(position.coords.latitude),
                    longitude: String(position.coords.longitude)
                });
                toast.success("Current shop location captured.");
            },
            () => toast.error("Allow location permission to capture the shop location."),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

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
                                {isAdmin ? "Admin Account" : "My Account"}
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

                    {isAdmin ? (
                        <form onSubmit={saveShopLocation} className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                            <h2 className="font-black text-slate-900">Shop location</h2>
                            <p className="mt-1 text-sm text-slate-600">This exact location is shown to customers on the home page.</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <input required value={shopLocation.name} onChange={(event) => setShopLocation({ ...shopLocation, name: event.target.value })} placeholder="Shop name" className="rounded-xl border bg-white p-3" />
                                <input required value={shopLocation.address} onChange={(event) => setShopLocation({ ...shopLocation, address: event.target.value })} placeholder="Full shop address" className="rounded-xl border bg-white p-3" />
                                <input required value={shopLocation.phone} onChange={(event) => setShopLocation({ ...shopLocation, phone: event.target.value })} placeholder="Shop contact number" className="rounded-xl border bg-white p-3" />
                                <input required type="number" step="any" value={shopLocation.latitude} onChange={(event) => setShopLocation({ ...shopLocation, latitude: event.target.value })} placeholder="Latitude" className="rounded-xl border bg-white p-3" />
                                <input required type="number" step="any" value={shopLocation.longitude} onChange={(event) => setShopLocation({ ...shopLocation, longitude: event.target.value })} placeholder="Longitude" className="rounded-xl border bg-white p-3" />
                            </div>
                            <button type="button" onClick={useCurrentShopLocation} className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold">Use current shop location</button>
                            <button disabled={savingLocation} className="mt-4 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50">{savingLocation ? "Saving..." : "Save shop location"}</button>
                        </form>
                    ) : null}

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

                        {isAdmin ? (
                            <Link
                                to="/admin"
                                className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                            >
                                Admin Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/orders" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold">My Orders</Link>
                                <Link to="/refunds" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold">My Refunds</Link>
                                <Link to="/addresses" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold">My Addresses</Link>
                                <Link to="/cart" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold">My Cart</Link>
                            </>
                        )}

                        <Link
                            to="/change-password"
                            className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold"
                        >
                            Change Password
                        </Link>

                        {!isAdmin ? (
                            <Link to="/favorites" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold">My Favorites</Link>
                        ) : null}

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
