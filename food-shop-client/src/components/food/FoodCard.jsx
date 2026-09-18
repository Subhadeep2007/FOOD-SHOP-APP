import {
    Heart,
    ShoppingCart
} from "lucide-react";

import { Link } from "react-router";

import RatingStars from "./RatingStars";

const getFinalPrice = (
    food
) => {
    const price =
        Number(food.price) || 0;

    const discount =
        Number(
            food.discountPercentage
        ) || 0;

    return Number(
        (
            price -
            (price * discount) / 100
        ).toFixed(2)
    );
};

function FoodCard({
    food,
    isFavorite,
    onFavorite
}) {
    const image =
        food.images &&
        food.images.length > 0
            ? food.images[0]
            : "https://placehold.co/600x500?text=Food";

    const finalPrice =
        getFinalPrice(food);

    const isUnavailable =
        food.isAvailable !== true ||
        Number(food.stock) <= 0;

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="relative h-56 overflow-hidden bg-slate-100">

                <img
                    src={image}
                    alt={food.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {food.discountPercentage > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        {food.discountPercentage}% OFF
                    </span>
                )}

                <button
                    type="button"
                    onClick={() =>
                        onFavorite(food._id)
                    }
                    className="absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow"
                >
                    <Heart
                        size={18}
                        className={
                            isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-slate-700"
                        }
                    />
                </button>

                {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">

                <div className="mb-2 flex items-start justify-between gap-3">

                    <div>
                        <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                            {food.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                            {food.category &&
                            food.category.name
                                ? food.category.name
                                : "Food"}
                        </p>
                    </div>

                    <span className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                        {food.foodType}
                    </span>

                </div>

                <p className="mb-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                    {food.description}
                </p>

                <div className="mb-4 flex items-center gap-2">

                    <RatingStars
                        rating={food.rating}
                    />

                    <span className="text-sm font-semibold text-slate-700">
                        {Number(
                            food.rating || 0
                        ).toFixed(1)}
                    </span>

                    <span className="text-sm text-slate-400">
                        ({food.reviewCount || 0})
                    </span>

                </div>

                <div className="mb-4 flex items-end gap-2">

                    <span className="text-2xl font-black text-slate-900">
                        ₹{finalPrice}
                    </span>

                    {food.discountPercentage > 0 && (
                        <span className="pb-0.5 text-sm text-slate-400 line-through">
                            ₹
                            {Number(
                                food.price || 0
                            ).toFixed(2)}
                        </span>
                    )}

                </div>

                <div className="flex gap-2">

                    <Link
                        to={
                            "/foods/" +
                            food._id
                        }
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-bold text-slate-800"
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        disabled={isUnavailable}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <ShoppingCart
                            size={16}
                        />
                        Add
                    </button>

                </div>
            </div>
        </article>
    );
}

export {
    getFinalPrice
};

export default FoodCard;