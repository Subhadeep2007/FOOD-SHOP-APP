import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { getCategories } from "../../api/categoryApi";

const errorMessage = (error) => error.response?.data?.message || "Unable to load categories.";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const response = await getCategories();
            const data = response?.data || response;
            const list = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.data) ? data.data : [];
            setCategories(list.filter((category) => category.isActive !== false));
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, []);

    return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-orange-500">Explore the menu</p><h1 className="mt-2 text-3xl font-black text-slate-900">Food Categories</h1><p className="mt-2 text-slate-500">Choose a category to find your favourite food.</p></div>{loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-3xl bg-white" />)}</div> : categories.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category._id} to={`/menu?category=${encodeURIComponent(category._id)}`} className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="h-40 bg-slate-100">{category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl">🍽️</div>}</div><div className="p-5"><h2 className="text-xl font-black">{category.name}</h2><p className="mt-2 min-h-10 text-sm text-slate-500">{category.description || "Browse delicious items in this category."}</p><span className="mt-4 inline-block font-bold text-orange-600">View items →</span></div></Link>)}</div> : <div className="mt-8 rounded-3xl bg-white p-8 text-center"><p className="text-slate-500">No categories are available right now.</p><Link to="/menu" className="mt-4 inline-block font-bold text-orange-600">View all menu items</Link></div>}</div></main>;
}

export default Categories;
