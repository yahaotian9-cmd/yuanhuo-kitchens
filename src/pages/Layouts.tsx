import { useNavigate } from "react-router-dom";
import { copy } from "../copy";
import { marketInfo, sanitize, studies } from "../data";
import { PageHead } from "../layout";
import { Plan } from "../Plan";
import { useApp, useTitle } from "../state";
import { Truck } from "../Truck";

export function Layouts() {
  const { lang, setDraft } = useApp();
  const text = copy[lang];
  const navigate = useNavigate();
  useTitle(text.nav.layouts);

  return (
    <>
      <PageHead kicker={text.layouts.kicker} title={text.layouts.title} lede={text.layouts.lede} />
      <section className="section">
        <div className="wrap studies">
          {studies.map((study) => {
            const spec = sanitize(study.preset);
            return (
              <article key={study.id}>
                <div className="stage">
                  <Truck platform={spec.platform} tone={spec.tone} windows={spec.windows} heat={spec.heat} />
                </div>
                <p className="kicker">{study.situation[lang]}</p>
                <h2>{study.title[lang]}</h2>
                <p>{study.story[lang]}</p>
                <ul>
                  {study.points.map((point) => (
                    <li key={point.en}>{point[lang]}</li>
                  ))}
                </ul>
                <p className="fine">
                  {marketInfo[spec.market].name[lang]} · {marketInfo[spec.market].power[lang]}
                </p>
                <button
                  type="button"
                  className="btn btn-ink"
                  onClick={() => {
                    setDraft(study.preset);
                    navigate("/build");
                  }}
                >
                  {text.layouts.use}
                </button>
                <Plan draft={spec} />
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
