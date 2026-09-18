import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ArrowLeft,
    Clock3,
    Heart,
    Minus,
    Plus
} from "lucide-react";

import toast from "react-hot-toast";

import {
    Link,
    useParams,
    useSearchParams
} from "react-router";

import {
    getFoodById
} from "../../api/foodApi";

import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../../api/favoriteApi";

import RatingStars from "../../components/food/RatingStars";

import ReviewSection from "../../components/review/ReviewSection";

import {
    getFinalPrice
} from "../../components/food/FoodCard";

import {
    useDispatch
} from "react-redux";

import {
    addToCart
} from "../../store/cartSlice";

function FoodDetails() {

    const dispatch =
        useDispatch();

    const {
        foodId
    } = useParams();

    const [
        searchParams
    ] = useSearchParams();

    const orderId =
        searchParams.get(
            "orderId"
        ) || "";

    const [
        food,
        setFood
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        isFavorite,
        setIsFavorite
    ] = useState(false);

    const [
        quantity,
        setQuantity
    ] = useState(1);

    useEffect(() => {

        const load =
            async () => {

                setLoading(
                    true
                );

                try {

                    const data =
                        await getFoodById(
                            foodId
                        );

                    setFood(
                        data.food ||
                        data.data ||
                        data
                    );

                } catch (error) {

                    toast.error(
                        "Unable to load food details."
                    );

                } finally {

                    setLoading(
                        false
                    );

                }
            };

        load();

    }, [foodId]);

    useEffect(() => {

        const loadFavorite =
            async () => {

                try {

                    const data =
                        await getFavorites();

                    const list =
                        Array.isArray(
                            data
                        )
                            ? data
                            : data.favorites ||
                              data.data ||
                              [];

                    const exists =
                        list.some(
                            (item) => {

                                const id =
                                    item.food &&
                                    item.food._id
                                        ? item.food._id
                                        : item.food;

                                return (
                                    String(
                                        id
                                    ) ===
                                    String(
                                        foodId
                                    )
                                );
                            }
                        );

                    setIsFavorite(
                        exists
                    );

                } catch (
                    error
                ) {

                    setIsFavorite(
                        false
                    );
                }
            };

        loadFavorite();

    }, [foodId]);

    const finalPrice =
        useMemo(() => {

            if (!food) {
                return 0;
            }

            return getFinalPrice(
                food
            );

        }, [food]);

    const toggleFavorite =
        async () => {

            try {

                if (
                    isFavorite
                ) {

                    await removeFavorite(
                        foodId
                    );

                    setIsFavorite(
                        false
                    );

                    toast.success(
                        "Removed from favorites."
                    );

                } else {

                    await addFavorite(
                        foodId
                    );

                    setIsFavorite(
                        true
                    );

                    toast.success(
                        "Added to favorites."
                    );
                }

            } catch (error) {

                toast.error(
                    "Please login to manage favorites."
                );
            }
        };

    const addFoodToCart =
        async () => {

            const result =
                await dispatch(
                    addToCart({
                        foodId,
                        quantity
                    })
                );

            if (
                result.meta.requestStatus ===
                "fulfilled"
            ) {

                toast.success(
                    "Added to cart."
                );

            } else {

                toast.error(
                    result.payload ||
                    "Please login to add food to your cart."
                );
            }
        };

    if (loading) {

        return (
            <main className="min-h-screen bg-slate-50 p-8">

                <div className="mx-auto max-w-7xl animate-pulse rounded-3xl bg-white p-8">

                    <div className="h-[28rem] rounded-2xl bg-slate-200" />

                </div>

            </main>
        );
    }

    if (!food) {

        return (
            <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">

                <h1 className="text-3xl font-black text-slate-900">
                    Food not found
                </h1>

                <Link
                    to="/menu"
                    className="mt-4 inline-flex font-bold text-slate-600"
                >
                    Back to menu
                </Link>

            </main>
        );
    }

    const images =
        food.images &&
        food.images.length > 0
            ? food.images
            : [
                "https://placehold.co/900x700?text=Food"
            ];

    const unavailable =
        food.isAvailable !== true ||
        Number(food.stock) <= 0;

    const maxQuantity =
        Number(food.stock) || 1;

    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <Link
                    to="/menu"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500"
                >
                    <ArrowLeft
                        size={16}
                    />
                    Back to menu
                </Link>

                <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">

                    <div className="bg-slate-100 p-4 md:p-6">

                        <div className="overflow-hidden rounded-2xl bg-slate-200">

                            <img
                                src={
                                    images[0]
                                }
                                alt={
                                    food.name
                                }
                                className="h-[24rem] w-full object-cover md:h-[34rem]"
                            />

                        </div>

                        {images.length >
                            1 && (

                            <div className="mt-4 grid grid-cols-4 gap-3">

                                {images
                                    .slice(
                                        0,
                                        4
                                    )
                                    .map(
                                        (
                                            image,
                                            index
                                        ) => (
                                            <img
                                                key={
                                                    index
                                                }
                                                src={
                                                    image
                                                }
                                                alt={
                                                    food.name +
                                                    " " +
                                                    (
                                                        index +
                                                        1
                                                    )
                                                }
                                                className="h-20 w-full rounded-xl object-cover"
                                            />
                                        )
                                    )}

                            </div>
                        )}

                    </div>

                    <div className="flex flex-col p-6 md:p-10">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                    {food.category &&
                                    food.category.name
                                        ? food.category.name
                                        : "Food"}
                                </p>

                                <h1 className="mt-2 text-4xl font-black text-slate-900">
                                    {
                                        food.name
                                    }
                                </h1>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    toggleFavorite
                                }
                                className="rounded-full border border-slate-200 p-3"
                            >
                                <Heart
                                    className={
                                        isFavorite
                                            ? "fill-red-500 text-red-500"
                                            : "text-slate-700"
                                    }
                                    size={22}
                                />
                            </button>

                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">

                            <div className="flex items-center gap-2">

                                <RatingStars
                                    rating={
                                        food.rating
                                    }
                                />

                                <span className="font-bold">
                                    {Number(
                                        food.rating ||
                                        0
                                    ).toFixed(
                                        1
                                    )}
                                </span>

                                <span className="text-sm text-slate-400">
                                    (
                                    {
                                        food.reviewCount ||
                                        0
                                    }
                                    )
                                </span>

                            </div>

                            <span className="rounded-full border px-3 py-1 text-xs font-bold uppercase">
                                {
                                    food.foodType
                                }
                            </span>

                        </div>

                        <p className="mt-6 text-base leading-7 text-slate-600">
                            {
                                food.description
                            }
                        </p>

                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">

                            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-semibold">

                                <Clock3
                                    size={16}
                                />

                                {
                                    food.preparationTime
                                }{" "}
                                min

                            </span>

                            <span className="rounded-xl bg-slate-50 px-3 py-2 font-semibold">
                                Stock:{" "}
                                {
                                    food.stock
                                }
                            </span>

                        </div>

                        {food.ingredients &&
                            food.ingredients.length >
                            0 && (

                            <div className="mt-6">

                                <h2 className="font-black text-slate-900">
                                    Ingredients
                                </h2>

                                <div className="mt-3 flex flex-wrap gap-2">

                                    {food.ingredients.map(
                                        (
                                            ingredient,
                                            index
                                        ) => (
                                            <span
                                                key={
                                                    index
                                                }
                                                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                                            >
                                                {
                                                    ingredient
                                                }
                                            </span>
                                        )
                                    )}

                                </div>

                            </div>
                        )}

                        <div className="mt-auto pt-8">

                            <div className="flex items-end gap-3">

                                <span className="text-4xl font-black text-slate-900">
                                    ₹
                                    {
                                        finalPrice
                                    }
                                </span>

                                {food.discountPercentage >
                                    0 && (

                                    <span className="text-base text-slate-400 line-through">
                                        ₹
                                        {Number(
                                            food.price ||
                                            0
                                        ).toFixed(
                                            2
                                        )}
                                    </span>
                                )}

                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">

                                <div className="inline-flex items-center rounded-xl border border-slate-300">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    current
                                                ) =>
                                                    Math.max(
                                                        1,
                                                        current -
                                                        1
                                                    )
                                            )
                                        }
                                        className="p-3"
                                    >
                                        <Minus
                                            size={
                                                16
                                            }
                                        />
                                    </button>

                                    <span className="min-w-10 text-center font-bold">
                                        {
                                            quantity
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            unavailable ||
                                            quantity >=
                                            maxQuantity
                                        }
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    current
                                                ) =>
                                                    Math.min(
                                                        maxQuantity,
                                                        current +
                                                        1
                                                    )
                                            )
                                        }
                                        className="p-3 disabled:opacity-40"
                                    >
                                        <Plus
                                            size={
                                                16
                                            }
                                        />
                                    </button>

                                </div>

                                <button
                                    type="button"
                                    disabled={
                                        unavailable
                                    }
                                    onClick={
                                        addFoodToCart
                                    }
                                    className="flex-1 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {unavailable
                                        ? "Out of Stock"
                                        : "Add to Cart"}
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

                <ReviewSection
                    foodId={
                        foodId
                    }
                    orderId={
                        orderId
                    }
                />

            </div>
        </main>
    );
}

export default FoodDetails;
