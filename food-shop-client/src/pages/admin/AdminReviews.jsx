import {
    useEffect,
    useState
} from "react";

import toast from "react-hot-toast";

import RatingStars from "../../components/food/RatingStars";

import {
    adminGetAllReviews
} from "../../api/reviewApi";

function AdminReviews() {

    const [
        reviews,
        setReviews
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        const load =
            async () => {

                try {

                    const data =
                        await adminGetAllReviews();

                    setReviews(
                        data.reviews ||
                        data.data ||
                        data ||
                        []
                    );

                } catch (error) {

                    toast.error(
                        "Unable to load reviews."
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            };

        load();

    }, []);

    return (
        <main className="min-h-screen bg-slate-100 p-4 md:p-8">

            <div className="mx-auto max-w-7xl">

                <div className="mb-6">

                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                        Admin
                    </p>

                    <h1 className="text-3xl font-black text-slate-900">
                        Review Management
                    </h1>

                    <p className="mt-2 text-slate-500">
                        View-only customer reviews.
                    </p>

                </div>

                <div className="space-y-4">

                    {loading ? (

                        <p className="rounded-2xl bg-white p-6 text-slate-500">
                            Loading reviews...
                        </p>

                    ) : reviews.length ===
                      0 ? (

                        <p className="rounded-2xl bg-white p-6 text-slate-500">
                            No reviews found.
                        </p>

                    ) : (

                        reviews.map(
                            (review) => (

                                <article
                                    key={
                                        review._id
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

                                        <div className="flex items-start gap-4">

                                            <img
                                                src={
                                                    review.user &&
                                                    review.user.profileImage
                                                        ? review.user.profileImage
                                                        : "https://placehold.co/80x80?text=U"
                                                }
                                                alt="User"
                                                className="h-12 w-12 rounded-full object-cover"
                                            />

                                            <div>

                                                <p className="font-black text-slate-900">
                                                    {
                                                        review.user &&
                                                        review.user.name
                                                            ? review.user.name
                                                            : "Customer"
                                                    }
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {
                                                        review.user &&
                                                        review.user.email
                                                            ? review.user.email
                                                            : "-"
                                                    }
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">

                                                    <RatingStars
                                                        rating={
                                                            review.rating
                                                        }
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    <span className="text-sm font-bold">
                                                        {
                                                            review.rating
                                                        }
                                                        /5
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="lg:w-1/2">

                                            <p className="font-bold text-slate-900">
                                                {
                                                    review.food &&
                                                    review.food.name
                                                        ? review.food.name
                                                        : "Food"
                                                }
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {
                                                    review.comment ||
                                                    "No comment"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-4 text-xs text-slate-400">
                                        {
                                            review.createdAt
                                                ? new Date(
                                                    review.createdAt
                                                ).toLocaleString()
                                                : "-"
                                        }
                                    </div>

                                </article>
                            )
                        )
                    )}

                </div>

            </div>

        </main>
    );
}

export default AdminReviews;