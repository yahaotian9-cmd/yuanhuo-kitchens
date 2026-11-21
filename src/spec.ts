import { heatInfo, kitFor, marketInfo, menuById, platformInfo, sales, toneInfo } from "./data";
import type { Copy } from "./copy";
import { lx, type Draft, type L, type Lang } from "./types";
import { pitchNotes } from "./buyer";

const PRICE = {
  base: { cart: 7000, trailer: 16500, truck: 19800 },
  perMeter: { cart: 1200, trailer: 2800, truck: 2600 },
  minLength: { cart: 1.8, trailer: 4.2, truck: 3.8 },
  heat: { lpg: 1600, electric: 700, mixed: 2300 },
  secondWindow: 1800,
  market: { eu: 0, uk: 350, us: 650, au: 350, gcc: 0, other: 0 },
  menu: { coffee: 400, fried: 700, pizza: 900, grill: 800, noodle: 800, dessert: 600, mixed: 750 },
  longBody: 4000,
  generator: 1900,
  low: 0.9,
  high: 1.15,
};

export type Estimate = { low: number; high: number; daysMin: number; daysMax: number };

export function estimate(draft: Draft): Estimate {
  const platform = draft.platform;
  const meters = Math.max(0, draft.length - PRICE.minLength[platform]);
  let one =
    PRICE.base[platform] +
    meters * PRICE.perMeter[platform] +
    PRICE.heat[draft.heat] +
    PRICE.market[draft.market] +
    PRICE.menu[draft.menu];
  if (draft.windows === 2) one += PRICE.secondWindow;
  if (draft.length >= 7) one += PRICE.longBody;
  if (draft.generator) one += PRICE.generator;
  const mid = one * draft.qty;
  const round = (value: number) => Math.round(value / 100) * 100;
  let days = platform === "cart" ? 18 : draft.length >= 7 ? 45 : 32;
  if (draft.generator) days += 3;
  if (draft.qty > 1) days += 10;
  return { low: round(mid * PRICE.low), high: round(mid * PRICE.high), daysMin: days, daysMax: days + 8 };
}

const cartCook: L = lx("That cook line does not fit a cart. Choose a trailer or a truck body.", "这条出餐线放不进手推车。改成拖车或上车厢。");
const pizzaLen: L = lx("A deck-oven layout needs at least 5.2 m. Lengthen the body, or change the menu.", "甲板烤箱的布局至少要 5.2 米。把车加长，或换菜单。");
const noodleLen: L = lx("A noodle line needs at least 5.2 m for the pots and the pass.", "面档至少要 5.2 米，汤锅和出餐口才放得下。");

export function conflict(draft: Draft): L | null {
  if (draft.platform === "cart" && (draft.menu === "pizza" || draft.menu === "grill" || draft.menu === "noodle")) return cartCook;
  if (draft.menu === "pizza" && draft.length < 5.2) return pizzaLen;
  if (draft.menu === "noodle" && draft.length < 5.2) return noodleLen;
  return null;
}

export function caution(draft: Draft): L | null {
  if (draft.platform === "truck") {
    return lx("This band is the kitchen body. The chassis cab is outside it.", "这个预算带只含厨房厢体，不含底盘驾驶室。");
  }
  if (draft.platform === "cart" && draft.menu === "fried") {
    return lx("A cart fits one countertop fryer, not the two-basket floor line.", "手推车只能放一台台面炸炉，放不下双篮落地炸炉。");
  }
  if (draft.platform === "cart" && draft.heat !== "electric") {
    return lx("LPG on a cart needs a caged bottle and the venue’s approval.", "手推车用液化气，气瓶要进笼子，场地也得允许。");
  }
  return null;
}

export function waterLine(draft: Draft): L {
  if (draft.platform === "cart") return lx("Fresh 25 L and waste 25 L", "清水 25 升，污水 25 升");
  if (draft.length >= 7) return lx("Fresh 120 L and waste 120 L", "清水 120 升，污水 120 升");
  if (draft.length >= 5.8) return lx("Fresh 100 L and waste 100 L", "清水 100 升，污水 100 升");
  return lx("Fresh 80 L and waste 80 L", "清水 80 升，污水 80 升");
}

export function crewLine(draft: Draft): L {
  if (draft.platform === "cart") return lx("1 person", "1 人");
  if (draft.windows === 2 || draft.length >= 7) return lx("3 to 4 people", "3 到 4 人");
  return lx("2 to 3 people", "2 到 3 人");
}

export function axleLine(draft: Draft): L | null {
  if (draft.platform !== "trailer") return null;
  if (draft.length <= 4.5) return lx("Single axle", "单轴");
  return lx("Tandem axle", "双轴");
}

