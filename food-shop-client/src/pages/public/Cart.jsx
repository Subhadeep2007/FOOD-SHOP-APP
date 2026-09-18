import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { changeCartQuantity, deleteCartItem, emptyCart } from "../../store/cartSlice";

const itemId = (item) => item.food && item.food._id ? item.food._id : item.food;
const itemFood = (item) => item.food && typeof item.food === "object" ? item.food : {};
const finalPrice = (food) => {
    const price = Number(food.price) || 0;
    const discount = Number(food.discountPercentage) || 0;
    return price - (price * discount / 100);
};

function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, loading, updating, error } = useSelector((state) => state.cart);
    const items = cart && Array.isArray(cart.items) ? cart.items : [];
    const total = items.reduce((sum, item) => sum + finalPrice(itemFood(item)) * (Number(item.quantity) || 0), 0);

    const updateQuantity = async (item, quantity) => {
        const food = itemFood(item);
        const max = Number(food.stock) || quantity;
        if (quantity < 1) { await remove(item); return; }
        if (quantity > max) { toast.error("Only " + max + " item(s) are available."); return; }
        const result = await dispatch(changeCartQuantity({ foodId: itemId(item), quantity }));
        if (result.meta.requestStatus === "rejected") toast.error(result.payload || "Unable to update cart.");
    };

    const remove = async (item) => {
        const result = await dispatch(deleteCartItem(itemId(item)));
        if (result.meta.requestStatus === "rejected") toast.error(result.payload || "Unable to remove item.");
    };

    const clear = async () => {
        if (!window.confirm("Clear every item from your cart?")) return;
        const result = await dispatch(emptyCart());
        if (result.meta.requestStatus === "fulfilled") toast.success("Cart cleared.");
        else toast.error(result.payload || "Unable to clear cart.");
    };

    if (loading) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-3xl bg-white" /></main>;
    if (!items.length) return <main className="min-h-screen bg-slate-50 px-4 py-20 text-center"><ShoppingBag className="mx-auto text-slate-400" size={48} /><h1 className="mt-4 text-3xl font-black">Your cart is empty</h1><p className="mt-2 text-slate-500">Add something delicious from the menu.</p><Link to="/menu" className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Browse menu</Link></main>;

    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between"><h1 className="text-3xl font-black">Your Cart</h1><button type="button" onClick={clear} disabled={updating} className="text-sm font-bold text-red-600 disabled:opacity-50">Clear cart</button></div>{error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p> : null}<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]"><section className="space-y-3">{items.map((item) => { const food = itemFood(item); const image = food.images && food.images[0] ? food.images[0] : "https://placehold.co/160x160?text=Food"; return <article key={itemId(item)} className="flex gap-4 rounded-2xl border bg-white p-4"><img src={image} alt={food.name || "Food"} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h2 className="font-black">{food.name || "Unavailable food"}</h2><p className="mt-1 text-sm text-slate-500">₹{finalPrice(food).toFixed(2)} each</p><div className="mt-3 flex items-center justify-between"><div className="inline-flex items-center rounded-lg border"><button type="button" disabled={updating} onClick={() => updateQuantity(item, Number(item.quantity) - 1)} className="p-2"><Minus size={15} /></button><span className="min-w-8 text-center font-bold">{item.quantity}</span><button type="button" disabled={updating} onClick={() => updateQuantity(item, Number(item.quantity) + 1)} className="p-2"><Plus size={15} /></button></div><button type="button" disabled={updating} onClick={() => remove(item)} className="rounded-lg p-2 text-red-600"><Trash2 size={18} /></button></div></div></article>; })}</section><aside className="h-fit rounded-2xl border bg-white p-5"><h2 className="text-lg font-black">Order summary</h2><div className="mt-4 flex justify-between text-slate-600"><span>Items</span><span>{items.length}</span></div><div className="mt-3 flex justify-between border-t pt-3 text-lg font-black"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div><p className="mt-3 text-xs text-slate-500">Final fees and totals are calculated by the server at checkout.</p><button type="button" onClick={() => navigate("/checkout")} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">Checkout</button></aside></div></div></main>;
}

export default Cart;
