import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "../../api/addressApi";

const blankAddress = { label: "home", fullName: "", phone: "", addressLine: "", landmark: "", city: "", state: "", postalCode: "", country: "India", latitude: "", longitude: "", placeId: "", formattedAddress: "", isDefault: false };
const message = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Unable to save address.";

function Addresses() {
    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState(blankAddress);
    const [editingId, setEditingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try { const data = await getAddresses(); setAddresses(Array.isArray(data) ? data : []); }
        catch (error) { toast.error(message(error)); }
        finally { setLoading(false); }
    };
    // Loading from the API is intentionally started once when this screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, []);

    const useLocation = () => {
        if (!navigator.geolocation) { toast.error("Location is not available in this browser."); return; }
        navigator.geolocation.getCurrentPosition((position) => {
            setForm({ ...form, latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) });
            toast.success("Location added. Complete the address details.");
        }, () => toast.error("Unable to get your location."));
    };
    const submit = async (event) => {
        event.preventDefault();
        if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone) || !/^\d{4,10}$/.test(form.postalCode)) { toast.error("Enter a valid phone number and postal code."); return; }
        setSaving(true);
        const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
        try {
            if (editingId) await updateAddress(editingId, payload);
            else await createAddress(payload);
            toast.success(editingId ? "Address updated." : "Address saved.");
            setForm(blankAddress); setEditingId(""); await load();
        } catch (error) { toast.error(message(error)); }
        finally { setSaving(false); }
    };
    const edit = (address) => { setEditingId(address._id); setForm({ ...blankAddress, ...address, latitude: String(address.latitude), longitude: String(address.longitude) }); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const remove = async (id) => { if (!window.confirm("Delete this address?")) return; try { await deleteAddress(id); toast.success("Address deleted."); await load(); } catch (error) { toast.error(message(error)); } };

    return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[23rem_1fr]"><section className="h-fit rounded-3xl border bg-white p-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-black">{editingId ? "Edit address" : "New address"}</h1><button type="button" onClick={() => { setEditingId(""); setForm(blankAddress); }} className="text-sm font-bold text-slate-600">Reset</button></div><form onSubmit={submit} className="mt-5 grid gap-3"><select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="rounded-xl border p-3"><option value="home">Home</option><option value="work">Work</option><option value="other">Other</option></select>{[["fullName", "Full name"], ["phone", "Phone"], ["addressLine", "Address line"], ["landmark", "Landmark (optional)"], ["city", "City"], ["state", "State"], ["postalCode", "Postal code"], ["country", "Country"]].map(([key, label]) => <input key={key} required={key !== "landmark"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={label} className="rounded-xl border p-3" />)}<div className="grid grid-cols-2 gap-3"><input required type="number" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="Latitude" className="rounded-xl border p-3" /><input required type="number" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="Longitude" className="rounded-xl border p-3" /></div><button type="button" onClick={useLocation} className="rounded-xl border px-4 py-3 font-bold"><MapPin className="mr-2 inline" size={16} />Use current location</button><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />Set as default</label><button disabled={saving} className="rounded-xl bg-slate-900 p-3 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update address" : "Save address"}</button></form></section><section><h2 className="text-2xl font-black">My Addresses</h2>{loading ? <div className="mt-5 h-48 animate-pulse rounded-3xl bg-white" /> : !addresses.length ? <p className="mt-5 rounded-2xl bg-white p-6 text-slate-500">No saved addresses yet.</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2">{addresses.map((address) => <article key={address._id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-3"><div><p className="font-black">{address.fullName} {address.isDefault ? <span className="ml-1 text-xs text-green-600">DEFAULT</span> : null}</p><p className="mt-2 text-sm leading-6 text-slate-600">{address.addressLine}, {address.landmark ? address.landmark + ", " : ""}{address.city}, {address.state} — {address.postalCode}<br />{address.phone}</p></div><div className="flex h-fit"><button type="button" onClick={() => edit(address)} className="p-2"><Pencil size={17} /></button><button type="button" onClick={() => remove(address._id)} className="p-2 text-red-600"><Trash2 size={17} /></button></div></div></article>)}</div>}</section></div></main>;
}

export default Addresses;
