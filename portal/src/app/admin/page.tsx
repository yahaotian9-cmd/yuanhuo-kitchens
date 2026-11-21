"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";

type OrderRow = {
  id: number;
  code: string;
  customer_name: string;
  country: string;
  email: string;
  status: OrderStatus;
  total_usd: number;
  product_name: string | null;
  updated_at: string;
};

export default function AdminHome() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    company: "",
    country: "",
    email: "",
    whatsapp: "",
    total_usd: "0",
    notes: "",
  });

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json = await res.json();
    setAuthed(true);
    setOrders(json.orders || []);
  }

  useEffect(() => {
    loadOrders().catch(() => setAuthed(false));
  }, []);

  async function onLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    await loadOrders();
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, total_usd: Number(form.total_usd) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not create");
        return;
      }
      setForm({ customer_name: "", company: "", country: "", email: "", whatsapp: "", total_usd: "0", notes: "" });
      await loadOrders();
    } finally {
      setCreating(false);
    }
  }

  if (authed === null) {
    return (
      <Shell>
        <p className="fine">Checking session…</p>
      </Shell>
    );
  }

  if (!authed) {
    return (
      <Shell>
        <h1>Admin login</h1>
        <p className="fine">Local sample password is <code>demo</code>. On Cursor Apps, set ADMIN_PASSWORD.</p>
        <form className="card" onSubmit={onLogin} style={{ maxWidth: 420 }}>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error ? <p className="warn">{error}</p> : null}
          <button className="btn" type="submit">
            Enter
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell admin>
      <h1>Orders</h1>
      <p className="fine">Create an order, then open it to record payments, upload media, and add logistics.</p>

      <section className="card">
        <h2>New order</h2>
        <form onSubmit={onCreate}>
          <div className="grid grid-2">
            <label className="field">
              <span>Customer</span>
              <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </label>
            <label className="field">
              <span>Company</span>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </label>
            <label className="field">
              <span>Country</span>
              <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </label>
            <label className="field">
              <span>Email</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="field">
              <span>WhatsApp</span>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </label>
            <label className="field">
              <span>Total USD</span>
              <input value={form.total_usd} onChange={(e) => setForm({ ...form, total_usd: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {error ? <p className="warn">{error}</p> : null}
          <button className="btn" type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create order"}
          </button>
        </form>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.code}</td>
                <td>
                  {order.customer_name}
                  <div className="fine">
                    {order.country} · {order.product_name || "Custom"}
                  </div>
                </td>
                <td>
                  <span className="badge">{STATUS_LABEL[order.status] || order.status}</span>
                </td>
                <td>${Number(order.total_usd).toLocaleString()}</td>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
