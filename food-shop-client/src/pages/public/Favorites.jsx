import {
    useEffect,
    useState
} from "react";

import {
    Heart
} from "lucide-react";

import toast from "react-hot-toast";

import {
    useSelector
} from "react-redux";

import FoodCard from "../../components/food/FoodCard";

import {
    getFavorites,
    removeFavorite
} from "../../api/favoriteApi";

function Favorites() {

    const [
        foods,
        setFoods
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const {
        isAuthenticated
    } = useSelector(
        (state) =>
            state.auth
    );

    const load =
        async () => {

            setLoading(
                true
            );

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

                const foodList =
                    list
                        .map(
                            (item) => {

                                if (
                                    item &&
                                    item.food
                                ) {

                                    return item.food;
                                }

                                return item;
                            }
                        )
                        .filter(
                            Boolean
                        );

                setFoods(
                    foodList
                );

            } catch (error) {

                setFoods([]);

                const message =
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to load favorites.";

                toast.error(
                    message
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    useEffect(() => {

        if (
            isAuthenticated
        ) {

            load();

        } else {

            setFoods([]);

            setLoading(
                false
            );

        }

    }, [
        isAuthenticated
    ]);

    const remove =
        async (
            foodId
        ) => {

            try {

                await removeFavorite(
                    foodId
                );

                setFoods(
                    (current) =>
                        current.filter(
                            (food) =>
                                food &&
                                food._id !==
                                foodId
                        )
                );

                toast.success(
                    "Removed from favorites."
                );

            } catch (error) {

                const message =
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to remove favorite.";

                toast.error(
                    message
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <div className="mb-8 flex items-center gap-3">

                    <div className="rounded-2xl bg-red-50 p-3">

                        <Heart
                            className="fill-red-500 text-red-500"
                        />

                    </div>

                    <div>

                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                            Saved food
                        </p>

                        <h1 className="text-3xl font-black text-slate-900">
                            My Favorites
                        </h1>

                    </div>

                </div>

                {!isAuthenticated ? (

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">

                        <h2 className="text-xl font-black text-slate-900">
                            Please login first
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Login to view your saved food items.
                        </p>

                    </div>

                ) : loading ? (

                    <p className="text-slate-500">
                        Loading favorites...
                    </p>

                ) : foods.length === 0 ? (

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">

                        <h2 className="text-xl font-black text-slate-900">
                            No favorites yet
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Save food items you love.
                        </p>

                    </div>

                ) : (

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
                                        true
                                    }
                                    onFavorite={
                                        remove
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </div>

        </main>
    );
}

export default Favorites;