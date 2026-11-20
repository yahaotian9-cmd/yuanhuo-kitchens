import { useState } from "react";
import { Link } from "react-router-dom";
import { copy } from "../copy";
import { heatInfo, models, platformInfo, sanitize } from "../data";
import { PageHead } from "../layout";
import { useApp, useTitle } from "../state";
import { axleLine, crewLine, estimate, money, windowLine } from "../spec";
import { Truck } from "../Truck";
import type { Platform } from "../types";

type Filter = "all" | Platform;

export function Models() {
  const { lang } = useApp();
  const text = copy[lang];
  useTitle(text.nav.models);
  const [filter, setFilter] = useState<Filter>("all");
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: text.modelsPage.all },
    { id: "cart", label: text.modelsPage.cart },
    { id: "trailer", label: text.modelsPage.trailer },
    { id: "truck", label: text.modelsPage.truck },
  ];
  const visible = models.filter((model) => filter === "all" || model.preset.platform === filter);

  return (
    <>
      <PageHead kicker={text.modelsPage.kicker} title={text.modelsPage.title} lede={text.modelsPage.lede} />
      <section className="section">
        <div className="wrap">
          <div className="choices" role="group" aria-label={text.modelsPage.kicker}>
            {filters.map((item) => (
              <button key={item.id} type="button" aria-pressed={filter === item.id} className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="lineup">
            {visible.length === 0 ? <p className="lede">{text.modelsPage.empty}</p> : null}
            {visible.map((model) => {
              const spec = sanitize({ ...model.preset, market: "eu", qty: 1, generator: false });
              const band = estimate(spec);
              return (
                <Link key={model.id} to={`/models/${model.id}`} className="model-row">
                  <span className="thumb">
                    <Truck platform={spec.platform} tone={spec.tone} windows={spec.windows} heat={spec.heat} />
                  </span>
                  <span>
                    <h3>{model.name[lang]}</h3>
                    <p>{model.summary[lang]}</p>
                  </span>
                  <span className="row-end">
                    <b>
                      {money(band.low, lang)} – {money(band.high, lang)}
                    </b>
                    <small>
                      {spec.length.toFixed(1)} m · {platformInfo[spec.platform].name[lang]}
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
                {models.map((model) => {
                  const spec = sanitize({ ...model.preset, market: "eu", qty: 1, generator: false });
                  const band = estimate(spec);
                  const axle = axleLine(spec);
                  return (
                    <tr key={model.id}>
                      <th scope="row">
                        <Link to={`/models/${model.id}`}>{model.name[lang]}</Link>
                      </th>
                      <td>{spec.length.toFixed(1)} m</td>
                      <td>{heatInfo[spec.heat][lang]}</td>
                      <td>{windowLine(spec)[lang]}</td>
                      <td>{crewLine(spec)[lang]}</td>
                      <td>{axle ? axle[lang] : "—"}</td>
                      <td>
                        {money(band.low, lang)} – {money(band.high, lang)}
                        {spec.platform === "truck" ? ` · ${text.modelsPage.bodyOnly}` : ""}
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
