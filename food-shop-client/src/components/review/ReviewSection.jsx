import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Pencil,
    Trash2
} from "lucide-react";

import toast from "react-hot-toast";

import RatingStars from "../food/RatingStars";

import {
    createReview,
    deleteOwnReview,
    getFoodReviews,
    updateOwnReview
} from "../../api/reviewApi";

import {
    getCurrentUserId
} from "../../utils/auth";

function ReviewSection({
    foodId,
    orderId = ""
}) {

    const [
        reviews,
        setReviews
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        editingId,
        setEditingId
    ] = useState("");

    const [
        rating,
        setRating
    ] = useState(5);

    const [
        comment,
        setComment
    ] = useState("");

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    const currentUserId =
        useMemo(
            () =>
                getCurrentUserId(),
            []
        );

    const loadReviews =
        async () => {

            setLoading(true);

            try {

                const data =
                    await getFoodReviews(
                        foodId
                    );

                const list =
                    Array.isArray(data)
                        ? data
                        : data.reviews ||
                          data.data ||
                          [];

                setReviews(list);

            } catch (error) {

                setReviews([]);

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {

        loadReviews();

    }, [foodId]);

    const startEdit =
        (review) => {

            setEditingId(
                review._id
            );

            setRating(
                review.rating
            );

            setComment(
                review.comment || ""
            );
        };

    const cancelEdit =
        () => {

            setEditingId("");
            setRating(5);
            setComment("");

        };

    const saveReview =
        async (event) => {

            event.preventDefault();

            if (
                comment.length >
                1000
            ) {

                toast.error(
                    "Comment cannot be longer than 1000 characters."
                );

                return;
            }

            setSubmitting(true);

            try {

                if (editingId) {

                    await updateOwnReview(
                        editingId,
                        {
                            rating,
                            comment
                        }
                    );

                    toast.success(
                        "Review updated successfully."
                    );

                } else {

                    const reviewData = {
                        foodId,
                        rating,
                        comment
                    };

                    if (orderId) {
                        reviewData.orderId = orderId;
                    }

                    await createReview(reviewData);

                    toast.success(
                        "Review added successfully."
                    );
                }

                cancelEdit();

                await loadReviews();

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to save review."
                );

            } finally {

                setSubmitting(
                    false
                );

            }
        };

    const removeReview =
        async (
            reviewId
        ) => {

            const confirmed =
                window.confirm(
                    "Delete your review?"
                );

            if (!confirmed) {
                return;
            }

            try {

                await deleteOwnReview(
                    reviewId
                );

                toast.success(
                    "Review deleted successfully."
                );

                await loadReviews();

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to delete review."
                );
            }
        };

    return (
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

            <div className="mb-6 flex items-end justify-between gap-4">

                <div>

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                        Customer feedback
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                        Reviews
                    </h2>

                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                    {reviews.length}{" "}
                    review
                    {reviews.length === 1
                        ? ""
                        : "s"}
                </div>

            </div>

            {editingId && (

                <form
                    onSubmit={
                        saveReview
                    }
                    className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >

                    <h3 className="mb-4 font-bold text-slate-900">
                        Edit your review
                    </h3>

                    <div className="mb-4 flex items-center gap-1">

                        {Array.from(
                            {
                                length: 5
                            },
                            (_, index) => {

                                const value =
                                    index +
                                    1;

                                return (
                                    <button
                                        type="button"
                                        key={
                                            value
                                        }
                                        onClick={() =>
                                            setRating(
                                                value
                                            )
                                        }
                                        className="rounded-md p-1 text-xl"
                                    >
                                        <span
                                            className={
                                                value <=
                                                rating
                                                    ? "text-yellow-400"
                                                    : "text-slate-300"
                                            }
                                        >
                                            ★
                                        </span>
                                    </button>
                                );
                            }
                        )}

                    </div>

                    <textarea
                        value={
                            comment
                        }
                        onChange={(
                            event
                        ) =>
                            setComment(
                                event.target.value
                            )
                        }
                        rows={4}
                        maxLength={1000}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none"
                        placeholder="Write your review"
                    />

                    <div className="mt-3 flex gap-2">

                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {submitting
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            onClick={
                                cancelEdit
                            }
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"
                        >
                            Cancel
                        </button>

                    </div>

                </form>
            )}

            {loading ? (

                <p className="py-6 text-slate-500">
                    Loading reviews...
                </p>

            ) : reviews.length ===
              0 ? (

                <p className="py-6 text-slate-500">
                    No reviews yet.
                </p>

            ) : (

                <div className="space-y-4">

                    {reviews.map(
                        (review) => {

                            const reviewUserId =
                                review.user &&
                                review.user._id
                                    ? review.user._id
                                    : review.user;

                            const isOwn =
                                Boolean(
                                    currentUserId &&
                                    reviewUserId &&
                                    String(
                                        currentUserId
                                    ) ===
                                    String(
                                        reviewUserId
                                    )
                                );

                            const avatar =
                                review.user &&
                                review.user.profileImage
                                    ? review.user.profileImage
                                    : "https://placehold.co/80x80?text=U";

                            const reviewerName =
                                review.user &&
                                review.user.name
                                    ? review.user.name
                                    : "Customer";

                            return (
                                <article
                                    key={
                                        review._id
                                    }
                                    className="rounded-2xl border border-slate-200 p-4"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <img
                                                src={
                                                    avatar
                                                }
                                                alt={
                                                    reviewerName
                                                }
                                                className="h-11 w-11 rounded-full object-cover"
                                            />

                                            <div>

                                                <p className="font-bold text-slate-900">
                                                    {
                                                        reviewerName
                                                    }
                                                </p>

                                                <div className="mt-1 flex items-center gap-2">

                                                    <RatingStars
                                                        rating={
                                                            review.rating
                                                        }
                                                        size={14}
                                                    />

                                                    <span className="text-xs text-slate-400">
                                                        {
                                                            new Date(
                                                                review.createdAt
                                                            ).toLocaleDateString()
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        {isOwn && (

                                            <div className="flex gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEdit(
                                                            review
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeReview(
                                                            review._id
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                    {review.comment && (

                                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {
                                                review.comment
                                            }
                                        </p>

                                    )}

                                </article>
                            );
                        }
                    )}

                </div>
            )}

            {!editingId &&
                currentUserId && (

                    <form
                        onSubmit={
                            saveReview
                        }
                        className="mt-8 rounded-2xl border border-dashed border-slate-300 p-5"
                    >

                        <h3 className="mb-4 font-bold text-slate-900">
                            Write a review
                        </h3>

                        <div className="mb-4 flex items-center gap-1">

                            {Array.from(
                                {
                                    length: 5
                                },
                                (_, index) => {

                                    const value =
                                        index +
                                        1;

                                    return (
                                        <button
                                            type="button"
                                            key={
                                                value
                                            }
                                            onClick={() =>
                                                setRating(
                                                    value
                                                )
                                            }
                                            className="rounded-md p-1 text-xl"
                                        >
                                            <span
                                                className={
                                                    value <=
                                                    rating
                                                        ? "text-yellow-400"
                                                        : "text-slate-300"
                                                }
                                            >
                                                ★
                                            </span>
                                        </button>
                                    );
                                }
                            )}

                        </div>

                        <textarea
                            value={
                                comment
                            }
                            onChange={(
                                event
                            ) =>
                                setComment(
                                    event.target.value
                                )
                            }
                            rows={4}
                            maxLength={1000}
                            className="w-full rounded-xl border border-slate-300 p-3 outline-none"
                            placeholder="How was your food?"
                        />

                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Review"}
                        </button>

                    </form>
                )}

            {!currentUserId ? (
                <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Login after delivery to write a review.
                </p>
            ) : null}

        </section>
    );
}

export default ReviewSection;
