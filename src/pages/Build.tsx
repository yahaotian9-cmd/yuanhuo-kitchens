import { Link } from "react-router-dom";
import { copy } from "../copy";
import { heatInfo, kitFor, lengths, marketInfo, menus, platformInfo, toneInfo, tonePaint } from "../data";
import { PageHead } from "../layout";
import { Plan } from "../Plan";
import { downloadText, sheetText } from "../spec";
import { useApp, useTitle } from "../state";
import { Truck } from "../Truck";
import type { Heat, Market, MenuId, Platform, Tone } from "../types";
import { Band, BuyerTools, Choice } from "../widgets";

export function Build() {
  const { lang, draft, setDraft, resetTruck } = useApp();
  const text = copy[lang];
  useTitle(text.nav.build);
  const lengthOptions = lengths[draft.platform];
  const windowOptions =
    draft.platform === "cart"
      ? [
          { id: "0", label: text.windows.none },
          { id: "1", label: text.windows.one },
        ]
      : [
          { id: "0", label: text.windows.none },
          { id: "1", label: text.windows.one },
          { id: "2", label: text.windows.two },
        ];

  return (
    <>
      <PageHead kicker={text.build.kicker} title={text.build.title} lede={text.build.lede} />
      <section className="section">
        <div className="wrap build">
          <aside className="summary">
            <div className="stage">
              <Truck platform={draft.platform} tone={draft.tone} windows={draft.windows} heat={draft.heat} />
            </div>
            <Band draft={draft} />
            <div className="actions">
              <Link className="btn btn-ink" to="/inquiry">
                {text.build.continue}
              </Link>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => downloadText("yuanhuo-spec.txt", sheetText(draft, lang, text))}
              >
                {text.build.download}
              </button>
            </div>
            <button type="button" className="text-btn" onClick={resetTruck}>
              {text.build.reset}
            </button>
          </aside>

          <form className="controls" onSubmit={(event) => event.preventDefault()}>
            <Choice
              legend={text.legends.menu}
              value={draft.menu}
              options={menus.map((item) => ({ id: item.id, label: item.name[lang], hint: item.blurb[lang] }))}
              onChange={(id) => setDraft({ menu: id as MenuId })}
            />
            <Choice
              legend={text.legends.platform}
              value={draft.platform}
              options={(Object.keys(platformInfo) as Platform[]).map((id) => ({
                id,
                label: platformInfo[id].name[lang],
                hint: platformInfo[id].width[lang],
              }))}
              onChange={(id) => setDraft({ platform: id as Platform })}
            />
            <Choice
              legend={text.legends.length}
              value={String(draft.length)}
              options={lengthOptions.map((length) => ({ id: String(length), label: `${length.toFixed(1)} m` }))}
              onChange={(id) => setDraft({ length: Number(id) })}
            />
            <Choice
              legend={text.legends.market}
              value={draft.market}
              options={(Object.keys(marketInfo) as Market[]).map((id) => ({
                id,
                label: marketInfo[id].name[lang],
                hint: marketInfo[id].power[lang],
              }))}
              onChange={(id) => setDraft({ market: id as Market })}
            />
            <Choice
              legend={text.legends.heat}
              value={draft.heat}
              options={(Object.keys(heatInfo) as Heat[]).map((id) => ({ id, label: heatInfo[id][lang] }))}
              onChange={(id) => setDraft({ heat: id as Heat })}
            />
            <Choice
              legend={text.legends.windows}
              value={String(draft.windows)}
              options={windowOptions}
              onChange={(id) => setDraft({ windows: Number(id) as 0 | 1 | 2 })}
            />
            <fieldset>
              <legend>{text.legends.tone}</legend>
              <div className="swatches">
                {(Object.keys(toneInfo) as Tone[]).map((id) => (
                  <button
                    type="button"
                    key={id}
                    className={draft.tone === id ? "swatch on" : "swatch"}
                    style={{ background: tonePaint[id].body }}
                    aria-pressed={draft.tone === id}
                    aria-label={toneInfo[id][lang]}
                    onClick={() => setDraft({ tone: id })}
                  />
                ))}
              </div>
            </fieldset>
            <Choice
              legend={text.legends.generator}
              value={draft.generator ? "yes" : "no"}
              options={[
                { id: "no", label: text.no },
                { id: "yes", label: text.yes },
              ]}
              onChange={(id) => setDraft({ generator: id === "yes" })}
            />
            <fieldset>
              <legend>{text.legends.qty}</legend>
              <input
                type="number"
                min={1}
                max={20}
                value={draft.qty}
                onChange={(event) => setDraft({ qty: Number(event.target.value) })}
              />
            </fieldset>

            <div className="split-lists">
              <div>
                <h2>{text.build.fitted}</h2>
                <ul>
                  {kitFor(draft)
                    .filter((item) => item.supply === "ours")
                    .map((item) => (
                      <li key={item.name.en}>{item.name[lang]}</li>
                    ))}
                </ul>
              </div>
              <div>
                <h2>{text.build.yours}</h2>
                <ul>
                  {kitFor(draft)
                    .filter((item) => item.supply === "yours")
                    .map((item) => (
                      <li key={item.name.en}>{item.name[lang]}</li>
                    ))}
                </ul>
                {kitFor(draft).every((item) => item.supply !== "yours") ? <p className="fine">—</p> : null}
              </div>
            </div>

            <h2>{text.build.layout}</h2>
            <Plan draft={draft} />
            <BuyerTools draft={draft} />
          </form>
        </div>
      </section>
    </>
  );
}
