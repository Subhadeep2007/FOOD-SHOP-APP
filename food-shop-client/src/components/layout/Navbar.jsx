import {
    Heart,
    Bell,
    Menu as MenuIcon,
    Search,
    ShoppingCart,
    UserCircle,
    X
} from "lucide-react";

import {
    useState
} from "react";

import {
    Link,
    NavLink,
    useNavigate
} from "react-router";

import {
    useSelector
} from "react-redux";

import {
    useDispatch
} from "react-redux";

import {
    useEffect
} from "react";

import {
    fetchCart
} from "../../store/cartSlice";

function Navbar() {

    const dispatch =
        useDispatch();

    const [
        open,
        setOpen
    ] = useState(false);

    const [
        search,
        setSearch
    ] = useState("");

    const navigate =
        useNavigate();

    const {
        user,
        isAuthenticated
    } = useSelector(
        (state) =>
            state.auth
    );

    const cart =
        useSelector(
            (state) =>
                state.cart.cart
        );

    const cartCount =
        cart &&
        Array.isArray(cart.items)
            ? cart.items.reduce(
                (total, item) =>
                    total + (Number(item.quantity) || 0),
                0
            )
            : 0;

    useEffect(() => {

        if (isAuthenticated) {

            dispatch(fetchCart());
        }

    }, [dispatch, isAuthenticated]);

    const profileImage =
        user &&
        user.profileImage
            ? user.profileImage
            : "";

    const profileName =
        user &&
        user.name
            ? user.name
            : "Account";

    const submitSearch =
        (event) => {

            event.preventDefault();

            navigate(
                search.trim()
                    ? "/menu?search=" +
                      encodeURIComponent(
                          search.trim()
                      )
                    : "/menu"
            );

            setOpen(false);
        };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">

                {/* LOGO */}

                <Link
                    to="/"
                    className="shrink-0 text-xl font-black text-slate-900"
                >
                    FoodShop
                </Link>


                {/* DESKTOP NAV */}

                <nav className="hidden items-center gap-6 lg:flex">

                    <NavLink
                        to="/"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/menu"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        Menu
                    </NavLink>

                    <NavLink
                        to="/favorites"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        Favorites
                    </NavLink>

                    {isAuthenticated && user && user.role !== "admin" ? (

                        <NavLink
                            to="/orders"
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            My Orders
                        </NavLink>

                    ) : null}

                </nav>


                {/* SEARCH */}

                <form
                    onSubmit={
                        submitSearch
                    }
                    className="ml-auto hidden max-w-md flex-1 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 md:flex"
                >

                    <Search
                        size={18}
                        className="text-slate-400"
                    />

                    <input
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search food..."
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                    />

                </form>


                {/* RIGHT ACTIONS */}

                <div className="ml-auto flex items-center gap-1 md:ml-0">

                    {/* FAVORITES */}

                    <Link
                        to="/favorites"
                        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
                        title="Favorites"
                    >
                        <Heart
                            size={20}
                        />
                    </Link>


                    {/* CART */}

                    {isAuthenticated && (

                        <Link
                            to="/notifications"
                            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
                            title="Notifications"
                        >
                            <Bell
                                size={20}
                            />
                        </Link>
                    )}

                    <Link
                        to="/cart"
                        className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100"
                        title="Cart"
                    >
                        <ShoppingCart
                            size={20}
                        />

                        {cartCount > 0 && (

                            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-slate-900 px-1 text-center text-xs font-bold leading-5 text-white">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>


                    {/* ACCOUNT / PROFILE */}

                    <Link
                        to={
                            isAuthenticated
                                ? "/account"
                                : "/login"
                        }
                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                        title={
                            isAuthenticated
                                ? profileName
                                : "Login"
                        }
                    >

                        {profileImage ? (

                            <img
                                src={
                                    profileImage
                                }
                                alt={
                                    profileName
                                }
                                className="h-full w-full object-cover"
                            />

                        ) : (

                            <UserCircle
                                size={22}
                            />

                        )}

                    </Link>


                    {/* MOBILE MENU */}

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(
                                (
                                    current
                                ) =>
                                    !current
                            )
                        }
                        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        title="Menu"
                    >

                        {open
                            ? (
                                <X
                                    size={21}
                                />
                            )
                            : (
                                <MenuIcon
                                    size={21}
                                />
                            )}

                    </button>

                </div>

            </div>


            {/* MOBILE MENU */}

            {open && (

                <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">

                    {/* MOBILE SEARCH */}

                    <form
                        onSubmit={
                            submitSearch
                        }
                        className="mb-4 flex items-center rounded-xl border border-slate-300 px-3"
                    >

                        <Search
                            size={18}
                            className="text-slate-400"
                        />

                        <input
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search food..."
                            className="w-full bg-transparent px-2 py-3 outline-none"
                        />

                    </form>


                    <div className="grid gap-2">

                        {/* HOME */}

                        <Link
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            to="/"
                            className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                        >
                            Home
                        </Link>


                        {/* MENU */}

                        <Link
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            to="/menu"
                            className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                        >
                            Menu
                        </Link>


                        {/* FAVORITES */}

                        <Link
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            to="/favorites"
                            className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                        >
                            Favorites
                        </Link>

                        <Link
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            to="/cart"
                            className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                        >
                            Cart
                        </Link>


                        {/* ACCOUNT */}

                        <Link
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            to={
                                isAuthenticated
                                    ? "/account"
                                    : "/login"
                            }
                            className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                        >

                            {profileImage ? (

                                <img
                                    src={
                                        profileImage
                                    }
                                    alt={
                                        profileName
                                    }
                                    className="h-9 w-9 rounded-full object-cover"
                                />

                            ) : (

                                <UserCircle
                                    size={22}
                                />

                            )}

                            <span>
                                {isAuthenticated
                                    ? "My Account"
                                    : "Login"}
                            </span>

                        </Link>

                    </div>

                </div>
            )}

        </header>
    );
}

export default Navbar;
