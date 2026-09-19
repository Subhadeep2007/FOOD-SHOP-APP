import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getAddresses } from "../../api/addressApi";
import { createOrder } from "../../api/orderApi";
import { createCODPayment, createRazorpayOrder, verifyRazorpayPayment } from "../../api/paymentApi";
import { validateCoupon } from "../../api/couponApi";
import { resetCart } from "../../store/cartSlice";

const message = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong.";

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const existingScript = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
    if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), { once: true });
        existingScript.addEventListener("error", () => resolve(false), { once: true });
        return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items = useSelector((state) => state.cart.cart && Array.isArray(state.cart.cart.items) ? state.cart.cart.items : []);
    const user = useSelector((state) => state.auth.user);
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState("");
    const [method, setMethod] = useState("COD");
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const estimatedSubtotal = useMemo(() => items.reduce((sum, item) => {
        const food = item.food && typeof item.food === "object" ? item.food : {};
        const price = Number(food.price || 0);
        const percentage = Number(food.discountPercentage || 0);
        return sum + (price - price * percentage / 100) * Number(item.quantity || 0);
    }, 0), [items]);

    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const data = await getAddresses();
                const list = Array.isArray(data) ? data : [];
                const defaultAddress = list.find((address) => address.isDefault);
                setAddresses(list);
                setAddressId(defaultAddress ? defaultAddress._id : list[0] ? list[0]._id : "");
            } catch (error) {
                toast.error(message(error));
            } finally {
                setLoading(false);
            }
        };
        loadAddresses();
    }, []);

    const applyCoupon = async () => {
        if (!coupon.trim()) { toast.error("Enter a coupon code."); return; }
        try {
            const data = await validateCoupon(coupon.trim(), estimatedSubtotal);
            setDiscount(Number(data.discountAmount || 0));
            toast.success("Coupon applied. Final totals are confirmed by the server.");
        } catch (error) {
            setDiscount(0);
            toast.error(message(error));
        }
    };

    const finish = (orderId, notice) => {
        dispatch(resetCart());
        toast.success(notice);
        navigate("/orders/" + orderId, { replace: true });
    };

    const payOnline = async (order) => {
        const available = await loadRazorpay();
        if (!available) throw new Error("Unable to load Razorpay checkout. Your cart is still saved; please try again.");

        const payment = await createRazorpayOrder(order._id);
        let checkoutFinished = false;
        const stopPendingCheckout = (notice) => {
            if (checkoutFinished) return;
            checkoutFinished = true;
            toast.error(notice);
            setPlacing(false);
        };
        const options = {
            key: payment.keyId,
            amount: payment.amount,
            currency: payment.currency,
            name: "FoodShop",
            description: "Order " + payment.orderNumber,
            order_id: payment.razorpayOrderId,
            prefill: { name: user && user.name ? user.name : "", email: user && user.email ? user.email : "" },
            handler: async (response) => {
                if (checkoutFinished) return;
                checkoutFinished = true;
                try {
                    await verifyRazorpayPayment({ orderId: order._id, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
                    finish(order._id, "Payment successful. Your order is placed.");
                } catch (error) {
                    toast.error(message(error));
                    setPlacing(false);
                }
            },
            modal: { ondismiss: () => stopPendingCheckout("Payment checkout was cancelled. Your order is available in My Orders.") },
            theme: { color: "#0f172a" }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", () => stopPendingCheckout("Payment failed. Your order is available in My Orders."));
        razorpay.open();
    };

    const placeOrder = async () => {
        if (placing) return;
        if (!addressId) { toast.error("Select a delivery address."); return; }
        setPlacing(true);
        try {
            const order = await createOrder({ addressId, paymentMethod: method, couponCode: coupon.trim() || undefined });
            if (method === "COD") {
                await createCODPayment(order._id);
                finish(order._id, "Order placed successfully.");
                return;
            }
            await payOnline(order);
        } catch (error) {
            toast.error(message(error));
            setPlacing(false);
        }
    };

    if (loading) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-3xl bg-white" /></main>;
    if (!items.length) return <main className="min-h-screen bg-slate-50 p-16 text-center"><h1 className="text-3xl font-black">Your cart is empty</h1><Link to="/menu" className="mt-5 inline-block font-bold">Browse menu</Link></main>;

    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]"><section className="space-y-6"><div className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-3"><h1 className="text-2xl font-black">Checkout</h1><Link to="/addresses" className="font-bold text-slate-600">Manage addresses</Link></div><div className="mt-4 space-y-3">{addresses.length ? addresses.map((address) => <label key={address._id} className="flex cursor-pointer gap-3 rounded-xl border p-4"><input type="radio" checked={addressId === address._id} onChange={() => setAddressId(address._id)} /><span><b>{address.fullName}</b>{address.isDefault ? " · Default" : ""}<br />{address.addressLine}, {address.city}, {address.state} {address.postalCode}</span></label>) : <p>No delivery address. <Link to="/addresses" className="font-bold underline">Add one</Link></p>}</div></div><div className="rounded-2xl border bg-white p-5"><h2 className="font-black">Payment method</h2><label className="mt-3 flex gap-3"><input type="radio" checked={method === "COD"} onChange={() => setMethod("COD")} />Cash on Delivery</label><label className="mt-3 flex gap-3"><input type="radio" checked={method === "ONLINE"} onChange={() => setMethod("ONLINE")} />Pay online with Razorpay</label></div></section><aside className="h-fit rounded-2xl border bg-white p-5"><h2 className="font-black">Order summary</h2>{items.map((item, index) => { const food = item.food && typeof item.food === "object" ? item.food : {}; return <p key={food._id || index} className="mt-3 text-sm">{food.name || "Food"} × {item.quantity}</p>; })}<div className="mt-4 flex gap-2"><input value={coupon} disabled={placing} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Coupon code" className="min-w-0 rounded-xl border px-3 py-2" /><button type="button" disabled={placing} onClick={applyCoupon} className="rounded-xl border px-3 font-bold disabled:opacity-50">Apply</button></div><p className="mt-4 text-sm">Estimated items total: ₹{estimatedSubtotal.toFixed(2)}</p>{discount ? <p className="mt-1 text-sm text-green-700">Coupon estimate: -₹{discount.toFixed(2)}</p> : null}<p className="mt-3 text-xs text-slate-500">Final prices, discount, delivery fee and tax are calculated by the server when your order is created.</p><button type="button" disabled={placing || !addresses.length} onClick={placeOrder} className="mt-5 w-full rounded-xl bg-slate-900 p-3 font-bold text-white disabled:opacity-50">{placing ? "Processing..." : method === "COD" ? "Place COD Order" : "Pay Securely"}</button></aside></div></main>;
}

export default Checkout;
