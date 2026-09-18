import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/notificationApi";

const message = error => error.response?.data?.message || "Something went wrong.";

function Notifications() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState("");
    const load = async () => { setLoading(true); try { const data = await getNotifications({ page: 1, limit: 50 }); setItems(Array.isArray(data?.notifications) ? data.notifications : []); } catch (error) { toast.error(message(error)); } finally { setLoading(false); } };
    useEffect(() => { load(); }, []);
    const read = async id => { try { await markNotificationRead(id); setItems(current => current.map(item => item._id === id ? { ...item, isRead: true } : item)); } catch (error) { toast.error(message(error)); } };
    const readAll = async () => { try { await markAllNotificationsRead(); setItems(current => current.map(item => ({ ...item, isRead: true }))); toast.success("All notifications marked as read."); } catch (error) { toast.error(message(error)); } };
    const remove = async id => { if (!window.confirm("Delete this notification?")) return; setDeleting(id); try { await deleteNotification(id); setItems(current => current.filter(item => item._id !== id)); toast.success("Notification deleted."); } catch (error) { toast.error(message(error)); } finally { setDeleting(""); } };
    return <main className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><h1 className="text-3xl font-black">Notifications</h1><button type="button" onClick={readAll} className="font-bold text-slate-700">Mark all read</button></div>{loading ? <p className="mt-6">Loading notifications...</p> : !items.length ? <p className="mt-6 rounded-2xl bg-white p-6 text-slate-500">You have no notifications.</p> : <div className="mt-6 space-y-3">{items.map(item => <article key={item._id} className={item.isRead ? "rounded-2xl border bg-white p-4" : "rounded-2xl border border-slate-400 bg-white p-4 shadow-sm"}><div className="flex justify-between gap-3"><button type="button" onClick={() => read(item._id)} className="min-w-0 flex-1 text-left"><p className="font-black">{item.title}</p><p className="mt-2 text-sm text-slate-600">{item.message}</p></button><div className="flex shrink-0 flex-col items-end gap-2"><span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span><button type="button" disabled={deleting === item._id} onClick={() => remove(item._id)} className="text-sm font-bold text-red-600 disabled:opacity-50">{deleting === item._id ? "Deleting..." : "Delete"}</button></div></div></article>)}</div>}</div></main>;
}

export default Notifications;
