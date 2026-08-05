import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../lib/api";
import { Product } from "../../lib/types";

const emptyForm = { title: "", description: "", category: "", price: "", stock: "", image: "", highlights: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  function load() {
    api.get("/products").then((res) => setProducts(res.data.products));
  }
  useEffect(load, []);

  function openCreate() { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); }
  function openEdit(p: Product) {
    setForm({ title: p.title, description: p.description, category: p.category, price: String(p.price), stock: String(p.stock), image: p.image, highlights: p.highlights.join(", ") });
    setEditingId(p.id); setShowForm(true); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const payload = { title: form.title, description: form.description, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, highlights: form.highlights.split(",").map(h => h.trim()).filter(Boolean) };
    try {
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      setShowForm(false); load();
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`); load();
  }

  async function generateWithAI() {
    if (!form.title || !form.category) { setError("Please enter a title and category first."); return; }
    setGenerating(true); setError("");
    try {
      const res = await api.post("/ai/generate", { title: form.title, category: form.category });
      setForm(prev => ({ ...prev, description: res.data.description, highlights: res.data.highlights.join(", ") }));
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setGenerating(false); }
  }

  const inputCls = "w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Manage Products</h1>
          <p className="mt-1 text-sm text-ink-muted">{products.length} products in catalogue</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-surface p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              {editingId ? "Edit Product" : "New Product"}
            </h2>
            <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-ink-muted transition hover:bg-danger/10 hover:text-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
              <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Price ($)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className={inputCls} />
            </div>
            <div className="col-span-full">
              <label className="mb-1.5 block text-sm font-medium text-ink">Image URL</label>
              <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://…" className={inputCls} />
            </div>
            <div className="col-span-full">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-ink">Description</label>
                <button type="button" onClick={generateWithAI} disabled={generating}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50">
                  {generating
                    ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />Generating…</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>Generate with AI</>
                  }
                </button>
              </div>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="col-span-full">
              <label className="mb-1.5 block text-sm font-medium text-ink">Highlights <span className="text-ink-muted font-normal">(comma-separated)</span></label>
              <input value={form.highlights} onChange={e => setForm({...form, highlights: e.target.value})}
                placeholder="Fast charging, Lightweight, 1-year warranty" className={inputCls} />
            </div>

            {error && (
              <div className="col-span-full flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {error}
              </div>
            )}

            <div className="col-span-full flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60">
                {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{editingId ? "Saving…" : "Creating…"}</> : editingId ? "Save Changes" : "Create Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink-muted transition hover:border-primary hover:text-primary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-ink-muted/60">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Stock</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-primary-soft/20">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="h-10 w-10 rounded-xl object-cover border border-border shrink-0" />
                    <span className="font-semibold text-ink">{p.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-semibold text-mint">{p.category}</span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-ink">${p.price.toFixed(2)}</td>
                <td className="px-5 py-3.5">
                  <span className={`font-medium ${p.stock <= 5 ? "text-warning" : "text-ink-muted"}`}>{p.stock}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => openEdit(p)}
                    className="mr-3 text-xs font-semibold text-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p.id)}
                    className="text-xs font-semibold text-danger hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-muted/50">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
