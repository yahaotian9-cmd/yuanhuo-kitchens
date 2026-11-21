import { useState } from "react";
import { copy } from "../copy";
import { PageHead } from "../layout";
import { contactError, copyText, downloadText, mailHref, sheetText, whatsAppHref } from "../spec";
import { useApp, useTitle } from "../state";
import { Band } from "../widgets";
import { Truck } from "../Truck";

export function Inquiry() {
  const { lang, draft, setDraft } = useApp();
  const text = copy[lang];
  useTitle(text.nav.inquiry);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const sheet = sheetText(draft, lang, text);
  const mail = mailHref(draft, lang, text);
  const whatsapp = whatsAppHref(draft, lang, text);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problem = contactError(draft, text);
    setError(problem);
    if (problem) {
      setStatus("idle");
      return;
    }
    const ok = await copyText(sheet);
    setStatus(ok ? "copied" : "manual");
  }

  return (
    <>
      <PageHead kicker={text.inquiry.kicker} title={text.inquiry.title} lede={text.inquiry.lede} />
      <section className="section">
        <div className="wrap inquiry">
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <label>
                {text.fields.name}
                <input
                  value={draft.name}
                  placeholder={text.fields.namePh}
                  autoComplete="name"
                  maxLength={120}
                  onChange={(event) => setDraft({ name: event.target.value })}
                />
              </label>
              <label>
                {text.fields.company}
                <input
                  value={draft.company}
                  placeholder={text.fields.companyPh}
                  autoComplete="organization"
                  maxLength={160}
                  onChange={(event) => setDraft({ company: event.target.value })}
                />
              </label>
              <label>
                {text.fields.country}
                <input
                  value={draft.country}
                  placeholder={text.fields.countryPh}
                  autoComplete="country-name"
                  maxLength={80}
                  onChange={(event) => setDraft({ country: event.target.value })}
                />
              </label>
              <label>
                {text.fields.email}
                <input
                  type="email"
                  value={draft.email}
                  placeholder={text.fields.emailPh}
                  autoComplete="email"
                  maxLength={160}
                  onChange={(event) => setDraft({ email: event.target.value })}
                />
              </label>
              <label>
                {text.fields.whatsapp}
                <input
                  value={draft.whatsapp}
                  placeholder={text.fields.whatsappPh}
                  autoComplete="tel"
                  maxLength={40}
                  onChange={(event) => setDraft({ whatsapp: event.target.value })}
                />
              </label>
            </div>
            <label>
              {text.fields.note}
              <textarea
                value={draft.note}
                placeholder={text.fields.notePh}
                maxLength={2000}
                onChange={(event) => setDraft({ note: event.target.value })}
              />
            </label>
            {error ? (
              <p className="warn" role="alert">
                {error}
              </p>
            ) : null}
            {status === "copied" ? <p className="ok">{text.inquiry.copied}</p> : null}
            {status === "manual" ? <p className="warn">{text.inquiry.manual}</p> : null}
            <div className="actions">
              <button type="submit" className="btn btn-ink">
                {text.inquiry.submit}
              </button>
              <button type="button" className="btn btn-line" onClick={() => downloadText("taihong-inquiry.txt", sheet)}>
                {text.inquiry.download}
              </button>
              {mail ? (
                <a className="btn btn-line" href={mail}>
                  {text.inquiry.email}
                </a>
              ) : null}
              {whatsapp ? (
                <a className="btn btn-line" href={whatsapp} target="_blank" rel="noreferrer">
                  {text.inquiry.whatsapp}
                </a>
              ) : null}
            </div>
          </form>
          <aside>
            <div className="stage">
              <Truck platform={draft.platform} tone={draft.tone} windows={draft.windows} heat={draft.heat} />
            </div>
            <Band draft={draft} />
            <h2>{text.inquiry.nextTitle}</h2>
            <ol className="next">
              {text.inquiry.next.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <pre className="spec-pre">{sheet}</pre>
          </aside>
        </div>
      </section>
    </>
  );
}
