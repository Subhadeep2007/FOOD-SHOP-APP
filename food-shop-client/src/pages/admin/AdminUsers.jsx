import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminUsers, updateAdminUserStatus } from "../../api/adminApi";

const message = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong.";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [working, setWorking] = useState("");
    const load = async () => { setLoading(true); try { const data = await getAdminUsers({ page: 1, limit: 100, search: search || undefined }); setUsers(data && Array.isArray(data.users) ? data.users : []); } catch (error) { toast.error(message(error)); } finally { setLoading(false); } };
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { load(); }, []);
    const toggleUser = async (user) => { setWorking(user._id); try { await updateAdminUserStatus(user._id, !user.isActive); toast.success("Customer status updated."); await load(); } catch (error) { toast.error(message(error)); } finally { setWorking(""); } };
    return <main className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-black">Customers</h1><form onSubmit={(event) => { event.preventDefault(); load(); }} className="mt-5 flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="w-full rounded-xl border px-4 py-3" /><button className="rounded-xl bg-slate-900 px-5 font-bold text-white">Search</button></form><div className="mt-5 overflow-x-auto rounded-2xl bg-white"><table className="min-w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="p-4">Customer</th><th className="p-4">Email verified</th><th className="p-4">Joined</th><th className="p-4">Status</th></tr></thead><tbody>{loading ? <tr><td colSpan="4" className="p-6">Loading customers...</td></tr> : users.map((user) => <tr key={user._id} className="border-b"><td className="p-4"><div className="flex items-center gap-3">{user.profileImage ? <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold">{user.name.slice(0, 1).toUpperCase()}</div>}<div><p className="font-bold">{user.name}</p><p className="text-slate-500">{user.email}</p></div></div></td><td className="p-4">{user.isEmailVerified ? "Verified" : "Not verified"}</td><td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td><td className="p-4"><button type="button" disabled={working === user._id} onClick={() => toggleUser(user)} className={user.isActive ? "rounded-lg bg-green-50 px-3 py-2 font-bold text-green-700" : "rounded-lg bg-red-50 px-3 py-2 font-bold text-red-700"}>{user.isActive ? "Active" : "Inactive"}</button></td></tr>)}</tbody></table></div></div></main>;
}

export default AdminUsers;
