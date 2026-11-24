import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productDraft, productSummary, productTitle, useCatalog } from "../catalog";
import { copy } from "../copy";
import { heatInfo, kitFor, platformInfo } from "../data";
import { PageHead } from "../layout";
import { Plan } from "../Plan";
import { useApp, useTitle } from "../state";
import { crewLine, money, waterLine, windowLine } from "../spec";
import { Truck } from "../Truck";

export function ModelDetail() {
  const { id } = useParams();
  const { all } = useCatalog();
  const item = id ? all.find((p) => p.id === id || p.slug === id) : undefined;
  const { lang, setDraft } = useApp();
  const text = copy[lang];
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState<string>("");

  useTitle(item ? productTitle(item, lang) : text.missing.title);

  if (!item) {
    return <PageHead kicker={text.nav.models} title={text.missing.title} lede={text.missing.lede} />;
  }

  const spec = productDraft(item);
  const ours = kitFor(spec).filter((row) => row.supply === "ours");
  const yours = kitFor(spec).filter((row) => row.supply === "yours");
  const photos = item.gallery.length > 0 ? item.gallery : item.coverUrl ? [item.coverUrl] : [];
  const mainPhoto = activePhoto && photos.includes(activePhoto) ? activePhoto : item.coverUrl || photos[0] || "";

  function take(path: "/build" | "/inquiry") {
    setDraft({ ...spec, generator: false });
    navigate(path);
  }

  return (
    <>
      <PageHead
        kicker={`${platformInfo[spec.platform].name[lang]} · ${item.sku}`}
        title={productTitle(item, lang)}
        lede={productSummary(item, lang)}
      />
      <section className="section">
        <div className="wrap detail">
          <figure>
            <div className="stage">
              {mainPhoto ? (
                <img className="stage-photo" src={mainPhoto} alt={productTitle(item, lang)} />
              ) : (
                <Truck platform={spec.platform} tone={spec.tone} windows={spec.windows} heat={spec.heat} />
              )}
            </div>
            {photos.length > 1 ? (
              <div className="detail-thumbs">
                {photos.map((url, idx) => (
                  <button
                    key={`${url.slice(0, 24)}-${idx}`}
                    type="button"
                    className={url === mainPhoto ? "on" : ""}
                    onClick={() => setActivePhoto(url)}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
            <figcaption>
              {item.length.toFixed(1)} × {item.width.toFixed(1)} × {item.height.toFixed(1)} m · {heatInfo[spec.heat][lang]} ·{" "}
              {windowLine(spec)[lang]}
            </figcaption>
          </figure>
          <div className="detail-copy">
            <p className="band">
              {money(item.priceLow, lang)} – {money(item.priceHigh, lang)}
            </p>
            <p className="fine">
              {text.bandNote}. MOQ {item.moq} · {item.leadDays}
              {item.compliance.length > 0 ? ` · ${item.compliance.join(", ")}` : ""}
            </p>
            <dl className="facts">
              <div>
                <dt>{text.spec.crew}</dt>
                <dd>{crewLine(spec)[lang]}</dd>
              </div>
              <div>
                <dt>{text.spec.water}</dt>
                <dd>{waterLine(spec)[lang]}</dd>
              </div>
              <div>
                <dt>{text.spec.width}</dt>
                <dd>{item.width.toFixed(1)} m</dd>
              </div>
            </dl>
            <p>{item.description || platformInfo[spec.platform].note[lang]}</p>
            {item.specs.length > 0 ? (
              <ul className="detail-specs">
                {item.specs.map((row, idx) => (
                  <li key={idx}>
                    <span>{row.k}</span>
                    <b>{row.v}</b>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="actions">
              <button type="button" className="btn btn-ink" onClick={() => take("/build")}>
                {text.detail.configure}
              </button>
              <button type="button" className="btn btn-line" onClick={() => take("/inquiry")}>
                {text.detail.inquire}
              </button>
            </div>
            <p>
              <Link to="/models">{text.detail.back}</Link>
            </p>
          </div>
        </div>
        <div className="wrap split-lists">
          <div>
            <h2>{text.build.fitted}</h2>
            <ul>
              {ours.map((row) => (
                <li key={row.name.en}>{row.name[lang]}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{text.build.yours}</h2>
            {yours.length === 0 ? <p className="fine">—</p> : null}
            <ul>
              {yours.map((row) => (
                <li key={row.name.en}>{row.name[lang]}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="wrap plan-section">
          <h2>{text.detail.layout}</h2>
          <Plan draft={spec} />
        </div>
      </section>
    </>
  );
}
