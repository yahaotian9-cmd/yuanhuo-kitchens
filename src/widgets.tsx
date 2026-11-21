import { copy } from "./copy";
import { openQuestions, pitchNotes } from "./buyer";
import { shareUrl, useApp } from "./state";
import { caution, conflict, copyText, estimate, money } from "./spec";
import type { Draft, Tri } from "./types";
import { useState } from "react";

export function Choice({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: string;
  options: { id: string; label: string; hint?: string }[];
  onChange: (id: string) => void;
}) {
  const selected = options.find((option) => option.id === value);
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choices">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={value === option.id}
            className={value === option.id ? "on" : ""}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selected?.hint ? <p className="choice-hint">{selected.hint}</p> : null}
    </fieldset>
  );
}

export function Band({ draft }: { draft: Draft }) {
  const { lang } = useApp();
  const text = copy[lang];
  const blocked = conflict(draft);
  const note = caution(draft);
  const pitch = pitchNotes(draft);
  const est = estimate(draft);

  if (blocked) {
    return (
      <p className="warn" role="status">
        {blocked[lang]}
      </p>
    );
  }

  return (
    <div aria-live="polite">
      <p className="band">
        {money(est.low, lang)} – {money(est.high, lang)}
      </p>
      <p className="fine">{text.bandNote}</p>
      <p className="fine">
        {est.daysMin}–{est.daysMax} {text.daysWord}. {text.leadNote}
      </p>
      {note ? <p className="caution">{note[lang]}</p> : null}
      {pitch.map((item) => (
        <p className="caution" key={item.en}>
          {item[lang]}
        </p>
      ))}
    </div>
  );
}

export function BuyerTools({ draft }: { draft: Draft }) {
  const { lang, setDraft } = useApp();
  const text = copy[lang];
  const [shareStatus, setShareStatus] = useState<"idle" | "ok" | "fail">("idle");
  const questions = openQuestions(draft, lang);
  const link = typeof window !== "undefined" ? shareUrl(draft) : "";

  async function onShare() {
    const ok = await copyText(link);
    setShareStatus(ok ? "ok" : "fail");
  }

  function tri(legend: string, value: Tri, key: "shore" | "gasOk") {
    return (
      <Choice
        legend={legend}
        value={value}
        options={[
          { id: "yes", label: text.yes },
          { id: "no", label: text.no },
          { id: "unsure", label: text.unsure },
        ]}
        onChange={(id) => setDraft({ [key]: id as Tri })}
      />
    );
  }

  return (
    <section className="buyer-tools">
      <h2>{text.build.buyerTools}</h2>

      <div className="tool-block">
        <h3>{text.build.moneyTitle}</h3>
        <div className="money-grid">
          <div>
            <p className="kicker">{text.build.moneyIn}</p>
            <ul>
              {text.moneyIn.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker">{text.build.moneyOut}</p>
            <ul>
              {text.moneyOut.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="tool-block">
        <h3>{text.build.pitchTitle}</h3>
        <p className="fine">{text.build.pitchLede}</p>
        {tri(text.build.shore, draft.shore, "shore")}
        {tri(text.build.gasOk, draft.gasOk, "gasOk")}
      </div>

      <div className="tool-block">
        <h3>{text.build.openTitle}</h3>
        {questions.length === 0 ? (
          <p className="ok">{text.build.openEmpty}</p>
        ) : (
          <ol className="open-list">
            {questions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        )}
      </div>

      <div className="tool-block">
        <div className="actions">
          <button type="button" className="btn btn-line" onClick={onShare}>
            {text.build.share}
          </button>
        </div>
        {shareStatus === "ok" ? <p className="ok">{text.build.shared}</p> : null}
        {shareStatus === "fail" ? <p className="warn">{text.build.shareFail}</p> : null}
        <p className="share-url">{link}</p>
      </div>
    </section>
  );
}
