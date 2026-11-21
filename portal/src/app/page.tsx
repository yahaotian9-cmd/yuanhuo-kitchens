import Link from "next/link";
import { Shell } from "@/components/Shell";
import { usingSampleDb } from "@/lib/db";
import { FLOW, STATUS_LABEL } from "@/lib/orders";

export default function HomePage() {
  const sample = usingSampleDb();
  return (
    <Shell>
      <section className="hero">
        <p className="fine">Workshop operations</p>
        <h1>Orders, payments, production media, and shipping — in one place.</h1>
        <p className="fine">
          Customers track with order code + email. Your team runs products and production from Admin.
        </p>
        <div className="actions">
          <Link className="btn lime" href="/track">
            Track an order
          </Link>
          <Link className="btn line" href="/admin">
            Open admin
          </Link>
        </div>
      </section>

      {sample ? (
        <p className="warn">
          Sample data mode (no DATABASE_URL on this machine). Publish on Cursor Apps with Postgres for real
          persistence. Local admin password: <code>demo</code>.
        </p>
      ) : null}

      <section className="card">
        <h2>Order flow</h2>
        <div className="flow">
          {FLOW.map((step) => (
            <span key={step}>{STATUS_LABEL[step]}</span>
          ))}
        </div>
        <p className="fine">
          Inquiry → quote → deposit → production → upload photos/videos when ready → ship with tracking → done.
        </p>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h3>Payments</h3>
          <p className="fine">Record deposit, progress, and balance TT payments against each order.</p>
        </article>
        <article className="card">
          <h3>Production media</h3>
          <p className="fine">Upload photos (data URL) or paste video links for the buyer to see.</p>
        </article>
        <article className="card">
          <h3>Logistics</h3>
          <p className="fine">Carrier, tracking number, ETD/ETA, and the latest shipping event.</p>
        </article>
      </section>
    </Shell>
  );
}
