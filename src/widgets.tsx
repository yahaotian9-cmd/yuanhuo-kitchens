import { copy } from "./copy";
import { useApp } from "./state";
import { caution, conflict, estimate, money } from "./spec";
import type { Draft } from "./types";

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
            {option.hint ? <small>{option.hint}</small> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Band({ draft }: { draft: Draft }) {
  const { lang } = useApp();
  const text = copy[lang];
  const blocked = conflict(draft);
  const note = caution(draft);
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
    </div>
  );
}
