import { useState } from "react";
import { Link } from "react-router-dom";
import { productDraft, productSummary, productTitle, useCatalog } from "../catalog";
import { copy } from "../copy";
import { heatInfo, platformInfo } from "../data";
import { PageHead } from "../layout";
import { useApp, useTitle } from "../state";
import { axleLine, crewLine, money, windowLine } from "../spec";
import { Truck } from "../Truck";
import type { Platform } from "../types";

type Filter = "all" | Platform;

export function Models() {
  const { lang } = useApp();
  const { published } = useCatalog();
  const text = copy[lang];
  useTitle(text.nav.models);
  const [filter, setFilter] = useState<Filter>("all");
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: text.modelsPage.all },
    { id: "cart", label: text.modelsPage.cart },
    { id: "trailer", label: text.modelsPage.trailer },
    { id: "truck", label: text.modelsPage.truck },
  ];
  const visible = published.filter((item) => filter === "all" || item.platform === filter);

  return (
    <>
      <PageHead kicker={text.modelsPage.kicker} title={text.modelsPage.title} lede={text.modelsPage.lede} />
      <section className="section">
        <div className="wrap">
          <div className="choices" role="group" aria-label={text.modelsPage.kicker}>
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                className={filter === item.id ? "on" : ""}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="lineup">
            {visible.length === 0 ? <p className="lede">{text.modelsPage.empty}</p> : null}
            {visible.map((item) => {
              const spec = productDraft(item);
              return (
                <Link key={item.id} to={`/models/${item.id}`} className="model-row">
                  <span className="thumb">
                    {item.coverUrl ? (
                      <img className="thumb-photo" src={item.coverUrl} alt={productTitle(item, lang)} />
                    ) : (
                      <Truck platform={spec.platform} tone={spec.tone} windows={spec.windows} heat={spec.heat} />
                    )}
                  </span>
                  <span>
                    <h3>
                      {productTitle(item, lang)}
                      {item.featured ? <em className="feat-tag">{lang === "zh" ? "推荐" : "Featured"}</em> : null}
                    </h3>
                    <p>{productSummary(item, lang)}</p>
                    {item.compliance.length > 0 ? (
                      <small className="fine">
                        {item.sku} · {item.compliance.join(" / ")} · {item.leadDays}
                      </small>
                    ) : null}
                  </span>
                  <span className="row-end">
                    <b>
                      {money(item.priceLow, lang)} – {money(item.priceHigh, lang)}
                    </b>
                    <small>
                      {item.length.toFixed(1)} m · {platformInfo[item.platform].name[lang]}
                    </small>
                  </span>
                </Link>
              );
            })}
          </div>

          <h2 className="table-title">{text.modelsPage.table}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{text.spec.body}</th>
                  <th scope="col">{text.spec.length}</th>
                  <th scope="col">{text.spec.heat}</th>
                  <th scope="col">{text.spec.windows}</th>
                  <th scope="col">{text.spec.crew}</th>
                  <th scope="col">{text.spec.axle}</th>
                  <th scope="col">{text.spec.band}</th>
                </tr>
              </thead>
              <tbody>
                {published.map((item) => {
                  const spec = productDraft(item);
                  const axle = axleLine(spec);
                  return (
                    <tr key={item.id}>
                      <th scope="row">
                        <Link to={`/models/${item.id}`}>{productTitle(item, lang)}</Link>
                      </th>
                      <td>{item.length.toFixed(1)} m</td>
                      <td>{heatInfo[spec.heat][lang]}</td>
                      <td>{windowLine(spec)[lang]}</td>
                      <td>{crewLine(spec)[lang]}</td>
                      <td>{axle ? axle[lang] : "—"}</td>
                      <td>
                        {money(item.priceLow, lang)} – {money(item.priceHigh, lang)}
                        {item.platform === "truck" ? ` · ${text.modelsPage.bodyOnly}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
