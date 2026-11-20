import { plans } from "./data";
import { copy } from "./copy";
import { useApp } from "./state";
import type { Draft, L } from "./types";

const legend: { kind: string; name: L }[] = [
  { kind: "cook", name: { en: "Cook", zh: "加热" } },
  { kind: "cold", name: { en: "Cold", zh: "冷藏" } },
  { kind: "work", name: { en: "Work", zh: "操作" } },
  { kind: "glass", name: { en: "Window", zh: "窗口" } },
];

const closed: L = { en: "Closed side", zh: "封板侧" };

export function Plan({ draft }: { draft: Draft }) {
  const { lang } = useApp();
  const text = copy[lang];
  const plan = plans[draft.menu];

  return (
    <div className="plan-block">
      <p className="queue">{text.plan.queue}</p>
      <div
        className="plan"
        style={{
          gridTemplateColumns: plan.columns,
          gridTemplateRows: plan.rows,
          gridTemplateAreas: plan.areas,
        }}
      >
        {plan.cells.map((cell) => {
          const shut = cell.area === "win" && draft.windows === 0;
          return (
            <div key={cell.area} className={`zone ${shut ? "panel" : cell.kind}`} style={{ gridArea: cell.area }}>
              <span>{shut ? closed[lang] : cell.name[lang]}</span>
            </div>
          );
        })}
      </div>
      {draft.windows === 2 ? <p className="fine">{text.plan.opposite}</p> : null}
      <ul className="legend">
        {legend.map((item) => (
          <li key={item.kind}>
            <i className={item.kind} />
            {item.name[lang]}
          </li>
        ))}
      </ul>
    </div>
  );
}
