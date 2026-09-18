import {
    Search,
    ShoppingCart,
    User,
    Menu
} from "lucide-react";

function Navbar() {

    return (

        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <a
                    href="/"
                    className="flex items-center gap-2"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
                        F
                    </div>

                    <div>

                        <h1 className="text-lg font-bold leading-none text-slate-900">
                            FoodShop
                        </h1>

                        <p className="text-[11px] text-slate-500">
                            Fresh & Delicious
                        </p>

                    </div>

                </a>


                <nav className="hidden items-center gap-7 md:flex">

                    <a
                        href="/"
                        className="text-sm font-medium text-slate-900 transition hover:text-orange-500"
                    >
                        Home
                    </a>

                    <a
                        href="/menu"
                        className="text-sm font-medium text-slate-600 transition hover:text-orange-500"
                    >
                        Menu
                    </a>

                    <a
                        href="/categories"
                        className="text-sm font-medium text-slate-600 transition hover:text-orange-500"
                    >
                        Categories
                    </a>

                </nav>


                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-orange-500 sm:flex"
                    >

                        <Search size={20} />

                    </button>


                    <button
                        type="button"
                        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-orange-500"
                    >

                        <ShoppingCart size={20} />

                        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                            0
                        </span>

                    </button>


                    <button
                        type="button"
                        className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-orange-500 sm:flex"
                    >

                        <User size={20} />

                    </button>


                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
                    >

                        <Menu size={22} />

                    </button>

                </div>

            </div>

        </header>

    );

}

export default Navbar;