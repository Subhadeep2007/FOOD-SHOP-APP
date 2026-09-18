function FoodFilters({
    filters,
    categories,
    onChange,
    onReset
}) {
    const update = (
        name,
        value
    ) => {
        onChange({
            ...filters,
            [name]: value
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">
                    Filters
                </h2>

                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                    Reset
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <label className="text-sm font-semibold text-slate-700">
                    Category

                    <select
                        value={filters.category}
                        onChange={(event) =>
                            update(
                                "category",
                                event.target.value
                            )
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500"
                    >
                        <option value="">
                            All categories
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            )
                        )}
                    </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                    Food type

                    <select
                        value={filters.foodType}
                        onChange={(event) =>
                            update(
                                "foodType",
                                event.target.value
                            )
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none"
                    >
                        <option value="">
                            All types
                        </option>

                        <option value="veg">
                            Veg
                        </option>

                        <option value="non-veg">
                            Non-Veg
                        </option>

                        <option value="egg">
                            Egg
                        </option>
                    </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                    Sort

                    <select
                        value={filters.sort}
                        onChange={(event) =>
                            update(
                                "sort",
                                event.target.value
                            )
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none"
                    >
                        <option value="newest">
                            Newest
                        </option>

                        <option value="price-low">
                            Price: Low to High
                        </option>

                        <option value="price-high">
                            Price: High to Low
                        </option>

                        <option value="rating">
                            Top Rated
                        </option>
                    </select>
                </label>

                <div className="grid grid-cols-2 gap-3">

                    <label className="text-sm font-semibold text-slate-700">
                        Min price

                        <input
                            type="number"
                            min="0"
                            value={filters.minPrice}
                            onChange={(event) =>
                                update(
                                    "minPrice",
                                    event.target.value
                                )
                            }
                            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none"
                        />
                    </label>

                    <label className="text-sm font-semibold text-slate-700">
                        Max price

                        <input
                            type="number"
                            min="0"
                            value={filters.maxPrice}
                            onChange={(event) =>
                                update(
                                    "maxPrice",
                                    event.target.value
                                )
                            }
                            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none"
                        />
                    </label>

                </div>
            </div>
        </div>
    );
}

export default FoodFilters;