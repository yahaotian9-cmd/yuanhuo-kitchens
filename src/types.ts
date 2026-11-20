export type Lang = "en" | "zh";

export type L = { en: string; zh: string };

export type MenuId = "coffee" | "fried" | "pizza" | "grill" | "noodle" | "dessert" | "mixed";

export type Platform = "cart" | "trailer" | "truck";

export type Heat = "lpg" | "electric" | "mixed";

export type Market = "eu" | "us" | "uk" | "au" | "gcc" | "other";

export type Tone = "enamel" | "ink" | "bone" | "copper" | "tomato";

export type ZoneKind = "glass" | "cook" | "cold" | "work" | "door" | "panel";

export type Supply = "ours" | "yours";

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
