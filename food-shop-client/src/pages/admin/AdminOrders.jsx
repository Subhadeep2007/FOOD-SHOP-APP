import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { cancelAdminOrder, deleteAdminOrder, getAdminOrder, getAdminOrders, updateAdminOrderStatus } from "../../api/adminApi";
import { createOrderSocket } from "../../api/socket";

const statuses = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const terminalStatuses = ["DELIVERED", "CANCELLED"];
const nextStatuses = { PLACED: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY_FOR_PICKUP", READY_FOR_PICKUP: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };
const label = (value) => String(value || "").replaceAll("_", " ");
const money = (value) => "₹" + Number(value || 0).toFixed(2);
const message = (error) => error.response?.data?.message || "Unable to complete this action.";
const avatar = (user) => user?.profileImage || "https://placehold.co/80x80?text=U";

function Customer({ user, compact = false }) {
    return <div className="flex items-center gap-3"><img src={avatar(user)} alt={user?.name || "Customer"} className={compact ? "h-10 w-10 rounded-full object-cover" : "h-16 w-16 rounded-full object-cover"} /><div><p className="font-bold">{user?.name || "Customer"}</p><p className="text-sm text-slate-500">{user?.email || ""}</p></div></div>;
}

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState("active");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState("");
    const [deliveryForm, setDeliveryForm] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const socketRef = useRef(null);
    const ordersRef = useRef([]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders({ page: 1, limit: 50, status: status || undefined });
            setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (error) { toast.error(message(error)); }
        finally { setLoading(false); }
    };

    const openDetails = async (orderId) => {
        setDetailsLoading(true);
        try { setSelectedOrder(await getAdminOrder(orderId)); }
        catch (error) { toast.error(message(error)); }
        finally { setDetailsLoading(false); }
    };

    // The list is intentionally reloaded when the status filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { load(); }, [status]);
    useEffect(() => { ordersRef.current = orders; }, [orders]);
    useEffect(() => {
        const socket = createOrderSocket();
        socketRef.current = socket;
        const update = (event) => {
            if (!event?.orderId) return;
            setOrders((current) => current.map((order) => String(order._id) === String(event.orderId) ? { ...order, status: event.status } : order));
            setSelectedOrder((current) => current && String(current._id) === String(event.orderId) ? { ...current, status: event.status } : current);
        };
        socket.on("connect", () => ordersRef.current.forEach((order) => socket.emit("join-order-room", order._id)));
        socket.on("order-status-updated", update);
        socket.on("order-cancelled", update);
        return () => socket.disconnect();
    }, []);
    useEffect(() => { if (socketRef.current?.connected) orders.forEach((order) => socketRef.current.emit("join-order-room", order._id)); }, [orders]);

    const updateStatus = async (order, nextStatus, deliveryDetails) => {
        if (nextStatus === "CONFIRMED") {
            if (!deliveryDetails?.name?.trim() || !deliveryDetails?.phone?.trim() || !deliveryDetails?.whatsappNumber?.trim()) {
                setDeliveryForm({ order, name: "", phone: "", whatsappNumber: "" });
                return;
            }
        }
        setWorkingId(order._id);
        try {
            const updatedOrder = await updateAdminOrderStatus(order._id, { status: nextStatus, deliveryDetails });
            setOrders((current) => current.flatMap((item) => {
                if (String(item._id) !== String(order._id)) return [item];
                if (status && status !== updatedOrder.status) return [];
                return [{ ...item, status: updatedOrder.status, paymentStatus: updatedOrder.paymentStatus, deliveryDetails: updatedOrder.deliveryDetails }];
            }));
            setSelectedOrder((current) => current && String(current._id) === String(order._id) ? { ...current, status: updatedOrder.status, paymentStatus: updatedOrder.paymentStatus, deliveryDetails: updatedOrder.deliveryDetails } : current);
            toast.success("Order status updated.");
            setDeliveryForm(null);
        }
        catch (error) { toast.error(message(error)); }
        finally { setWorkingId(""); }
    };

    const cancel = async (order) => {
        const reason = window.prompt("Cancellation reason (optional):");
        if (reason === null) return;
        setWorkingId(order._id);
        try {
            const updatedOrder = await cancelAdminOrder(order._id, reason);
            setOrders((current) => current.flatMap((item) => {
                if (String(item._id) !== String(order._id)) return [item];
                if (status && status !== updatedOrder.status) return [];
                return [{ ...item, status: updatedOrder.status, cancellationReason: updatedOrder.cancellationReason, cancelledAt: updatedOrder.cancelledAt }];
            }));
            setSelectedOrder((current) => current && String(current._id) === String(order._id) ? { ...current, status: updatedOrder.status, cancellationReason: updatedOrder.cancellationReason, cancelledAt: updatedOrder.cancelledAt } : current);
            toast.success("Order cancelled.");
        }
        catch (error) { toast.error(message(error)); }
        finally { setWorkingId(""); }
    };

    const remove = async (order) => {
        if (!window.confirm("Soft delete this completed/cancelled order?")) return;
        setWorkingId(order._id);
        try {
            await deleteAdminOrder(order._id);
            setOrders((current) => current.filter((item) => String(item._id) !== String(order._id)));
            setSelectedOrder((current) => current && String(current._id) === String(order._id) ? null : current);
            toast.success("Order deleted.");
        }
        catch (error) { toast.error(message(error)); }
        finally { setWorkingId(""); }
    };

    const address = selectedOrder?.deliveryAddress;
    const latitude = Number(address?.latitude);
    const longitude = Number(address?.longitude);
    const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
    const visibleOrders = orders.filter((order) => view === "history" ? terminalStatuses.includes(order.status) : !terminalStatuses.includes(order.status));

    return <main className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-400">Admin</p><h1 className="text-3xl font-black">Order Management</h1></div><div className="flex gap-3"><Link to="/admin/refunds" className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">Refund management</Link><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-white px-4 py-3"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div></div>
        <div className="mt-6 flex w-fit rounded-xl bg-slate-200 p-1"><button type="button" onClick={() => setView("active")} className={`rounded-lg px-4 py-2 text-sm font-bold ${view === "active" ? "bg-white shadow" : "text-slate-600"}`}>Active orders</button><button type="button" onClick={() => setView("history")} className={`rounded-lg px-4 py-2 text-sm font-bold ${view === "history" ? "bg-white shadow" : "text-slate-600"}`}>Order history</button></div>
        {deliveryForm ? <form onSubmit={(event) => { event.preventDefault(); updateStatus(deliveryForm.order, "CONFIRMED", { name: deliveryForm.name, phone: deliveryForm.phone, whatsappNumber: deliveryForm.whatsappNumber }); }} className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Add delivery boy details</h2><p className="mt-1 text-sm text-slate-600">Order: {deliveryForm.order.orderNumber}</p></div><button type="button" onClick={() => setDeliveryForm(null)} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Cancel</button></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="grid gap-1 text-sm font-bold">Delivery boy name<input required minLength="2" maxLength="50" value={deliveryForm.name} onChange={(event) => setDeliveryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter full name" className="rounded-xl border bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Delivery boy phone number<input required type="tel" minLength="7" maxLength="20" pattern="[0-9+\-\s()]{7,20}" value={deliveryForm.phone} onChange={(event) => setDeliveryForm((current) => ({ ...current, phone: event.target.value }))} placeholder="e.g. +91 9876543210" className="rounded-xl border bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">WhatsApp number<input required type="tel" minLength="7" maxLength="20" pattern="[0-9+\-\s()]{7,20}" value={deliveryForm.whatsappNumber} onChange={(event) => setDeliveryForm((current) => ({ ...current, whatsappNumber: event.target.value }))} placeholder="e.g. +91 9876543210" className="rounded-xl border bg-white px-3 py-2 font-normal" /></label></div><button disabled={workingId === deliveryForm.order._id} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-50">{workingId === deliveryForm.order._id ? "Saving..." : "Confirm order & save details"}</button></form> : null}
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Food items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="p-8">Loading orders...</td></tr> : !visibleOrders.length ? <tr><td colSpan="6" className="p-8">No {view === "history" ? "history" : "active orders"} found.</td></tr> : visibleOrders.map((order) => { const next = nextStatuses[order.status]; return <tr key={order._id} className="border-b align-top"><td className="p-4 font-bold">{order.orderNumber}<br /><span className="font-normal text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span></td><td className="p-4"><Customer user={order.user} compact /></td><td className="p-4"><div className="flex -space-x-2">{order.items?.slice(0, 4).map((item, index) => <img key={index} title={item.name} src={item.image || "https://placehold.co/64x64?text=Food"} alt={item.name} className="h-9 w-9 rounded-full border-2 border-white object-cover" />)}</div><p className="mt-2 text-slate-500">{order.items?.length || 0} item(s)</p></td><td className="p-4 font-bold">{money(order.totalAmount)}</td><td className="p-4"><select disabled={workingId === order._id || !next} value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-lg border p-2 text-xs"><option value={order.status}>{label(order.status)}</option>{next ? <option value={next}>{label(next)}</option> : null}</select></td><td className="p-4"><div className="flex gap-3"><button type="button" onClick={() => openDetails(order._id)} className="font-bold">Details</button>{terminalStatuses.includes(order.status) ? <button type="button" disabled={workingId === order._id} onClick={() => remove(order)} className="font-bold text-red-600">Delete</button> : <button type="button" disabled={workingId === order._id} onClick={() => cancel(order)} className="font-bold text-red-600">Cancel</button>}</div></td></tr>; })}</tbody></table></div>
        {detailsLoading ? <p className="mt-6 rounded-2xl bg-white p-6">Loading order details...</p> : null}
        {selectedOrder && !detailsLoading ? <section className="mt-6 rounded-2xl border bg-white p-5 md:p-6"><div className="flex justify-between"><div><p className="text-sm font-bold uppercase text-slate-400">Order details</p><h2 className="text-2xl font-black">{selectedOrder.orderNumber}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg border px-3 py-2 font-bold">Close</button></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-slate-50 p-5"><h3 className="font-black">Customer</h3><div className="mt-3"><Customer user={selectedOrder.user} /></div><div className="mt-4 border-t pt-4 text-sm leading-6 text-slate-600"><b className="text-slate-900">Delivery address</b><br />{address?.fullName}<br />{address?.phone}<br />{address?.addressLine}{address?.landmark ? `, ${address.landmark}` : ""}<br />{address ? `${address.city}, ${address.state} ${address.postalCode}` : ""}</div></div><div className="overflow-hidden rounded-xl border bg-slate-50">{hasLocation ? <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} className="h-72 w-full"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><CircleMarker center={[latitude, longitude]} radius={10}><Popup>{address?.formattedAddress || "Customer delivery location"}</Popup></CircleMarker></MapContainer> : <div className="flex h-72 items-center justify-center text-slate-500">No delivery location saved.</div>}</div></div><div className="mt-5"><h3 className="font-black">Ordered food details</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{selectedOrder.items?.map((item, index) => <article key={`${item.food}-${index}`} className="flex gap-3 rounded-xl border p-3"><img src={item.image || "https://placehold.co/120x120?text=Food"} alt={item.name} className="h-20 w-20 rounded-lg object-cover" /><div><p className="font-bold">{item.name}</p><p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p><p className="text-sm text-slate-500">Price: {money(item.unitPrice)}</p><p className="mt-1 font-bold">{money(item.subtotal)}</p></div></article>)}</div></div></section> : null}
    </div></main>;
}

export default AdminOrders;
