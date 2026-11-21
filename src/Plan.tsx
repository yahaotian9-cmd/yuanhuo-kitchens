import { plans } from "./data";
import { copy } from "./copy";
import { useApp } from "./state";
import { lx, type Draft, type L } from "./types";

const legend: { kind: string; name: L }[] = [
  { kind: "cook", name: lx("Cook", "加热", { ar: "طبخ", es: "Cocción", ru: "Готовка" }) },
  { kind: "cold", name: lx("Cold", "冷藏", { ar: "تبريد", es: "Frío", ru: "Холод" }) },
  { kind: "work", name: lx("Work", "操作", { ar: "عمل", es: "Trabajo", ru: "Работа" }) },
  { kind: "glass", name: lx("Window", "窗口", { ar: "نافذة", es: "Ventana", ru: "Окно" }) },
];

const closed: L = lx("Closed side", "封板侧", { ar: "جانب مغلق", es: "Lado cerrado", ru: "Закрытая сторона" });

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