export function windowLine(draft: Draft): L {
  if (draft.windows === 0) return lx("No service window", "无售卖窗");
  if (draft.windows === 2) return lx("Two windows, opposite sides", "双侧窗口");
  return lx("One service window", "一个售卖窗");
}

export function money(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : lang === "ar" ? "ar" : lang === "es" ? "es" : lang === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function contactError(draft: Draft, text: Copy): string | null {
  if (!draft.name.trim()) return text.errName;
  if (!draft.country.trim()) return text.errCountry;
  if (!draft.email.trim() && !draft.whatsapp.trim()) return text.errContact;
  if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return text.errEmail;
  return null;
}

function line(label: string, value: string) {
  return `${label}: ${value}`;
}

export function sheetText(draft: Draft, lang: Lang, text: Copy) {
  const t = (item: L) => item[lang];
  const menu = menuById(draft.menu);
  const blocked = conflict(draft);
  const warn = caution(draft);
  const est = estimate(draft);
  const axle = axleLine(draft);
  const rows = [
    line(text.spec.menu, t(menu.name)),
    line(text.spec.body, t(platformInfo[draft.platform].name)),
    line(text.spec.length, `${draft.length.toFixed(1)} m`),
    line(text.spec.width, t(platformInfo[draft.platform].width)),
    axle ? line(text.spec.axle, t(axle)) : "",
    line(text.spec.market, `${t(marketInfo[draft.market].name)} · ${t(marketInfo[draft.market].power)}`),
    line(text.spec.heat, t(heatInfo[draft.heat])),
    line(text.spec.windows, t(windowLine(draft))),
    line(text.spec.color, t(toneInfo[draft.tone])),
    line(text.spec.generator, draft.generator ? text.yes : text.no),
    line(text.spec.shore, draft.shore === "yes" ? text.yes : draft.shore === "no" ? text.no : text.unsure),
    line(text.spec.gasOk, draft.gasOk === "yes" ? text.yes : draft.gasOk === "no" ? text.no : text.unsure),
    line(text.spec.qty, String(draft.qty)),
    line(text.spec.crew, t(crewLine(draft))),
    line(text.spec.water, t(waterLine(draft))),
    line(text.spec.port, t(sales.port)),
  ].filter(Boolean);

  const ours = kitFor(draft).filter((item) => item.supply === "ours");
  const yours = kitFor(draft).filter((item) => item.supply === "yours");
  const pitch = pitchNotes(draft);
  const band = blocked
    ? t(blocked)
    : `${money(est.low, lang)} – ${money(est.high, lang)} (${text.bandNote})`;
  const lead = blocked ? "" : `${text.spec.lead}: ${est.daysMin}–${est.daysMax} ${text.daysWord}. ${text.leadNote}`;

  const buyer = [
    line(text.fields.name, draft.name.trim() || "—"),
    line(text.fields.company, draft.company.trim() || "—"),
    line(text.fields.country, draft.country.trim() || "—"),
    line(text.fields.email, draft.email.trim() || "—"),
    line(text.fields.whatsapp, draft.whatsapp.trim() || "—"),
    draft.note.trim() ? line(text.fields.note, draft.note.trim()) : "",
  ].filter(Boolean);

  return [
    `${sales.brandEn} ${sales.brandZh}`,
    text.sheetTitle,
    new Date().toISOString().slice(0, 10),
    "",
    ...rows,
    "",
    `${text.spec.band}: ${band}`,
    lead,
    warn ? t(warn) : "",
    ...pitch.map((item) => t(item)),
    "",
    text.build.fitted,
    ...ours.map((item) => `- ${t(item.name)}`),
    ...(yours.length ? ["", text.build.yours, ...yours.map((item) => `- ${t(item.name)}`)] : []),
    "",
    text.buyer,
    ...buyer,
    "",
    text.outsideTitle,
    ...text.outside.map((item) => `- ${item}`),
    "",
    t(platformInfo[draft.platform].note),
  ]
    .filter((item) => item.length > 0)
    .join("\n");
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "true");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function downloadText(filename: string, value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function mailHref(draft: Draft, lang: Lang, text: Copy) {
  if (!sales.email) return "";
  const menu = menuById(draft.menu).name[lang];
  const subject = `${text.mailSubject} — ${menu} ${draft.length.toFixed(1)}m`;
  return `mailto:${sales.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(sheetText(draft, lang, text))}`;
}

export function whatsAppHref(draft: Draft, lang: Lang, text: Copy) {
  const number = sales.whatsappE164.replace(/\D/g, "");
  if (number.length < 8) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(sheetText(draft, lang, text))}`;
}
