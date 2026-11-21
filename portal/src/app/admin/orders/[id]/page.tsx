"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { FLOW, ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/orders";

type Detail = {
  order: {
    id: number;
    code: string;
    customer_name: string;
    company: string;
    country: string;
    email: string;
    whatsapp: string;
    status: OrderStatus;
    total_usd: number;
    notes: string;
    product_id: number | null;
    product_name: string | null;
  };
  payments: { id: number; kind: string; amount_usd: number; method: string; reference: string; paid_at: string | null; note: string }[];
  media: { id: number; kind: string; title: string; url: string }[];
  shipment: {
    carrier: string;
    tracking_no: string;
    etd: string | null;
    eta: string | null;
    status: string;
    last_event: string;
  } | null;
  products: { id: number; name: string }[];
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed");
      return;
    }
    setData(json);
  }, [params.id]);

  useEffect(() => {
    load().catch(() => setError("Failed to load"));
  }, [load]);

  async function saveStatus(status: string, total_usd: number, notes: string, product_id: string) {
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        total_usd,
        notes,
        product_id: product_id ? Number(product_id) : null,
      }),
    });
    if (!res.ok) {
      setError("Could not save order");
      return;
    }
    setMsg("Order saved.");
    await load();
  }

  async function addPayment(form: FormData) {
    const res = await fetch(`/api/admin/orders/${params.id}/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: form.get("kind"),
        amount_usd: Number(form.get("amount_usd")),
        method: form.get("method"),
        reference: form.get("reference"),
        paid_at: form.get("paid_at"),
        note: form.get("note"),
      }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Payment failed");
      return;
    }
    setMsg("Payment recorded.");
    await load();
  }

  async function addMedia(kind: "photo" | "video", title: string, url: string) {
    const res = await fetch(`/api/admin/orders/${params.id}/media`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, title, url }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Upload failed");
      return;
    }
    setMsg(kind === "photo" ? "Photo uploaded. Status moved toward Ready if needed." : "Video link saved.");
    await load();
  }

  async function saveShipment(form: FormData) {
    const res = await fetch(`/api/admin/orders/${params.id}/shipment`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        carrier: form.get("carrier"),
        tracking_no: form.get("tracking_no"),
        etd: form.get("etd") || null,
        eta: form.get("eta") || null,
        status: form.get("status"),
        last_event: form.get("last_event"),
        mark_shipped: form.get("mark_shipped") === "on",
      }),
    });
    if (!res.ok) {
      setError("Shipment save failed");
      return;
    }
    setMsg("Logistics updated.");
    await load();
  }

  if (!data) {
    return (
      <Shell admin>
        <p className="fine">{error || "Loading…"}</p>
      </Shell>
    );
  }

  const order = data.order;

  return (
    <Shell admin>
      <p className="fine">
        <Link href="/admin">← Orders</Link>
      </p>
      <h1>{order.code}</h1>
      <p>
        {order.customer_name} · {order.country} · {order.email}
      </p>

      <div className="flow">
        {FLOW.map((step) => {
          const idx = FLOW.indexOf(step);
          const cur = FLOW.indexOf(order.status);
          const cls = step === order.status ? "on" : cur > idx ? "done" : "";
          return (
            <span key={step} className={cls}>
              {STATUS_LABEL[step]}
            </span>
          );
        })}
      </div>

      {error ? <p className="warn">{error}</p> : null}
      {msg ? <p className="ok">{msg}</p> : null}

      <section className="card">
        <h2>Order</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            saveStatus(String(fd.get("status")), Number(fd.get("total_usd")), String(fd.get("notes")), String(fd.get("product_id")));
          }}
        >
          <div className="grid grid-2">
            <label className="field">
              <span>Status</span>
              <select name="status" defaultValue={order.status}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Product</span>
              <select name="product_id" defaultValue={order.product_id ?? ""}>
                <option value="">Custom / none</option>
                {data.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Total USD</span>
              <input name="total_usd" defaultValue={order.total_usd} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea name="notes" defaultValue={order.notes} />
          </label>
          <button className="btn" type="submit">
            Save order
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Payments</h2>
        <table className="table">
          <tbody>
            {data.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.kind}</td>
                <td>${p.amount_usd.toLocaleString()}</td>
                <td>{p.method}</td>
                <td>{p.paid_at || "—"}</td>
                <td>{p.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addPayment(new FormData(e.currentTarget));
            e.currentTarget.reset();
          }}
        >
          <div className="grid grid-3">
            <label className="field">
              <span>Kind</span>
              <select name="kind" defaultValue="deposit">
                <option value="deposit">deposit</option>
                <option value="progress">progress</option>
                <option value="balance">balance</option>
                <option value="other">other</option>
              </select>
            </label>
            <label className="field">
              <span>Amount USD</span>
              <input name="amount_usd" required />
            </label>
            <label className="field">
              <span>Method</span>
              <input name="method" defaultValue="TT" />
            </label>
            <label className="field">
              <span>Reference</span>
              <input name="reference" />
            </label>
            <label className="field">
              <span>Paid at</span>
              <input name="paid_at" type="date" />
            </label>
            <label className="field">
              <span>Note</span>
              <input name="note" />
            </label>
          </div>
          <button className="btn line" type="submit">
            Add payment
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Production media</h2>
        <div className="media-grid">
          {data.media.map((m) =>
            m.kind === "photo" ? (
              <figure key={m.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.title} />
                <figcaption className="fine">{m.title}</figcaption>
              </figure>
            ) : (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="card">
                Video · {m.title || m.url}
              </a>
            ),
          )}
        </div>
        <div className="grid grid-2" style={{ marginTop: "0.8rem" }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const file = fd.get("file") as File | null;
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async () => {
                await addMedia("photo", String(fd.get("title") || file.name), String(reader.result || ""));
              };
              reader.readAsDataURL(file);
              e.currentTarget.reset();
            }}
          >
            <h3>Upload photo</h3>
            <label className="field">
              <span>Title</span>
              <input name="title" placeholder="Shell welded" />
            </label>
            <label className="field">
              <span>Image</span>
              <input name="file" type="file" accept="image/*" required />
            </label>
            <button className="btn line" type="submit">
              Upload photo
            </button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addMedia("video", String(fd.get("title") || ""), String(fd.get("url") || ""));
              e.currentTarget.reset();
            }}
          >
            <h3>Add video link</h3>
            <label className="field">
              <span>Title</span>
              <input name="title" placeholder="Walkaround" />
            </label>
            <label className="field">
              <span>URL</span>
              <input name="url" placeholder="https://..." required />
            </label>
            <button className="btn line" type="submit">
              Save video link
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <h2>Logistics</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveShipment(new FormData(e.currentTarget));
          }}
        >
          <div className="grid grid-2">
            <label className="field">
              <span>Carrier</span>
              <input name="carrier" defaultValue={data.shipment?.carrier || ""} />
            </label>
            <label className="field">
              <span>Tracking no.</span>
              <input name="tracking_no" defaultValue={data.shipment?.tracking_no || ""} />
            </label>
            <label className="field">
              <span>ETD</span>
              <input name="etd" type="date" defaultValue={data.shipment?.etd || ""} />
            </label>
            <label className="field">
              <span>ETA</span>
              <input name="eta" type="date" defaultValue={data.shipment?.eta || ""} />
            </label>
            <label className="field">
              <span>Status</span>
              <input name="status" defaultValue={data.shipment?.status || "preparing"} />
            </label>
          </div>
          <label className="field">
            <span>Latest event</span>
            <textarea name="last_event" defaultValue={data.shipment?.last_event || ""} />
          </label>
          <label className="field" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input name="mark_shipped" type="checkbox" />
            <span style={{ textTransform: "none", letterSpacing: 0 }}>Also mark order as Shipped</span>
          </label>
          <button className="btn" type="submit">
            Save logistics
          </button>
        </form>
      </section>
    </Shell>
  );
}
