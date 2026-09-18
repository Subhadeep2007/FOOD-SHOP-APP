import {
    useEffect,
    useState
} from "react";

import toast from "react-hot-toast";

import {
    Edit3,
    Plus,
    Trash2
} from "lucide-react";

import {
    adminCreateFood,
    adminDeleteFood,
    adminGetFoods,
    adminUpdateAvailability,
    adminUpdateFood,
    adminUpdatePrice,
    adminUpdateStock
} from "../../api/foodApi";

import {
    adminGetCategories
} from "../../api/categoryApi";

const initialForm = {
    name: "",
    description: "",
    price: "",
    discountPercentage: "0",
    category: "",
    foodType: "veg",
    ingredients: "",
    preparationTime: "15"
};

function AdminFoods() {

    const [
        foods,
        setFoods
    ] = useState([]);

    const [
        categories,
        setCategories
    ] = useState([]);

    const [
        pagination,
        setPagination
    ] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    const [
        page,
        setPage
    ] = useState(1);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        search,
        setSearch
    ] = useState("");

    const [
        category,
        setCategory
    ] = useState("");

    const [
        foodType,
        setFoodType
    ] = useState("");

    const [
        availability,
        setAvailability
    ] = useState("");

    const [
        active,
        setActive
    ] = useState("");

    const [
        editingFood,
        setEditingFood
    ] = useState(null);

    const [
        form,
        setForm
    ] = useState(
        initialForm
    );

    const [
        files,
        setFiles
    ] = useState([]);

    const [
        saving,
        setSaving
    ] = useState(false);

    const load =
        async () => {

            setLoading(true);

            try {

                const data =
                    await adminGetFoods({
                        page,
                        limit: 15,
                        search:
                            search ||
                            undefined,
                        category:
                            category ||
                            undefined,
                        foodType:
                            foodType ||
                            undefined,
                        isAvailable:
                            availability === ""
                                ? undefined
                                : availability,
                        isActive:
                            active === ""
                                ? undefined
                                : active
                    });

                setFoods(
                    data.foods ||
                    data.data ||
                    []
                );

                setPagination(
                    data.pagination ||
                    {
                        page,
                        pages: 1,
                        total: 0
                    }
                );

            } catch (error) {

                toast.error(
                    "Unable to load admin foods."
                );

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {

        load();

    }, [
        page,
        search,
        category,
        foodType,
        availability,
        active
    ]);

    useEffect(() => {

        const loadCategories =
            async () => {

                try {

                    const data =
                        await adminGetCategories({
                            isActive:
                                "true"
                        });

                    setCategories(
                        data.categories ||
                        data.data ||
                        data ||
                        []
                    );

                } catch (
                    error
                ) {

                    setCategories([]);

                }
            };

        loadCategories();

    }, []);

    const startCreate =
        () => {

            setEditingFood(
                null
            );

            setForm(
                initialForm
            );

            setFiles([]);

        };

    const startEdit =
        (food) => {

            setEditingFood(
                food
            );

            setForm({
                name:
                    food.name ||
                    "",

                description:
                    food.description ||
                    "",

                price:
                    food.price ||
                    "",

                discountPercentage:
                    food.discountPercentage ||
                    0,

                category:
                    food.category &&
                    food.category._id
                        ? food.category._id
                        : food.category ||
                          "",

                foodType:
                    food.foodType ||
                    "veg",

                ingredients:
                    Array.isArray(
                        food.ingredients
                    )
                        ? food.ingredients.join(
                            ", "
                        )
                        : "",

                preparationTime:
                    food.preparationTime ||
                    15
            });

            setFiles([]);

        };

    const submit =
        async (event) => {

            event.preventDefault();

            setSaving(true);

            try {

                const formData =
                    new FormData();

                formData.append(
                    "name",
                    form.name
                );

                formData.append(
                    "description",
                    form.description
                );

                formData.append(
                    "price",
                    form.price
                );

                formData.append(
                    "discountPercentage",
                    form.discountPercentage
                );

                formData.append(
                    "category",
                    form.category
                );

                formData.append(
                    "foodType",
                    form.foodType
                );

                formData.append(
                    "preparationTime",
                    form.preparationTime
                );

                const ingredients =
                    form.ingredients
                        .split(",")
                        .map(
                            (item) =>
                                item.trim()
                        )
                        .filter(
                            Boolean
                        );

                ingredients.forEach(
                    (item) =>
                        formData.append(
                            "ingredients",
                            item
                        )
                );

                files.forEach(
                    (file) =>
                        formData.append(
                            "images",
                            file
                        )
                );

                if (
                    editingFood
                ) {

                    await adminUpdateFood(
                        editingFood._id,
                        formData
                    );

                    toast.success(
                        "Food updated successfully."
                    );

                } else {

                    await adminCreateFood(
                        formData
                    );

                    toast.success(
                        "Food created successfully."
                    );
                }

                startCreate();

                await load();

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to save food."
                );

            } finally {

                setSaving(false);

            }
        };

    const updatePrice =
        async (food) => {

            const price =
                window.prompt(
                    "New price",
                    String(
                        food.price
                    )
                );

            if (
                price === null
            ) {
                return;
            }

            const discount =
                window.prompt(
                    "Discount percentage",
                    String(
                        food.discountPercentage ||
                        0
                    )
                );

            if (
                discount === null
            ) {
                return;
            }

            try {

                await adminUpdatePrice(
                    food._id,
                    {
                        price:
                            Number(
                                price
                            ),
                        discountPercentage:
                            Number(
                                discount
                            )
                    }
                );

                toast.success(
                    "Price updated."
                );

                await load();

            } catch (error) {

                toast.error(
                    "Unable to update price."
                );
            }
        };

    const updateStock =
        async (food) => {

            const stock =
                window.prompt(
                    "New stock",
                    String(
                        food.stock
                    )
                );

            if (
                stock === null
            ) {
                return;
            }

            try {

                await adminUpdateStock(
                    food._id,
                    Number(
                        stock
                    )
                );

                toast.success(
                    "Stock updated."
                );

                await load();

            } catch (error) {

                toast.error(
                    "Unable to update stock."
                );
            }
        };

    const toggleAvailability =
        async (food) => {

            try {

                await adminUpdateAvailability(
                    food._id,
                    !food.isAvailable
                );

                toast.success(
                    "Availability updated."
                );

                await load();

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to update availability."
                );
            }
        };

    const deleteFood =
        async (
            foodId
        ) => {

            const confirmed =
                window.confirm(
                    "Soft delete this food?"
                );

            if (!confirmed) {
                return;
            }

            try {

                await adminDeleteFood(
                    foodId
                );

                toast.success(
                    "Food deleted."
                );

                await load();

            } catch (error) {

                toast.error(
                    "Unable to delete food."
                );
            }
        };

    return (
        <main className="min-h-screen bg-slate-100 p-4 md:p-8">

            <div className="mx-auto max-w-7xl">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                    <div>

                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                            Admin
                        </p>

                        <h1 className="text-3xl font-black text-slate-900">
                            Food Management
                        </h1>

                    </div>

                    <button
                        type="button"
                        onClick={
                            startCreate
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                    >
                        <Plus
                            size={18}
                        />
                        New Food
                    </button>

                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                    <input
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) => {
                            setPage(
                                1
                            );
                            setSearch(
                                event.target.value
                            );
                        }}
                        placeholder="Search food..."
                        className="rounded-xl border bg-white px-4 py-3"
                    />

                    <select
                        value={
                            category
                        }
                        onChange={(
                            event
                        ) => {
                            setPage(
                                1
                            );
                            setCategory(
                                event.target.value
                            );
                        }}
                        className="rounded-xl border bg-white px-4 py-3"
                    >
                        <option value="">
                            All categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={
                                        item._id
                                    }
                                    value={
                                        item._id
                                    }
                                >
                                    {
                                        item.name
                                    }
                                </option>
                            )
                        )}

                    </select>

                    <select
                        value={
                            foodType
                        }
                        onChange={(
                            event
                        ) => {
                            setPage(
                                1
                            );
                            setFoodType(
                                event.target.value
                            );
                        }}
                        className="rounded-xl border bg-white px-4 py-3"
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

                    <select
                        value={
                            availability
                        }
                        onChange={(
                            event
                        ) => {
                            setPage(
                                1
                            );
                            setAvailability(
                                event.target.value
                            );
                        }}
                        className="rounded-xl border bg-white px-4 py-3"
                    >
                        <option value="">
                            All availability
                        </option>

                        <option value="true">
                            Available
                        </option>

                        <option value="false">
                            Unavailable
                        </option>

                    </select>

                    <select
                        value={
                            active
                        }
                        onChange={(
                            event
                        ) => {
                            setPage(
                                1
                            );
                            setActive(
                                event.target.value
                            );
                        }}
                        className="rounded-xl border bg-white px-4 py-3"
                    >
                        <option value="">
                            All active states
                        </option>

                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>

                    </select>

                </div>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <table className="min-w-full text-left text-sm">

                        <thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                            <tr>

                                <th className="px-4 py-4">
                                    Food
                                </th>

                                <th className="px-4 py-4">
                                    Category
                                </th>

                                <th className="px-4 py-4">
                                    Price
                                </th>

                                <th className="px-4 py-4">
                                    Stock
                                </th>

                                <th className="px-4 py-4">
                                    Status
                                </th>

                                <th className="px-4 py-4">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-8 text-slate-500"
                                    >
                                        Loading...
                                    </td>
                                </tr>

                            ) : foods.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-8 text-slate-500"
                                    >
                                        No foods found.
                                    </td>
                                </tr>

                            ) : (

                                foods.map(
                                    (food) => (

                                        <tr
                                            key={
                                                food._id
                                            }
                                            className="border-b last:border-0"
                                        >

                                            <td className="px-4 py-4">

                                                <div className="flex min-w-64 items-center gap-3">

                                                    <img
                                                        src={
                                                            food.images &&
                                                            food.images.length >
                                                            0
                                                                ? food.images[0]
                                                                : "https://placehold.co/80x80?text=Food"
                                                        }
                                                        alt={
                                                            food.name
                                                        }
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />

                                                    <div>

                                                        <p className="font-bold text-slate-900">
                                                            {
                                                                food.name
                                                            }
                                                        </p>

                                                        <p className="text-xs uppercase text-slate-400">
                                                            {
                                                                food.foodType
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            <td className="px-4 py-4">

                                                {
                                                    food.category &&
                                                    food.category.name
                                                        ? food.category.name
                                                        : "-"
                                                }

                                            </td>

                                            <td className="px-4 py-4 font-bold">

                                                ₹
                                                {Number(
                                                    food.price ||
                                                    0
                                                ).toFixed(
                                                    2
                                                )}

                                            </td>

                                            <td className="px-4 py-4 font-bold">

                                                {
                                                    food.stock
                                                }

                                            </td>

                                            <td className="px-4 py-4">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleAvailability(
                                                            food
                                                        )
                                                    }
                                                    className={
                                                        food.isAvailable
                                                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                                                            : "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                                                    }
                                                >
                                                    {food.isAvailable
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </button>

                                            </td>

                                            <td className="px-4 py-4">

                                                <div className="flex flex-wrap gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEdit(
                                                                food
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                                    >
                                                        <Edit3
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updatePrice(
                                                                food
                                                            )
                                                        }
                                                        className="rounded-lg px-2 py-1 text-xs font-bold"
                                                    >
                                                        Price
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateStock(
                                                                food
                                                            )
                                                        }
                                                        className="rounded-lg px-2 py-1 text-xs font-bold"
                                                    >
                                                        Stock
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteFood(
                                                                food._id
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-500"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">

                    <span>
                        Total:{" "}
                        {
                            pagination.total ||
                            0
                        }
                    </span>

                    <div className="flex gap-2">

                        <button
                            disabled={
                                page <= 1
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        current -
                                        1
                                )
                            }
                            className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
                        >
                            Prev
                        </button>

                        <span className="rounded-lg border bg-white px-3 py-2">
                            {page} /{" "}
                            {
                                pagination.pages ||
                                1
                            }
                        </span>

                        <button
                            disabled={
                                page >=
                                Number(
                                    pagination.pages ||
                                    1
                                )
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        current +
                                        1
                                )
                            }
                            className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                </div>

                <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-4 text-xl font-black">
                        {
                            editingFood
                                ? "Edit Food"
                                : "Create Food"
                        }
                    </h2>

                    <form
                        onSubmit={
                            submit
                        }
                        className="grid gap-4 md:grid-cols-2"
                    >

                        <input
                            required
                            value={
                                form.name
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    name:
                                        event.target.value
                                })
                            }
                            placeholder="Food name"
                            className="rounded-xl border px-4 py-3"
                        />

                        <select
                            required
                            value={
                                form.category
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    category:
                                        event.target.value
                                })
                            }
                            className="rounded-xl border px-4 py-3"
                        >

                            <option value="">
                                Select category
                            </option>

                            {categories.map(
                                (
                                    item
                                ) => (
                                    <option
                                        key={
                                            item._id
                                        }
                                        value={
                                            item._id
                                        }
                                    >
                                        {
                                            item.name
                                        }
                                    </option>
                                )
                            )}

                        </select>

                        <textarea
                            required
                            rows="4"
                            value={
                                form.description
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    description:
                                        event.target.value
                                })
                            }
                            placeholder="Description"
                            className="rounded-xl border px-4 py-3 md:col-span-2"
                        />

                        <input
                            required
                            min="0"
                            type="number"
                            value={
                                form.price
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    price:
                                        event.target.value
                                })
                            }
                            placeholder="Price"
                            className="rounded-xl border px-4 py-3"
                        />

                        <input
                            min="0"
                            max="100"
                            type="number"
                            value={
                                form.discountPercentage
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    discountPercentage:
                                        event.target.value
                                })
                            }
                            placeholder="Discount %"
                            className="rounded-xl border px-4 py-3"
                        />

                        <select
                            required
                            value={
                                form.foodType
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    foodType:
                                        event.target.value
                                })
                            }
                            className="rounded-xl border px-4 py-3"
                        >

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

                        <input
                            min="1"
                            type="number"
                            value={
                                form.preparationTime
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    preparationTime:
                                        event.target.value
                                })
                            }
                            placeholder="Preparation time"
                            className="rounded-xl border px-4 py-3"
                        />

                        <input
                            value={
                                form.ingredients
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    ingredients:
                                        event.target.value
                                })
                            }
                            placeholder="Ingredients, comma separated"
                            className="rounded-xl border px-4 py-3 md:col-span-2"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(
                                event
                            ) =>
                                setFiles(
                                    Array.from(
                                        event.target.files ||
                                        []
                                    )
                                )
                            }
                            className="rounded-xl border px-4 py-3 md:col-span-2"
                        />

                        <button
                            disabled={
                                saving
                            }
                            type="submit"
                            className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60 md:col-span-2"
                        >
                            {saving
                                ? "Saving..."
                                : editingFood
                                    ? "Update Food"
                                    : "Create Food"}
                        </button>

                    </form>

                </div>

            </div>

        </main>
    );
}

export default AdminFoods;