import {
    ArrowRight,
    Clock3,
    ShieldCheck,
    Truck
} from "lucide-react";

import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getShopLocation } from "../../api/authApi";

function Home() {

    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [shopLocation, setShopLocation] = useState(null);
    const [deliveryMessage, setDeliveryMessage] = useState("");
    const [checkingDelivery, setCheckingDelivery] = useState(false);

    useEffect(() => {
        getShopLocation()
            .then((response) => {
                const data = response && response.data ? response.data : response;
                setShopLocation(data && data.shopLocation ? data.shopLocation : null);
            })
            .catch(() => setShopLocation(null));
    }, []);

    if (isAuthenticated && user && user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    const checkDelivery = () => {
        if (!shopLocation || !navigator.geolocation) {
            setDeliveryMessage("Location is not available in this browser.");
            return;
        }
        setCheckingDelivery(true);
        navigator.geolocation.getCurrentPosition((position) => {
            const toRadians = (value) => value * Math.PI / 180;
            const earthRadiusKm = 6371;
            const latitudeDifference = toRadians(Number(shopLocation.latitude) - position.coords.latitude);
            const longitudeDifference = toRadians(Number(shopLocation.longitude) - position.coords.longitude);
            const a = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(toRadians(position.coords.latitude)) * Math.cos(toRadians(Number(shopLocation.latitude))) * Math.sin(longitudeDifference / 2) ** 2;
            const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            setDeliveryMessage(distance <= 10 ? `Delivery is available at your location (${distance.toFixed(1)} km from the shop).` : `Sorry, your location is ${distance.toFixed(1)} km away. Delivery is available within 10 km.`);
            setCheckingDelivery(false);
        }, () => {
            setDeliveryMessage("Allow location permission to check delivery availability.");
            setCheckingDelivery(false);
        }, { enableHighAccuracy: true, timeout: 10000 });
    };

    return (

        <div>

            {/* ========================================
                HERO
            ======================================== */}

            <section className="overflow-hidden bg-orange-50">

                <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">

                    <div>

                        <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                            Freshly prepared for you
                        </span>


                        <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

                            Delicious food.

                            <span className="block text-orange-500">
                                Delivered fresh.
                            </span>

                        </h1>


                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">

                            Order your favourite meals from FoodShop and
                            enjoy fresh, tasty food delivered straight to
                            your doorstep.

                        </p>


                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <a
                                href="/menu"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                            >

                                Explore Menu

                                <ArrowRight size={18} />

                            </a>


                            <a
                                href="/categories"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-500"
                            >
                                Browse Categories
                            </a>

                        </div>


                        <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">

                            <div>

                                <p className="text-2xl font-black text-slate-950">
                                    100+
                                </p>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Food Items
                                </p>

                            </div>


                            <div>

                                <p className="text-2xl font-black text-slate-950">
                                    Fresh
                                </p>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Ingredients
                                </p>

                            </div>


                            <div>

                                <p className="text-2xl font-black text-slate-950">
                                    Fast
                                </p>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Delivery
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="relative">

                        <div className="mx-auto max-w-lg">

                            <div className="aspect-square overflow-hidden rounded-[2rem] bg-orange-200 shadow-2xl">

                                <div className="flex h-full items-center justify-center p-8">

                                    <div className="text-center">

                                        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-orange-500 text-6xl shadow-xl">
                                            🍔
                                        </div>

                                        <p className="mt-6 text-2xl font-black text-slate-900">
                                            Made with love
                                        </p>

                                        <p className="mt-2 text-sm text-slate-600">
                                            Fresh food. Great taste.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {shopLocation ? (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
                        <div className="p-7 sm:p-10">
                            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Visit FoodShop</p>
                            {shopLocation.image ? <img src={shopLocation.image} alt={shopLocation.name} className="mt-4 h-28 w-28 rounded-2xl object-cover" /> : null}
                            <h2 className="mt-3 text-3xl font-black text-slate-950">{shopLocation.name}</h2>
                            <p className="mt-4 leading-7 text-slate-600">{shopLocation.address}</p>
                            <div className="mt-4 space-y-1 text-sm text-slate-600">
                                <p><span className="font-bold text-slate-900">Owner:</span> {shopLocation.ownerName}</p>
                                <p><span className="font-bold text-slate-900">Email:</span> <a className="text-orange-600" href={`mailto:${shopLocation.ownerEmail}`}>{shopLocation.ownerEmail}</a></p>
                                <p><span className="font-bold text-slate-900">Contact:</span> <a className="text-orange-600" href={`tel:${shopLocation.phone}`}>{shopLocation.phone}</a></p>
                            </div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${shopLocation.latitude},${shopLocation.longitude}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Get directions</a>
                            <button type="button" onClick={checkDelivery} disabled={checkingDelivery} className="mt-3 block rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{checkingDelivery ? "Checking delivery..." : "Check 10 km delivery"}</button>
                            {deliveryMessage ? <p className={`mt-3 rounded-xl p-3 text-sm font-bold ${deliveryMessage.startsWith("Delivery is available") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{deliveryMessage}</p> : null}
                        </div>
                        <iframe title="FoodShop location" className="h-80 w-full border-0 lg:h-full" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${shopLocation.latitude}%2C${shopLocation.longitude}`} />
                    </div>
                </section>
            ) : null}


            {/* ========================================
                WHY FOODSHOP
            ======================================== */}

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-2xl text-center">

                    <span className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                        Why FoodShop
                    </span>

                    <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Everything you need for a better food experience
                    </h2>

                </div>


                <div className="mt-12 grid gap-6 md:grid-cols-3">

                    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500">

                            <Truck size={24} />

                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                            Fast Delivery
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Get your food delivered quickly and conveniently
                            to your selected address.
                        </p>

                    </div>


                    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500">

                            <ShieldCheck size={24} />

                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                            Safe & Reliable
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Secure accounts, reliable ordering and transparent
                            order information.
                        </p>

                    </div>


                    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500">

                            <Clock3 size={24} />

                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                            Easy Ordering
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Browse food, add to cart and place your order in
                            just a few simple steps.
                        </p>

                    </div>

                </div>

            </section>


            {/* ========================================
                CTA
            ======================================== */}

            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">

                <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-12">

                    <h2 className="text-3xl font-black text-white sm:text-4xl">
                        Hungry already?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                        Explore our menu and find something delicious for
                        your next meal.
                    </p>

                    <a
                        href="/menu"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        Order Now
                        <ArrowRight size={18} />
                    </a>

                </div>

            </section>

        </div>

    );

}

export default Home;
