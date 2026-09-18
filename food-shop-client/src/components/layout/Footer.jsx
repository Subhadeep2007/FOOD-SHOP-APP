function Footer() {

    return (

        <footer className="mt-20 border-t border-slate-200 bg-slate-950 text-white">

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                <div className="grid gap-10 md:grid-cols-4">

                    <div className="md:col-span-2">

                        <div className="mb-4 flex items-center gap-2">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold">
                                F
                            </div>

                            <span className="text-xl font-bold">
                                FoodShop
                            </span>

                        </div>

                        <p className="max-w-md text-sm leading-6 text-slate-400">
                            Delicious food, fresh ingredients and a simple
                            ordering experience delivered right to your door.
                        </p>

                    </div>


                    <div>

                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            Quick Links
                        </h3>

                        <div className="space-y-3 text-sm text-slate-400">

                            <a
                                href="/"
                                className="block transition hover:text-white"
                            >
                                Home
                            </a>

                            <a
                                href="/menu"
                                className="block transition hover:text-white"
                            >
                                Menu
                            </a>

                            <a
                                href="/categories"
                                className="block transition hover:text-white"
                            >
                                Categories
                            </a>

                        </div>

                    </div>


                    <div>

                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            Contact
                        </h3>

                        <div className="space-y-3 text-sm text-slate-400">

                            <p>
                                Available for orders daily
                            </p>

                            <p>
                                Fast local delivery
                            </p>

                            <p>
                                Freshly prepared food
                            </p>

                        </div>

                    </div>

                </div>


                <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">

                    © {new Date().getFullYear()} FoodShop. All rights reserved.

                </div>

            </div>

        </footer>

    );

}

export default Footer;