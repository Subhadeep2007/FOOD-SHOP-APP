import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { cancelAdminOrder, getAdminOrder, getAdminOrders, updateAdminOrderStatus } from "../../api/adminApi";
import { createOrderSocket } from "../../api/socket";

const statuses = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const nextStatuses = { PLACED: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY_FOR_PICKUP", READY_FOR_PICKUP: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };
const message = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Unable to complete this action.";
const label = (value) => String(value || "").replaceAll("_", " ");

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const socketRef = useRef(null);
    const ordersRef = useRef([]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders({ page: 1, limit: 50, status: status || undefined });
            setOrders(data && Array.isArray(data.orders) ? data.orders : []);
        } catch (error) { toast.error(message(error)); }
        finally { setLoading(false); }
    };

    const openDetails = async (orderId) => {
        setDetailsLoading(true);
        try { setSelectedOrder(await getAdminOrder(orderId)); }
        catch (error) { toast.error(message(error)); }
        finally { setDetailsLoading(false); }
    };

    // Reload the server list when the selected status filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { load(); }, [status]);

    useEffect(() => { ordersRef.current = orders; }, [orders]);

    useEffect(() => {
        const socket = createOrderSocket();
        socketRef.current = socket;
        const joinLoadedOrders = () => ordersRef.current.forEach((order) => socket.emit("join-order-room", order._id));
        const receiveStatus = (event) => {
            if (!event || !event.orderId) return;
            setOrders((current) => current.map((order) => String(order._id) === String(event.orderId) ? { ...order, status: event.status } : order));
            setSelectedOrder((current) => current && String(current._id) === String(event.orderId) ? { ...current, status: event.status } : current);
        };
        socket.on("connect", joinLoadedOrders);
        socket.on("order-status-updated", receiveStatus);
        socket.on("order-cancelled", receiveStatus);
        socket.on("socket-error", (event) => { if (event && event.message) console.error("Admin order socket error:", event.message); });
        return () => { socket.disconnect(); socketRef.current = null; };
    }, []);

    useEffect(() => {
        if (!socketRef.current || !socketRef.current.connected) return;
        orders.forEach((order) => socketRef.current.emit("join-order-room", order._id));
    }, [orders]);

    const updateStatus = async (order, nextStatus) => {
        if (nextStatus === order.status) return;
        let deliveryDetails;
        if (nextStatus === "CONFIRMED") {
            const name = window.prompt("Delivery person name:");
            const phone = window.prompt("Delivery person phone:");
            if (!name || !phone) return;
            deliveryDetails = { name, phone };
        }
        setWorkingId(order._id);
        try { await updateAdminOrderStatus(order._id, { status: nextStatus, deliveryDetails }); toast.success("Order status updated."); await load(); if (selectedOrder && selectedOrder._id === order._id) await openDetails(order._id); }
        catch (error) { toast.error(message(error)); }
        finally { setWorkingId(""); }
    };

    const cancel = async (order) => {
        const reason = window.prompt("Cancellation reason (optional):");
        if (reason === null) return;
        setWorkingId(order._id);
        try { await cancelAdminOrder(order._id, reason); toast.success("Order cancelled."); await load(); if (selectedOrder && selectedOrder._id === order._id) await openDetails(order._id); }
        catch (error) { toast.error(message(error)); }
        finally { setWorkingId(""); }
    };

    const address = selectedOrder && selectedOrder.deliveryAddress ? selectedOrder.deliveryAddress : null;
    const latitude = address ? Number(address.latitude) : NaN;
    const longitude = address ? Number(address.longitude) : NaN;
    const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

    return <main className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-400">Admin</p><h1 className="text-3xl font-black">Order Management</h1></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-white px-4 py-3"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div><div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="p-8 text-slate-500">Loading orders...</td></tr> : !orders.length ? <tr><td colSpan="6" className="p-8 text-slate-500">No orders found.</td></tr> : orders.map((order) => { const next = nextStatuses[order.status]; return <tr key={order._id} className="border-b"><td className="p-4 font-bold">{order.orderNumber}<br /><span className="font-normal text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span></td><td className="p-4">{order.user && order.user.name ? order.user.name : "Customer"}<br /><span className="text-slate-500">{order.user && order.user.email ? order.user.email : ""}</span></td><td className="p-4 font-bold">₹{Number(order.totalAmount || 0).toFixed(2)}</td><td className="p-4">{order.paymentMethod}<br />{order.paymentStatus}</td><td className="p-4"><select disabled={workingId === order._id || !next} value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-lg border p-2 text-xs"><option value={order.status}>{label(order.status)}</option>{next ? <option value={next}>{label(next)}</option> : null}</select></td><td className="p-4"><div className="flex gap-3"><button type="button" onClick={() => openDetails(order._id)} className="font-bold text-slate-700">Details</button>{order.status !== "CANCELLED" && order.status !== "DELIVERED" ? <button type="button" disabled={workingId === order._id} onClick={() => cancel(order)} className="font-bold text-red-600 disabled:opacity-50">Cancel</button> : null}</div></td></tr>; })}</tbody></table></div>{detailsLoading ? <p className="mt-6 rounded-2xl bg-white p-6 text-slate-500">Loading order details...</p> : null}{selectedOrder && !detailsLoading ? <section className="mt-6 rounded-2xl border bg-white p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-400">Order details</p><h2 className="mt-1 text-2xl font-black">{selectedOrder.orderNumber}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg border px-3 py-2 text-sm font-bold">Close</button></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><h3 className="font-black">Customer and delivery address</h3><p className="mt-3 text-sm leading-6 text-slate-600">{selectedOrder.user && selectedOrder.user.name ? selectedOrder.user.name : "Customer"}<br />{selectedOrder.user && selectedOrder.user.email ? selectedOrder.user.email : ""}<br />{address ? address.fullName : ""}<br />{address ? address.phone : ""}<br />{address ? address.addressLine : ""}{address && address.landmark ? ", " + address.landmark : ""}<br />{address ? address.city + ", " + address.state + " " + address.postalCode : ""}</p></div><div className="overflow-hidden rounded-xl border bg-slate-50">{hasLocation ? <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} className="h-72 w-full"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><CircleMarker center={[latitude, longitude]} radius={10} pathOptions={{ color: "#0f172a", fillColor: "#38bdf8", fillOpacity: 0.9 }}><Popup>{address.formattedAddress || "Customer delivery location"}</Popup></CircleMarker></MapContainer> : <div className="flex h-72 items-center justify-center p-6 text-center text-sm text-slate-500">This order has no valid delivery latitude and longitude.</div>}</div></div></section> : null}</div></main>;
}

export default AdminOrders;
