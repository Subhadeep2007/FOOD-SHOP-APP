import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/notificationApi";

const message = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong.";
function Notifications() {
    const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); try { const data = await getNotifications({ page: 1, limit: 50 }); setItems(data && Array.isArray(data.notifications) ? data.notifications : []); } catch (error) { toast.error(message(error)); } finally { setLoading(false); } };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, []);
    const read = async (id) => { try { await markNotificationRead(id); setItems((current) => current.map((item) => item._id === id ? { ...item, isRead: true } : item)); } catch (error) { toast.error(message(error)); } };
    const readAll = async () => { try { await markAllNotificationsRead(); setItems((current) => current.map((item) => ({ ...item, isRead: true }))); toast.success("All notifications marked as read."); } catch (error) { toast.error(message(error)); } };
    return <main className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><h1 className="text-3xl font-black">Notifications</h1><button type="button" onClick={readAll} className="font-bold text-slate-700">Mark all read</button></div>{loading ? <p className="mt-6">Loading notifications...</p> : !items.length ? <p className="mt-6 rounded-2xl bg-white p-6 text-slate-500">You have no notifications.</p> : <div className="mt-6 space-y-3">{items.map((item) => <button type="button" key={item._id} onClick={() => read(item._id)} className={item.isRead ? "w-full rounded-2xl border bg-white p-4 text-left" : "w-full rounded-2xl border border-slate-400 bg-white p-4 text-left shadow-sm"}><div className="flex justify-between gap-3"><p className="font-black">{item.title}</p><span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-2 text-sm text-slate-600">{item.message}</p></button>)}</div>}</div></main>;
}
export default Notifications;
