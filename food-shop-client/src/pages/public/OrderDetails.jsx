import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { cancelMyOrder, deleteMyOrder, getMyOrderById } from "../../api/orderApi";
import { createOrderSocket } from "../../api/socket";

const errorMessage = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong.";
const stages = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
const label = (value) => String(value || "").replaceAll("_", " ");
const money = (value) => "₹" + Number(value || 0).toFixed(2);

function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    const loadOrder = async () => {
        setLoading(true);
        setError("");
        try {
            setOrder(await getMyOrderById(id));
        } catch (requestError) {
            const nextError = errorMessage(requestError);
            setError(nextError);
            toast.error(nextError);
        } finally {
            setLoading(false);
        }
    };

    // Reload only when the order route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { loadOrder(); }, [id]);

    useEffect(() => {
        const socket = createOrderSocket();
        const refreshOrder = (event) => {
            if (event && String(event.orderId) === String(id)) loadOrder();
        };

        socket.on("connect", () => socket.emit("join-order-room", id));
        socket.on("order-status-updated", refreshOrder);
        socket.on("order-cancelled", refreshOrder);
        socket.on("socket-error", (event) => {
            if (event && event.message) console.error("Order socket error:", event.message);
        });

        return () => {
            socket.off("order-status-updated", refreshOrder);
            socket.off("order-cancelled", refreshOrder);
            socket.disconnect();
        };
    // The subscription changes only when the route order changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cancelOrder = async () => {
        setCancelling(true);
        try {
            await cancelMyOrder(id, cancelReason.trim());
            toast.success("Order cancelled successfully.");
            setShowCancelForm(false);
            setCancelReason("");
            await loadOrder();
        } catch (requestError) {
            toast.error(errorMessage(requestError));
        } finally {
            setCancelling(false);
        }
    };

    const deleteOrder = async () => {
        if (!window.confirm("Hide this order from your order history?")) return;
        setDeleting(true);
        try { await deleteMyOrder(id); toast.success("Order deleted."); window.location.assign("/orders"); }
        catch (requestError) { toast.error(errorMessage(requestError)); }
        finally { setDeleting(false); }
    };

    if (loading) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-80 max-w-5xl animate-pulse rounded-3xl bg-white" /></main>;
    if (error) return <main className="min-h-screen bg-slate-50 p-12 text-center"><div className="mx-auto max-w-md rounded-2xl bg-red-50 p-5 text-red-700"><p>{error}</p><button type="button" onClick={loadOrder} className="mt-4 rounded-xl border border-red-200 px-4 py-2 font-bold">Try again</button><Link to="/orders" className="ml-4 font-bold">My orders</Link></div></main>;
    if (!order) return <main className="min-h-screen bg-slate-50 p-12 text-center"><p>Order not found.</p><Link to="/orders" className="mt-4 inline-block font-bold">Back to orders</Link></main>;

    const address = order.deliveryAddress || {};
    const canCancel = order.status === "PLACED";
    const canRequestRefund = ["PLACED", "CONFIRMED"].includes(order.status) && (order.paymentMethod === "COD" || order.paymentStatus === "SUCCESS");
    const canDelete = ["DELIVERED", "CANCELLED"].includes(order.status);
    const activeStage = stages.indexOf(order.status);

    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-5xl"><Link to="/orders" className="text-sm font-bold text-slate-500">← My Orders</Link><div className="mt-4 rounded-3xl border bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-black">{order.orderNumber}</h1><p className="mt-1 text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-1">Order: {label(order.status)}</span><span className="rounded-full bg-slate-100 px-3 py-1">Payment: {label(order.paymentStatus)}</span></div></div><div className="flex flex-wrap gap-2">{canRequestRefund ? <Link to="/refunds" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-bold text-amber-800">Request refund</Link> : null}{canCancel ? <button type="button" disabled={cancelling} onClick={() => setShowCancelForm(true)} className="rounded-xl border border-red-200 px-4 py-2 font-bold text-red-600 disabled:opacity-50">Cancel order</button> : null}{canDelete ? <button type="button" disabled={deleting} onClick={deleteOrder} className="rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:opacity-50">{deleting ? "Deleting..." : "Delete order"}</button> : null}</div></div>{showCancelForm ? <form onSubmit={(event) => { event.preventDefault(); cancelOrder(); }} className="mt-5 rounded-2xl bg-red-50 p-4"><label className="grid gap-2 text-sm font-bold text-red-900">Cancellation reason (optional)<textarea maxLength="300" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} className="min-h-20 rounded-xl border bg-white p-3 font-normal text-slate-900" placeholder="Tell the restaurant why you are cancelling" /></label><div className="mt-3 flex gap-3"><button disabled={cancelling} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white">{cancelling ? "Cancelling..." : "Confirm cancellation"}</button><button type="button" onClick={() => setShowCancelForm(false)} className="rounded-xl border px-4 py-2 font-bold">Keep order</button></div></form> : null}

    <section className="mt-7"><h2 className="font-black">Order status</h2>{order.status === "CANCELLED" ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">Cancelled{order.cancelledAt ? " on " + new Date(order.cancelledAt).toLocaleString() : ""}: {order.cancellationReason || "No reason provided."}</p> : <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{stages.map((stage, index) => <div key={stage} className={index <= activeStage ? "rounded-xl bg-slate-900 p-3 text-sm font-bold text-white" : "rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-400"}>{index + 1}. {label(stage)}</div>)}</div>}</section>

    <section className="mt-7"><h2 className="text-lg font-black">Ordered items</h2><div className="mt-3 space-y-3">{Array.isArray(order.items) ? order.items.map((item, index) => <article key={item.food || index} className="flex items-center justify-between gap-4 border-b pb-3"><div className="flex min-w-0 items-center gap-3">{item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-slate-100" />}<div><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">Qty {item.quantity} · {money(item.unitPrice)} each</p></div></div><p className="shrink-0 font-black">{money(item.subtotal)}</p></article>) : null}</div></section>

    <section className="mt-7 grid gap-5 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-5"><h2 className="font-black">Delivery address</h2><p className="mt-3 leading-6 text-slate-600">{address.fullName}<br />{address.addressLine}{address.landmark ? ", " + address.landmark : ""}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}<br />{address.phone}</p>{order.deliveryDetails && order.deliveryDetails.name ? <div className="mt-4 border-t pt-4 text-sm"><p className="font-black">Delivery partner</p><p className="mt-1 text-slate-600">{order.deliveryDetails.name}<br />{order.deliveryDetails.phone}</p></div> : null}</div><div className="rounded-2xl bg-slate-50 p-5"><h2 className="font-black">Payment summary</h2><p className="mt-2 text-sm text-slate-600">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Razorpay payment"} · {label(order.paymentStatus)}</p><div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></p><p className="flex justify-between"><span>Discount</span><span>-{money(order.discount)}</span></p><p className="flex justify-between"><span>Delivery fee</span><span>{money(order.deliveryFee)}</span></p><p className="flex justify-between"><span>Tax</span><span>{money(order.tax)}</span></p><p className="flex justify-between border-t pt-3 text-lg font-black"><span>Final total</span><span>{money(order.totalAmount)}</span></p></div></div></section></div></div></main>;
}

export default OrderDetails;
