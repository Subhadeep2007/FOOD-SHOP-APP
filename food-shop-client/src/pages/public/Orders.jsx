import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { getMyOrders } from "../../api/orderApi";

const errorMessage = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong.";
const label = (value) => String(value || "").replaceAll("_", " ");
const money = (value) => "₹" + Number(value || 0).toFixed(2);

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getMyOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (requestError) {
            const nextError = errorMessage(requestError);
            setError(nextError);
            toast.error(nextError);
        } finally {
            setLoading(false);
        }
    };

    // This is the initial server load for the page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadOrders(); }, []);

    if (loading) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-3xl bg-white" /></main>;
    if (error) return <main className="min-h-screen bg-slate-50 p-8 text-center"><div className="mx-auto max-w-md rounded-2xl bg-red-50 p-5 text-red-700"><p>{error}</p><button type="button" onClick={loadOrders} className="mt-4 rounded-xl border border-red-200 px-4 py-2 font-bold">Try again</button></div></main>;
    if (!orders.length) return <main className="min-h-screen bg-slate-50 px-4 py-20 text-center"><h1 className="text-3xl font-black">No orders yet</h1><p className="mt-2 text-slate-500">Your placed orders will appear here.</p><Link to="/menu" className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Explore menu</Link></main>;

    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-black">My Orders</h1><p className="mt-1 text-slate-500">{orders.length} order{orders.length === 1 ? "" : "s"}</p><div className="mt-6 space-y-4">{orders.map((order) => <Link key={order._id} to={"/orders/" + order._id} className="block rounded-2xl border bg-white p-5 transition hover:border-slate-400"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{order.orderNumber}</p><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {Array.isArray(order.items) ? order.items.length : 0} item(s)</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{label(order.status)}</span></div><div className="mt-4 flex flex-wrap justify-between gap-2 border-t pt-4 text-sm"><span>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} · {label(order.paymentStatus)}</span><span className="font-black">{money(order.totalAmount)}</span></div></Link>)}</div></div></main>;
}

export default Orders;
