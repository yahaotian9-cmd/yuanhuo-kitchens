import { Link } from "react-router-dom";
import { productDraft, productSummary, productTitle, useCatalog } from "../catalog";
import { copy } from "../copy";
import { sales, sanitize } from "../data";
import { Plan } from "../Plan";
import { useApp, useTitle } from "../state";
import { Truck } from "../Truck";
import { money } from "../spec";

const example = sanitize({ menu: "fried", platform: "trailer", length: 5.2, windows: 1, heat: "mixed", tone: "enamel" });

export function Home() {
  const { lang } = useApp();
  const { published } = useCatalog();
  const text = copy[lang];
  useTitle(lang === "zh" ? "定制移动餐车" : "Custom food trucks");
  const brandLine = lang === "zh" ? sales.brandZh : `${sales.brandEn} ${sales.brandSubEn}`;

  return (
    <>
      <section className="hero-banner" aria-label={brandLine}>
        <img className="hero-banner-media" src={sales.bannerSrc} alt="" width={1280} height={720} />
        <div className="hero-banner-shade" aria-hidden="true" />
        <div className="wrap hero-banner-copy">
          <p className="hero-brand">{brandLine}</p>
          <h1>
            {text.hero.titleLead} <em>{text.hero.titleEm}</em> {text.hero.titleTail}
          </h1>
          <p className="lede">{text.hero.lede}</p>
          <div className="actions">
            <Link className="btn btn-lime" to="/build">
              {text.hero.primary}
            </Link>
            <Link className="btn btn-ghost hero-ghost" to="/models">
              {text.hero.secondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="hero-strip" data-reveal>
        <div className="wrap hero-strip-grid">
          {text.hero.stats.map((item) => (
            <div key={item.l}>
              <b>{item.v}</b>
              <span>{item.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" data-reveal>
        <div className="wrap">
          <p className="kicker">{text.lineup.kicker}</p>
          <h2>{text.lineup.title}</h2>
          <p className="lede">{text.lineup.lede}</p>
          <div className="lineup">
            {published.map((item, index) => {
              const spec = productDraft(item);
              return (
                <Link key={item.id} to={`/models/${item.id}`} className="model-row has-index">
                  <span className="idx">{String(index + 1).padStart(2, "0")}</span>
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
                  </span>
                  <span className="row-end">
                    <b>
                      {money(item.priceLow, lang)} – {money(item.priceHigh, lang)}
                    </b>
                    <small>
                      {item.length.toFixed(1)} m
                      {item.platform === "truck" ? ` · ${text.modelsPage.bodyOnly}` : ""}
                    </small>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-tight" data-reveal>
        <div className="wrap notes">
          <div>
            <p className="kicker">{text.notes.kicker}</p>
            <h2>{text.notes.title}</h2>
          </div>
          <ol>
            {text.notes.items.map((item, index) => (
              <li key={item.t}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.t}</h3>
                  <p>{item.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" data-reveal>
        <div className="wrap plan-home">
          <div>
            <p className="kicker">{text.plan.kicker}</p>
            <h2>{text.plan.title}</h2>
            <p className="lede">{text.plan.lede}</p>
            <p className="fine">{text.plan.example}</p>
            <Link className="btn btn-ink" to="/build">
              {text.plan.link}
            </Link>
          </div>
          <Plan draft={example} />
        </div>
      </section>

      <section className="section" data-reveal>
        <div className="wrap">
          <p className="kicker">{text.ship.kicker}</p>
          <h2>{text.ship.title}</h2>
          <div className="ship">
            {text.ship.cards.map((card, index) => (
              <article key={card.t} className={index === 0 ? "ship-lead" : ""}>
                <h3>{card.t}</h3>
                <p>{card.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="close" data-reveal>
        <div className="wrap">
          <h2>{text.close.title}</h2>
          <p className="lede">{text.close.lede}</p>
          <div className="actions">
            <Link className="btn btn-lime" to="/inquiry">
              {text.close.primary}
            </Link>
            <Link className="btn btn-ghost" to="/workshop">
              {text.close.secondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
