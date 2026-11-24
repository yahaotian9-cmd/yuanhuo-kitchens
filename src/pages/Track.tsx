import { useState } from "react";
import { ORDER_FLOW, useAdminOrders } from "../catalog";
import { PageHead } from "../layout";
import { useApp, useTitle } from "../state";

export function Track() {
  const { lang } = useApp();
  const { orders } = useAdminOrders();
  const isZh = lang === "zh";
  useTitle(isZh ? "订单进度查询" : "Track your order");

  const [code, setCode] = useState("TH-2401");
  const [email, setEmail] = useState("ana@costa.example");
  const [submitted, setSubmitted] = useState(true);

  const found = submitted
    ? orders.find(
        (o) =>
          o.code.trim().toLowerCase() === code.trim().toLowerCase() &&
          o.email.trim().toLowerCase() === email.trim().toLowerCase(),
      )
    : undefined;

  return (
    <>
      <PageHead
        kicker={isZh ? "订单与物流追踪" : "Order tracking"}
        title={isZh ? "查询生产进度与海运单号" : "Track build progress & shipment"}
        lede={
          isZh
            ? "输入订单编号与下单邮箱，实时查看收款、车间实拍图与海运提单（演示单号 TH-2401 / ana@costa.example）。"
            : "Enter your order code and email to view payments, workshop build photos, and ocean freight updates (sample: TH-2401 / ana@costa.example)."
        }
      />
      <section className="section">
        <div className="wrap">
          <form
            className="adm-card"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="adm-grid-3" style={{ alignItems: "end" }}>
              <label className="adm-field" style={{ marginBottom: 0 }}>
                <span>{isZh ? "订单号 Order code" : "Order code"}</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} required />
              </label>
              <label className="adm-field" style={{ marginBottom: 0 }}>
                <span>{isZh ? "下单邮箱 Email" : "Email"}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <button type="submit" className="btn btn-ink">
                {isZh ? "查询进度" : "Check order"}
              </button>
            </div>
          </form>

          {submitted && !found ? (
            <p className="adm-warn">
              {isZh ? "未找到匹配的订单，请核对订单号与邮箱。" : "No matching order found. Please check your order code and email."}
            </p>
          ) : null}

          {found ? (
            <div className="adm-card">
              <h2 style={{ fontSize: "1.5rem" }}>
                {found.code} · {found.productName}
              </h2>
              <p className="fine">
                {found.customerName} ({found.company || found.country}) · Total ${found.totalUsd.toLocaleString()}
              </p>

              <div className="adm-flow">
                {ORDER_FLOW.map((step, idx) => {
                  const cur = ORDER_FLOW.findIndex((s) => s.id === found.status);
                  const cls = step.id === found.status ? "on" : cur > idx ? "done" : "";
                  return (
                    <span key={step.id} className={cls}>
                      {step.label}
                    </span>
                  );
                })}
              </div>

              <div className="adm-grid-2" style={{ marginTop: "1rem" }}>
                <div>
                  <h3>{isZh ? "收款记录" : "Payments"}</h3>
                  <ul className="adm-list">
                    {found.payments.map((p) => (
                      <li key={p.id}>
                        <b>
                          {p.kind} · ${p.amountUsd.toLocaleString()}
                        </b>
                        <span className="fine">
                          {p.method} · {p.paidAt} · {p.reference}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>{isZh ? "物流与海运信息" : "Logistics"}</h3>
                  <p>
                    <b>{found.shipment.carrier || "—"}</b> · {found.shipment.trackingNo || "—"}
                  </p>
                  <p className="fine">
                    ETD {found.shipment.etd || "—"} · ETA {found.shipment.eta || "—"}
                  </p>
                  <p className="fine">{found.shipment.lastEvent || "—"}</p>
                </div>
              </div>

              {found.media.length > 0 ? (
                <div style={{ marginTop: "1rem" }}>
                  <h3>{isZh ? "车间生产实拍" : "Workshop build photos"}</h3>
                  <div className="adm-gallery">
                    {found.media.map((m) => (
                      <div key={m.id} className="adm-gitem">
                        <img src={m.url} alt={m.title} />
                        <div className="adm-gbar">
                          <span className="fine">{m.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
