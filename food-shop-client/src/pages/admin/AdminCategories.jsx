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
    adminCreateCategory,
    adminDeleteCategory,
    adminGetCategories,
    adminUpdateCategory
} from "../../api/categoryApi";

const emptyForm = {
    name: "",
    description: "",
    sortOrder: 0,
    isActive: true
};

function AdminCategories() {

    const [
        categories,
        setCategories
    ] = useState([]);

    const [
        search,
        setSearch
    ] = useState("");

    const [
        active,
        setActive
    ] = useState("");

    const [
        editingCategory,
        setEditingCategory
    ] = useState(null);

    const [
        form,
        setForm
    ] = useState(
        emptyForm
    );

    const [
        file,
        setFile
    ] = useState(null);

    const [
        saving,
        setSaving
    ] = useState(false);

    const load =
        async () => {

            try {

                const data =
                    await adminGetCategories({
                        search:
                            search ||
                            undefined,
                        isActive:
                            active === ""
                                ? undefined
                                : active
                    });

                setCategories(
                    data.categories ||
                    data.data ||
                    data ||
                    []
                );

            } catch (error) {

                toast.error(
                    "Unable to load categories."
                );
            }
        };

    useEffect(() => {

        load();

    }, [
        search,
        active
    ]);

    const reset =
        () => {

            setEditingCategory(
                null
            );

            setForm(
                emptyForm
            );

            setFile(
                null
            );
        };

    const edit =
        (category) => {

            setEditingCategory(
                category
            );

            setForm({
                name:
                    category.name ||
                    "",

                description:
                    category.description ||
                    "",

                sortOrder:
                    category.sortOrder ||
                    0,

                isActive:
                    category.isActive !==
                    false
            });

            setFile(null);
        };

    const submit =
        async (
            event
        ) => {

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
                    "sortOrder",
                    form.sortOrder
                );

                formData.append(
                    "isActive",
                    String(
                        form.isActive
                    )
                );

                if (file) {

                    formData.append(
                        "image",
                        file
                    );
                }

                if (
                    editingCategory
                ) {

                    await adminUpdateCategory(
                        editingCategory._id,
                        formData
                    );

                    toast.success(
                        "Category updated."
                    );

                } else {

                    await adminCreateCategory(
                        formData
                    );

                    toast.success(
                        "Category created."
                    );
                }

                reset();

                await load();

            } catch (error) {

                toast.error(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Unable to save category."
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    const remove =
        async (
            categoryId
        ) => {

            const confirmed =
                window.confirm(
                    "Soft delete this category?"
                );

            if (!confirmed) {
                return;
            }

            try {

                await adminDeleteCategory(
                    categoryId
                );

                toast.success(
                    "Category deleted."
                );

                await load();

            } catch (error) {

                toast.error(
                    "Unable to delete category."
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
                            Category Management
                        </h1>

                    </div>

                    <button
                        type="button"
                        onClick={
                            reset
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                    >
                        <Plus
                            size={18}
                        />
                        New Category
                    </button>

                </div>

                <div className="mb-5 grid gap-4 md:grid-cols-2">

                    <input
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search category..."
                        className="rounded-xl border bg-white px-4 py-3"
                    />

                    <select
                        value={
                            active
                        }
                        onChange={(
                            event
                        ) =>
                            setActive(
                                event.target.value
                            )
                        }
                        className="rounded-xl border bg-white px-4 py-3"
                    >

                        <option value="">
                            All states
                        </option>

                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>

                    </select>

                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <table className="min-w-full text-left text-sm">

                        <thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                            <tr>

                                <th className="px-4 py-4">
                                    Category
                                </th>

                                <th className="px-4 py-4">
                                    Description
                                </th>

                                <th className="px-4 py-4">
                                    Sort
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

                            {categories.length ===
                            0 ? (

                                <tr>

                                    <td
                                        className="px-4 py-8 text-slate-500"
                                        colSpan="5"
                                    >
                                        No categories found.
                                    </td>

                                </tr>

                            ) : (

                                categories.map(
                                    (
                                        category
                                    ) => (

                                        <tr
                                            key={
                                                category._id
                                            }
                                            className="border-b last:border-0"
                                        >

                                            <td className="px-4 py-4">

                                                <div className="flex min-w-56 items-center gap-3">

                                                    <img
                                                        src={
                                                            category.image ||
                                                            "https://placehold.co/80x80?text=Cat"
                                                        }
                                                        alt={
                                                            category.name
                                                        }
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />

                                                    <p className="font-bold text-slate-900">
                                                        {
                                                            category.name
                                                        }
                                                    </p>

                                                </div>

                                            </td>

                                            <td className="max-w-md px-4 py-4 text-slate-500">
                                                {
                                                    category.description ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-4 py-4 font-bold">
                                                {
                                                    category.sortOrder
                                                }
                                            </td>

                                            <td className="px-4 py-4">

                                                <span
                                                    className={
                                                        category.isActive
                                                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                                                            : "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                                                    }
                                                >
                                                    {category.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>

                                            <td className="px-4 py-4">

                                                <div className="flex gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            edit(
                                                                category
                                                            )
                                                        }
                                                        className="rounded-lg p-2"
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
                                                            remove(
                                                                category._id
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

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="mb-4 text-xl font-black">
                        {
                            editingCategory
                                ? "Edit Category"
                                : "Create Category"
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
                            placeholder="Category name"
                            className="rounded-xl border px-4 py-3"
                        />

                        <input
                            type="number"
                            value={
                                form.sortOrder
                            }
                            onChange={(
                                event
                            ) =>
                                setForm({
                                    ...form,
                                    sortOrder:
                                        event.target.value
                                })
                            }
                            placeholder="Sort order"
                            className="rounded-xl border px-4 py-3"
                        />

                        <textarea
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

                        <label className="flex items-center gap-3 rounded-xl border px-4 py-3 font-semibold text-slate-700">

                            <input
                                type="checkbox"
                                checked={
                                    form.isActive
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm({
                                        ...form,
                                        isActive:
                                            event.target.checked
                                    })
                                }
                            />

                            Active

                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(
                                event
                            ) =>
                                setFile(
                                    event.target.files &&
                                    event.target.files[0]
                                        ? event.target.files[0]
                                        : null
                                )
                            }
                            className="rounded-xl border px-4 py-3"
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
                                : editingCategory
                                    ? "Update Category"
                                    : "Create Category"}
                        </button>

                    </form>

                </div>

            </div>

        </main>
    );
}

export default AdminCategories;