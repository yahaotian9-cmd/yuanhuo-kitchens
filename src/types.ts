export type Lang = "en" | "zh" | "ar" | "es" | "ru";

export type L = Record<Lang, string>;

export type MenuId = "coffee" | "fried" | "pizza" | "grill" | "noodle" | "dessert" | "mixed";

export type Platform = "cart" | "trailer" | "truck";

export type Heat = "lpg" | "electric" | "mixed";

export type Market = "eu" | "us" | "uk" | "au" | "gcc" | "other";

export type Tone = "enamel" | "ink" | "bone" | "copper" | "tomato";

export type ZoneKind = "glass" | "cook" | "cold" | "work" | "door" | "panel";

export type Supply = "ours" | "yours";

export type Tri = "yes" | "no" | "unsure";

export type Draft = {
  menu: MenuId;
  platform: Platform;
  length: number;
  market: Market;
  heat: Heat;
  windows: 0 | 1 | 2;
  tone: Tone;
  generator: boolean;
  qty: number;
  shore: Tri;
  gasOk: Tri;
  name: string;
  company: string;
  country: string;
  email: string;
  whatsapp: string;
  note: string;
};

export type PlanDef = {
  columns: string;
  rows: string;
  areas: string;
  cells: { area: string; kind: ZoneKind; name: L }[];
};

export type EquipmentItem = { name: L; supply: Supply };

export const LANGS: { id: Lang; code: string; name: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", code: "EN", name: "English", dir: "ltr" },
  { id: "zh", code: "中文", name: "中文", dir: "ltr" },
  { id: "ar", code: "ع", name: "العربية", dir: "rtl" },
  { id: "es", code: "ES", name: "Español", dir: "ltr" },
  { id: "ru", code: "RU", name: "Русский", dir: "ltr" },
];

export function isLang(value: string | null | undefined): value is Lang {
  return value === "en" || value === "zh" || value === "ar" || value === "es" || value === "ru";
}

/** Build a five-language label from English + Chinese, with optional overrides. */
export function lx(en: string, zh: string, extra?: Partial<L>): L {
  return {
    en,
    zh,
    ar: extra?.ar ?? en,
    es: extra?.es ?? en,
    ru: extra?.ru ?? en,
    ...extra,
  };
}
