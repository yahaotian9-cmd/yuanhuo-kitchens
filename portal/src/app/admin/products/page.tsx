"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";

type Product = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  body_type: string;
  length_m: number;
  base_price_usd: number;
  cover_url: string;
  active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    summary: "",
    body_type: "trailer",
    length_m: "5.2",
    base_price_usd: "20000",
    cover_url: "",
  });

  async function load() {
    const res = await fetch("/api/admin/products");
    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const json = await res.json();
    setProducts(json.products || []);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load products"));
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        length_m: Number(form.length_m),
        base_price_usd: Number(form.base_price_usd),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Create failed");
      return;
    }
    setForm({ slug: "", name: "", summary: "", body_type: "trailer", length_m: "5.2", base_price_usd: "20000", cover_url: "" });
    await load();
  }

  async function toggleActive(product: Product) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: product.id, active: !product.active }),
    });
    await load();
  }

  return (
    <Shell admin>
      <h1>Products</h1>
      <p className="fine">Upload catalog items your sales team can attach to orders.</p>

      <section className="card">
        <h2>Add product</h2>
        <form onSubmit={onCreate}>
          <div className="grid grid-2">
            <label className="field">
              <span>Slug</span>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="fry-trailer" />
            </label>
            <label className="field">
              <span>Name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              <span>Body type</span>
              <select value={form.body_type} onChange={(e) => setForm({ ...form, body_type: e.target.value })}>
                <option value="cart">cart</option>
                <option value="trailer">trailer</option>
                <option value="truck">truck</option>
              </select>
            </label>
            <label className="field">
              <span>Length m</span>
              <input value={form.length_m} onChange={(e) => setForm({ ...form, length_m: e.target.value })} />
            </label>
            <label className="field">
              <span>Base price USD</span>
              <input value={form.base_price_usd} onChange={(e) => setForm({ ...form, base_price_usd: e.target.value })} />
            </label>
            <label className="field">
              <span>Cover image URL</span>
              <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Summary</span>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>
          {error ? <p className="warn">{error}</p> : null}
          <button className="btn" type="submit">
            Publish product
          </button>
        </form>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Body</th>
              <th>Price</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.name}
                  <div className="fine">{p.slug}</div>
                </td>
                <td>
                  {p.body_type} · {p.length_m} m
                </td>
                <td>${Number(p.base_price_usd).toLocaleString()}</td>
                <td>{p.active ? "yes" : "no"}</td>
                <td>
                  <button className="btn line" type="button" onClick={() => toggleActive(p)}>
                    {p.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
