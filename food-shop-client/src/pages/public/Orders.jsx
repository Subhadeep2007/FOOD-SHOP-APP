import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { deleteMyOrder, getMyOrders } from "../../api/orderApi";

const terminalStatuses = ["DELIVERED", "CANCELLED"];
const errorMessage = (error) => error.response?.data?.message || "Something went wrong.";
const label = (value) => String(value || "").replaceAll("_", " ");
const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

const ItemImages = ({ items = [] }) => <div className="mt-3 flex -space-x-2">{items.slice(0, 4).map((item, index) => item.image ? <img key={`${item.food}-${index}`} src={item.image} alt={item.name} title={item.name} className="h-10 w-10 rounded-full border-2 border-white object-cover" /> : <div key={`${item.food}-${index}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold">{String(item.name || "F").slice(0, 1)}</div>)}{items.length > 4 ? <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-xs font-bold text-white">+{items.length - 4}</div> : null}</div>;

function Orders() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState("");
    const [error, setError] = useState("");
    const loadOrders = async () => { setLoading(true); setError(""); try { const data = await getMyOrders(); setOrders(Array.isArray(data) ? data : []); } catch (e) { const text = errorMessage(e); setError(text); toast.error(text); } finally { setLoading(false); } };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadOrders(); }, []);
    const isHistory = location.pathname === "/order-history";
    const activeOrders = useMemo(() => orders.filter((order) => !terminalStatuses.includes(order.status)), [orders]);
    const historyOrders = useMemo(() => orders.filter((order) => terminalStatuses.includes(order.status)), [orders]);
    const visibleOrders = isHistory ? historyOrders : activeOrders;
    const deleteOrder = async (event, order) => { event.preventDefault(); event.stopPropagation(); if (!window.confirm("Delete this order from your history?")) return; setDeletingId(order._id); try { await deleteMyOrder(order._id); setOrders((current) => current.filter((item) => item._id !== order._id)); toast.success("Order deleted from history."); } catch (requestError) { toast.error(errorMessage(requestError)); } finally { setDeletingId(""); } };

    if (loading) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-3xl bg-white" /></main>;
    if (error) return <main className="min-h-screen bg-slate-50 p-8 text-center"><p>{error}</p><button onClick={loadOrders} className="mt-4 rounded-xl border px-4 py-2 font-bold">Try again</button></main>;
    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-black">My Orders</h1><p className="mt-1 text-slate-500">{activeOrders.length} active · {historyOrders.length} in history</p></div><Link to="/refunds" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-bold text-amber-800">Refund requests</Link></div><div className="mt-6 flex w-fit rounded-xl bg-slate-200 p-1"><button type="button" onClick={() => navigate("/orders")} className={`rounded-lg px-4 py-2 text-sm font-bold ${!isHistory ? "bg-white shadow" : "text-slate-600"}`}>Active orders ({activeOrders.length})</button><button type="button" onClick={() => navigate("/order-history")} className={`rounded-lg px-4 py-2 text-sm font-bold ${isHistory ? "bg-white shadow" : "text-slate-600"}`}>Order history ({historyOrders.length})</button></div>{visibleOrders.length ? <div className="mt-6 space-y-4">{visibleOrders.map((order) => <Link key={order._id} to={`/orders/${order._id}`} className="block rounded-2xl border bg-white p-5 transition hover:border-slate-400"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{order.orderNumber}</p><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item(s)</p><ItemImages items={order.items} /></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{label(order.status)}</span>{isHistory ? <button type="button" disabled={deletingId === order._id} onClick={(event) => deleteOrder(event, order)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 disabled:opacity-50">{deletingId === order._id ? "Deleting..." : "Delete"}</button> : null}</div></div><div className="mt-4 flex justify-between gap-2 border-t pt-4 text-sm"><span>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} · {label(order.paymentStatus)}</span><span className="font-black">{money(order.totalAmount)}</span></div></Link>)}</div> : <div className="mt-8 text-center"><h2 className="text-2xl font-black">{isHistory ? "No order history yet" : "No active orders"}</h2>{!isHistory ? <Link to="/menu" className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Explore menu</Link> : null}</div>}</div></main>;
}

export default Orders;
