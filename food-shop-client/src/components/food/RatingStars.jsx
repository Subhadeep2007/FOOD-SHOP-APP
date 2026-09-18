import { Star } from "lucide-react";

function RatingStars({
    rating = 0,
    size = 16
}) {
    const rounded =
        Math.round(
            Number(rating) || 0
        );

    return (
        <div
            className="flex items-center gap-0.5"
            aria-label={
                "Rating " +
                rating +
                " out of 5"
            }
        >
            {Array.from(
                { length: 5 },
                (_, index) => {
                    const value =
                        index + 1;

                    return (
                        <Star
                            key={value}
                            size={size}
                            className={
                                value <= rounded
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                            }
                        />
                    );
                }
            )}
        </div>
    );
}

export default RatingStars;