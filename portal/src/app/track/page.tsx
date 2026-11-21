"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import { FLOW, STATUS_LABEL, type OrderStatus } from "@/lib/orders";

type TrackPayload = {
  order: {
    code: string;
    customer_name: string;
    company: string;
    country: string;
    status: OrderStatus;
    total_usd: number;
    product_name: string | null;
    updated_at: string;
  };
  payments: { kind: string; amount_usd: number; paid_at: string | null; method: string; reference: string }[];
  media: { kind: string; title: string; url: string; created_at: string }[];
  shipment: {
    carrier: string;
    tracking_no: string;
    etd: string | null;
    eta: string | null;
    status: string;
    last_event: string;
  } | null;
};

export default function TrackPage() {
  const [code, setCode] = useState("YH-2401");
  const [email, setEmail] = useState("ana@costa.example");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackPayload | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/track?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Not found");
        return;
      }
      setData(json);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <h1>Track your order</h1>
      <p className="fine">Enter the order code from your proforma and the email used on the inquiry.</p>
      <form className="card" onSubmit={onSubmit}>
        <div className="grid grid-2">
          <label className="field">
            <span>Order code</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Looking…" : "Track"}
        </button>
        {error ? <p className="warn" style={{ marginTop: "0.8rem" }}>{error}</p> : null}
      </form>

      {data ? (
        <>
          <section className="card">
            <h2>{data.order.code}</h2>
            <p>
              {data.order.customer_name}
              {data.order.company ? ` · ${data.order.company}` : ""} · {data.order.country}
            </p>
            <p className="fine">
              {data.order.product_name || "Custom build"} · ${data.order.total_usd.toLocaleString()} USD
            </p>
            <div className="flow">
              {FLOW.map((step) => {
                const current = data.order.status;
                const idx = FLOW.indexOf(step);
                const cur = FLOW.indexOf(current);
                const cls = step === current ? "on" : cur > idx ? "done" : "";
                return (
                  <span key={step} className={cls}>
                    {STATUS_LABEL[step]}
                  </span>
                );
              })}
            </div>
            <p className="badge">{STATUS_LABEL[data.order.status] || data.order.status}</p>
          </section>

          <section className="card">
            <h3>Payments</h3>
            {data.payments.length === 0 ? <p className="fine">No payments recorded yet.</p> : null}
            <table className="table">
              <tbody>
                {data.payments.map((p, i) => (
                  <tr key={i}>
                    <td>{p.kind}</td>
                    <td>${p.amount_usd.toLocaleString()}</td>
                    <td>{p.method}</td>
                    <td>{p.paid_at || "—"}</td>
                    <td>{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h3>Production photos & videos</h3>
            {data.media.length === 0 ? <p className="fine">No media uploaded yet.</p> : null}
            <div className="media-grid">
              {data.media.map((m, i) =>
                m.kind === "photo" ? (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.title || "Production photo"} />
                    <figcaption className="fine">{m.title}</figcaption>
                  </figure>
                ) : (
                  <a key={i} className="card" href={m.url} target="_blank" rel="noreferrer">
                    Video · {m.title || "Open link"}
                  </a>
                ),
              )}
            </div>
          </section>

          <section className="card">
            <h3>Logistics</h3>
            {!data.shipment ? (
              <p className="fine">Shipping details appear when the workshop books the forwarder.</p>
            ) : (
              <>
                <p>
                  {data.shipment.carrier || "Carrier TBC"} · {data.shipment.tracking_no || "Tracking TBC"}
                </p>
                <p className="fine">
                  ETD {data.shipment.etd || "—"} · ETA {data.shipment.eta || "—"} · {data.shipment.status}
                </p>
                <p>{data.shipment.last_event || "No event yet."}</p>
              </>
            )}
          </section>
        </>
      ) : null}
    </Shell>
  );
}
