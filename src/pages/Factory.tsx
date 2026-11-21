import { copy } from "../copy";
import { PageHead } from "../layout";
import { useApp, useTitle } from "../state";

export function Factory() {
  const { lang } = useApp();
  const text = copy[lang];
  useTitle(text.nav.workshop);
  const page = text.factory;

  return (
    <>
      <PageHead kicker={page.kicker} title={page.title} lede={page.lede} />
      <section className="section">
        <div className="wrap steps">
          {page.steps.map((step, index) => (
            <article key={step.t}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div>
                <h2>{step.t}</h2>
                <p>{step.d}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="wrap factory-grid">
          <article>
            <h2>{page.docsTitle}</h2>
            <ul>
              {page.docs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="ink-card">
            <h2>{page.notTitle}</h2>
            <ul>
              {page.not.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="pay-card">
            <h2>{page.payTitle}</h2>
            <p>{page.pay}</p>
          </article>
        </div>
        <div className="wrap faqs">
          <h2>{page.faqTitle}</h2>
          {page.faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
