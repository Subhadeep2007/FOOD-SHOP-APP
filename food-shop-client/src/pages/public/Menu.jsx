import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search
} from "lucide-react";

import toast from "react-hot-toast";

import {
    useLocation,
    useNavigate,
    useSearchParams
} from "react-router";

import { useSelector } from "react-redux";

import FoodCard from "../../components/food/FoodCard";

import FoodFilters
    from "../../components/food/FoodFilters";

import {
    getFoods
} from "../../api/foodApi";

import {
    getCategories
} from "../../api/categoryApi";

import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../../api/favoriteApi";


const defaultFilters = {
    search: "",
    category: "",
    foodType: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest"
};


function Menu() {

    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    const [
        foods,
        setFoods
    ] = useState([]);


    const [
        categories,
        setCategories
    ] = useState([]);


    const [
        pagination,
        setPagination
    ] = useState({
        page: 1,
        pages: 1,
        total: 0
    });


    const [
        page,
        setPage
    ] = useState(1);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        filters,
        setFilters
    ] = useState({

        ...defaultFilters,

        search:
            searchParams.get(
                "search"
            ) || ""

    });


    const [
        favoriteIds,
        setFavoriteIds
    ] = useState([]);


    // ========================================
    // LOAD CATEGORIES
    // ========================================

    const loadCategories =
        async () => {

            try {

                const response =
                    await getCategories();


                const data =
                    response &&
                    response.data
                        ? response.data
                        : response;


                let list = [];


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    list =
                        data;

                } else if (
                    data &&
                    Array.isArray(
                        data.categories
                    )
                ) {

                    list =
                        data.categories;

                } else if (
                    data &&
                    Array.isArray(
                        data.data
                    )
                ) {

                    list =
                        data.data;

                }


                setCategories(
                    list
                );

            } catch (error) {

                setCategories([]);

            }
        };


    // ========================================
    // LOAD FAVORITES
    // ========================================

    const loadFavorites =
        async () => {

            if (!isAuthenticated) {
                setFavoriteIds([]);
                return;
            }

            try {

                const response =
                    await getFavorites();


                const data =
                    response &&
                    response.data
                        ? response.data
                        : response;


                let list = [];


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    list =
                        data;

                } else if (
                    data &&
                    Array.isArray(
                        data.favorites
                    )
                ) {

                    list =
                        data.favorites;

                } else if (
                    data &&
                    Array.isArray(
                        data.data
                    )
                ) {

                    list =
                        data.data;

                }


                const ids =
                    list
                        .map(
                            (item) => {

                                if (
                                    item &&
                                    item.food &&
                                    item.food._id
                                ) {

                                    return (
                                        item.food._id
                                    );
                                }


                                if (
                                    item &&
                                    item.food
                                ) {

                                    return (
                                        item.food
                                    );
                                }


                                if (
                                    item &&
                                    item._id
                                ) {

                                    return (
                                        item._id
                                    );
                                }


                                return "";
                            }
                        )
                        .filter(
                            Boolean
                        );


                setFavoriteIds(
                    ids
                );

            } catch (error) {

                setFavoriteIds([]);

            }
        };


    // ========================================
    // LOAD FOODS
    // ========================================

    const loadFoods =
        async (
            targetPage
        ) => {

            setLoading(
                true
            );

            try {

                const params = {

                    page:
                        targetPage,

                    limit:
                        12,

                    search:
                        filters.search ||
                        undefined,

                    category:
                        filters.category ||
                        undefined,

                    foodType:
                        filters.foodType ||
                        undefined,

                    minPrice:
                        filters.minPrice ||
                        undefined,

                    maxPrice:
                        filters.maxPrice ||
                        undefined,

                    sort:
                        filters.sort ||
                        "newest"

                };


                const response =
                    await getFoods(
                        params
                    );


                /*
                    Backend response:

                    {
                        success: true,
                        data: {
                            foods: [],
                            pagination: {}
                        }
                    }
                */

                const result =
                    response &&
                    response.data
                        ? response.data
                        : response;


                const list =
                    result &&
                    Array.isArray(
                        result.foods
                    )
                        ? result.foods
                        : [];


                setFoods(
                    list
                );


                setPagination(

                    result &&
                    result.pagination

                        ? result.pagination

                        : {
                            page:
                                targetPage,

                            pages:
                                1,

                            total:
                                list.length
                        }

                );

            } catch (error) {

                setFoods([]);

                toast.error(

                    error.response &&
                    error.response.data &&
                    error.response.data.message

                        ? error.response.data.message

                        : "Unable to load foods."

                );

            } finally {

                setLoading(
                    false
                );
            }
        };


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        loadCategories();

        if (isAuthenticated) loadFavorites();

    }, [isAuthenticated]);


    // ========================================
    // FOOD LOAD
    // ========================================

    useEffect(() => {

        loadFoods(
            page
        );

    }, [
        page,
        filters
    ]);


    // ========================================
    // UPDATE FILTERS
    // ========================================

    const updateFilters =
        (
            nextFilters
        ) => {

            setFilters(
                nextFilters
            );


            setPage(
                1
            );


            setSearchParams(

                nextFilters.search

                    ? {
                        search:
                            nextFilters.search
                    }

                    : {}

            );
        };


    // ========================================
    // TOGGLE FAVORITE
    // ========================================

    const toggleFavorite =
        async (
            foodId
        ) => {

            if (!isAuthenticated) {
                toast.error("Please login first to manage favorites.");
                navigate("/login", { state: { from: location } });
                return;
            }

            try {

                if (
                    favoriteIds.includes(
                        foodId
                    )
                ) {

                    await removeFavorite(
                        foodId
                    );


                    setFavoriteIds(
                        (current) =>
                            current.filter(
                                (id) =>
                                    id !==
                                    foodId
                            )
                    );


                    toast.success(
                        "Removed from favorites."
                    );

                } else {

                    await addFavorite(
                        foodId
                    );


                    setFavoriteIds(
                        (current) => [

                            ...current,

                            foodId

                        ]
                    );


                    toast.success(
                        "Added to favorites."
                    );
                }

            } catch (error) {

                toast.error(

                    error.response &&
                    error.response.data &&
                    error.response.data.message

                        ? error.response.data.message

                        : "Please login to manage favorites."

                );
            }
        };


    // ========================================
    // PAGE NUMBERS
    // ========================================

    const pageNumbers =
        useMemo(
            () => {

                const totalPages =
                    Number(
                        pagination.pages
                    ) || 1;


                const numbers = [];


                for (
                    let value = 1;

                    value <= totalPages;

                    value += 1
                ) {

                    if (
                        value === 1 ||
                        value === totalPages ||
                        Math.abs(
                            value -
                            page
                        ) <= 1
                    ) {

                        numbers.push(
                            value
                        );
                    }
                }


                return [
                    ...new Set(
                        numbers
                    )
                ];

            },
            [
                pagination.pages,
                page
            ]
        );


    return (

        <main className="min-h-screen bg-slate-50">

            {/* ========================================
                HEADER
            ======================================== */}

            <section className="border-b border-orange-100 bg-[radial-gradient(circle_at_top_right,_#ffedd5,_transparent_42%),#fff]">

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">

                        Food Menu

                    </p>


                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">

                        Find something delicious.

                    </h1>


                    <p className="mt-4 text-slate-600">

                        Search and explore the restaurant menu.

                    </p>


                    {/* SEARCH */}

                    <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-orange-200 bg-white/95 p-2 shadow-lg shadow-orange-950/5 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">

                        <Search
                            className="ml-2 text-slate-400"
                            size={20}
                        />


                        <input
                            value={
                                filters.search
                            }
                            onChange={(
                                event
                            ) =>
                                updateFilters({
                                    ...filters,

                                    search:
                                        event.target.value

                                })
                            }
                            placeholder="Search food..."
                            className="w-full bg-transparent px-2 py-3 outline-none"
                        />

                    </div>

                </div>

            </section>


            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* FILTERS */}

                <FoodFilters
                    filters={
                        filters
                    }
                    categories={
                        categories
                    }
                    onChange={
                        updateFilters
                    }
                    onReset={() =>
                        updateFilters(
                            defaultFilters
                        )
                    }
                />


                {/* RESULT COUNT */}

                <div className="mb-5 mt-8">

                    <p className="text-sm text-slate-500">

                        {pagination.total || 0}

                        {" "}

                        food item

                        {Number(
                            pagination.total
                        ) === 1
                            ? ""
                            : "s"}

                        {" "}found

                    </p>

                </div>


                {/* ========================================
                    LOADING
                ======================================== */}

                {loading ? (

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {Array.from(
                            {
                                length: 8
                            },
                            (
                                _,
                                index
                            ) => (

                                <div
                                    key={
                                        index
                                    }
                                    className="h-96 animate-pulse rounded-2xl bg-slate-200"
                                />

                            )
                        )}

                    </div>


                ) : foods.length === 0 ? (

                    /* ========================================
                        EMPTY
                    ======================================== */

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">

                        <h2 className="text-xl font-black text-slate-900">

                            No food found

                        </h2>


                        <p className="mt-2 text-slate-500">

                            Try changing the filters.

                        </p>

                    </div>


                ) : (

                    /* ========================================
                        FOOD GRID
                    ======================================== */

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {foods.map(
                            (food) => (

                                <FoodCard

                                    key={
                                        food._id
                                    }

                                    food={
                                        food
                                    }

                                    isFavorite={
                                        favoriteIds.includes(
                                            food._id
                                        )
                                    }

                                    onFavorite={
                                        toggleFavorite
                                    }

                                />

                            )
                        )}

                    </div>

                )}


                {/* ========================================
                    PAGINATION
                ======================================== */}

                {Number(
                    pagination.pages
                ) > 1 && (

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            disabled={
                                page <= 1
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        current -
                                        1
                                )
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
                        >

                            Previous

                        </button>


                        {/* PAGE NUMBERS */}

                        {pageNumbers.map(
                            (
                                number
                            ) => (

                                <button
                                    type="button"
                                    key={
                                        number
                                    }
                                    onClick={() =>
                                        setPage(
                                            number
                                        )
                                    }
                                    className={
                                        number ===
                                        page

                                            ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"

                                            : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold"
                                    }
                                >

                                    {
                                        number
                                    }

                                </button>

                            )
                        )}


                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={
                                page >=
                                Number(
                                    pagination.pages
                                )
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        current +
                                        1
                                )
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
                        >

                            Next

                        </button>

                    </div>

                )}

            </div>

        </main>

    );
}


export default Menu;
