import { Link, useNavigate, useParams } from "react-router-dom";
import { copy } from "../copy";
import { heatInfo, kitFor, modelById, platformInfo, sanitize } from "../data";
import { PageHead } from "../layout";
import { Plan } from "../Plan";
import { useApp, useTitle } from "../state";
import { crewLine, estimate, money, waterLine, windowLine } from "../spec";
import { Truck } from "../Truck";

export function ModelDetail() {
  const { id } = useParams();
  const model = id ? modelById(id) : undefined;
  const { lang, setDraft } = useApp();
  const text = copy[lang];
  const navigate = useNavigate();
  useTitle(model ? model.name[lang] : text.missing.title);

  if (!model) {
    return (
      <PageHead kicker={text.nav.models} title={text.missing.title} lede={text.missing.lede} />
    );
  }

  const spec = sanitize({ ...model.preset, market: "eu", qty: 1, generator: false });
  const band = estimate(spec);
  const ours = kitFor(spec).filter((item) => item.supply === "ours");
  const yours = kitFor(spec).filter((item) => item.supply === "yours");

  function take(path: "/build" | "/inquiry") {
    setDraft({ ...model!.preset, generator: false });
    navigate(path);
  }

  return (
    <>
      <PageHead kicker={platformInfo[spec.platform].name[lang]} title={model.name[lang]} lede={model.summary[lang]} />
      <section className="section">
        <div className="wrap detail">
          <figure>
            <div className="stage">
              <Truck platform={spec.platform} tone={spec.tone} windows={spec.windows} heat={spec.heat} />
            </div>
            <figcaption>
              {spec.length.toFixed(1)} m · {heatInfo[spec.heat][lang]} · {windowLine(spec)[lang]}
            </figcaption>
          </figure>
          <div className="detail-copy">
            <p className="band">
              {money(band.low, lang)} – {money(band.high, lang)}
            </p>
            <p className="fine">{text.bandNote}. {text.modelsPage.lede}</p>
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
                <dd>{platformInfo[spec.platform].width[lang]}</dd>
              </div>
            </dl>
            <p>{platformInfo[spec.platform].note[lang]}</p>
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
              {ours.map((item) => (
                <li key={item.name.en}>{item.name[lang]}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{text.build.yours}</h2>
            {yours.length === 0 ? <p className="fine">—</p> : null}
            <ul>
              {yours.map((item) => (
                <li key={item.name.en}>{item.name[lang]}</li>
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
