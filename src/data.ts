import type { Draft, EquipmentItem, Heat, L, Market, MenuId, PlanDef, Platform, Tone } from "./types";

/**
 * Starter brand for a custom food-truck exporter.
 * Replace `sales` before sending the site to buyers.
 * Leave whatsappE164 empty until you have a real number — do not invent one.
 */
export const sales = {
  brandEn: "YUANHUO",
  brandZh: "原火",
  email: "",
  whatsappE164: "",
  yard: { en: "Weifang, Shandong, China", zh: "中国山东潍坊" } as L,
  port: { en: "FOB Qingdao", zh: "青岛港 FOB" } as L,
};

export const tonePaint: Record<Tone, { body: string; trim: string }> = {
  enamel: { body: "#1c4a38", trim: "#10281f" },
  ink: { body: "#26231e", trim: "#14120e" },
  bone: { body: "#e6dcc8", trim: "#c9bba4" },
  copper: { body: "#b85a2e", trim: "#7c3a1c" },
  tomato: { body: "#8f2e22", trim: "#5e1c16" },
};

export const lengths: Record<Platform, number[]> = {
  cart: [1.8, 2.2, 2.6],
  trailer: [4.2, 5.2, 6.0, 7.2, 8.5],
  truck: [3.8, 4.5, 5.2, 6.2],
};

export const defaultDraft: Draft = {
  menu: "fried",
  platform: "trailer",
  length: 5.2,
  market: "eu",
  heat: "mixed",
  windows: 1,
  tone: "enamel",
  generator: false,
  qty: 1,
  name: "",
  company: "",
  country: "",
  email: "",
  whatsapp: "",
  note: "",
};

const menuIds: MenuId[] = ["coffee", "fried", "pizza", "grill", "noodle", "dessert", "mixed"];
const platforms: Platform[] = ["cart", "trailer", "truck"];
const heats: Heat[] = ["lpg", "electric", "mixed"];
const markets: Market[] = ["eu", "us", "uk", "au", "gcc", "other"];
const tones: Tone[] = ["enamel", "ink", "bone", "copper", "tomato"];
const textKeys = ["name", "company", "country", "email", "whatsapp", "note"] as const;

export function sanitize(input: Partial<Draft> | null | undefined): Draft {
  const next: Draft = { ...defaultDraft, ...(input ?? {}) };
  if (!menuIds.includes(next.menu)) next.menu = defaultDraft.menu;
  if (!platforms.includes(next.platform)) next.platform = defaultDraft.platform;
  if (!heats.includes(next.heat)) next.heat = defaultDraft.heat;
  if (!markets.includes(next.market)) next.market = defaultDraft.market;
  if (!tones.includes(next.tone)) next.tone = defaultDraft.tone;
  if (next.windows !== 0 && next.windows !== 1 && next.windows !== 2) next.windows = 1;
  if (next.platform === "cart" && next.windows > 1) next.windows = 1;
  if (!lengths[next.platform].includes(next.length)) {
    const options = lengths[next.platform];
    next.length = options[Math.min(1, options.length - 1)];
  }
  const qty = Math.round(Number(next.qty));
  next.qty = Number.isFinite(qty) ? Math.min(20, Math.max(1, qty)) : 1;
  next.generator = next.generator === true;
  for (const key of textKeys) {
    if (typeof next[key] !== "string") next[key] = "";
  }
  return next;
}

export const menus: { id: MenuId; name: L; blurb: L }[] = [
  {
    id: "coffee",
    name: { en: "Coffee", zh: "咖啡" },
    blurb: { en: "Filter, cups, and a shelf for your own machine.", zh: "过滤、杯子，和一台你自备咖啡机的位子。" },
  },
  {
    id: "fried",
    name: { en: "Fried chicken", zh: "炸鸡" },
    blurb: { en: "Fryers behind the pack station, fridge by the door.", zh: "炸炉在出餐台后面，冷藏靠门。" },
  },
  {
    id: "pizza",
    name: { en: "Pizza", zh: "披萨" },
    blurb: { en: "Oven space and a makeup bench. The oven is quoted on the drawing.", zh: "留出烤箱位和制作台。烤箱在图纸上另计。" },
  },
  {
    id: "grill",
    name: { en: "Grill", zh: "烧烤" },
    blurb: { en: "Flat top at the window so the food is the sign.", zh: "铁板对着窗口，菜本身就是招牌。" },
  },
  {
    id: "noodle",
    name: { en: "Noodles", zh: "面档" },
    blurb: { en: "Stock, a boiler, and room to face the bowl.", zh: "高汤、煮面和面对碗的操作位。" },
  },
  {
    id: "dessert",
    name: { en: "Dessert", zh: "甜品" },
    blurb: { en: "A cold cabinet you bring, and a topping rail we fit.", zh: "冷柜你带，淋酱台我们装。" },
  },
  {
    id: "mixed",
    name: { en: "Mixed street menu", zh: "混合街食" },
    blurb: { en: "Flat top, one fryer, fridge. The usual first truck.", zh: "铁板、一台炸炉、冷藏。第一辆车最常见的组合。" },
  },
];

export const platformInfo: Record<Platform, { name: L; note: L; width: L }> = {
  cart: {
    name: { en: "Cart", zh: "手推车" },
    width: { en: "About 1.7 m wide", zh: "宽约 1.7 米" },
    note: {
      en: "A cart is not a road trailer. It stays on a pitch that already has power.",
      zh: "手推车不是上路的拖车。它停在已经有电的场地里。",
    },
  },
  trailer: {
    name: { en: "Trailer", zh: "拖车" },
    width: { en: "About 2.1 m wide", zh: "宽约 2.1 米" },
    note: {
      en: "The usual export. Hitch is a 50 mm ball unless the drawing says otherwise. Registration in your country stays with you.",
      zh: "最常出口的一种。拖钩默认 50 毫米球头，图纸另有说明除外。在你国家上牌，由你来办。",
    },
  },
  truck: {
    name: { en: "Truck body", zh: "上车厢体" },
    width: { en: "Body width follows the chassis, usually 2.0–2.2 m", zh: "厢宽跟着底盘走，通常 2.0–2.2 米" },
    note: {
      en: "This is a kitchen body, not a chassis cab. Many countries will not register a chassis built in China. If you already have a truck, send the frame width and the cab-to-axle length before we draw.",
      zh: "这是厨房厢体，不是带驾驶室的底盘。很多国家不上中国产底盘的牌。你要是已有卡车，画图前把大梁宽度和驾驶室到后桥的尺寸发过来。",
    },
  },
};

export const heatInfo: Record<Heat, L> = {
  lpg: { en: "LPG", zh: "液化气" },
  electric: { en: "Electric only", zh: "纯电" },
  mixed: { en: "LPG and electric", zh: "液化气 + 电" },
};

export const marketInfo: Record<Market, { name: L; power: L }> = {
  eu: { name: { en: "Europe", zh: "欧洲" }, power: { en: "230 V · 50 Hz", zh: "230 伏 · 50 赫兹" } },
  uk: { name: { en: "United Kingdom", zh: "英国" }, power: { en: "230 V · 50 Hz", zh: "230 伏 · 50 赫兹" } },
  us: { name: { en: "United States", zh: "美国" }, power: { en: "120/240 V · 60 Hz", zh: "120/240 伏 · 60 赫兹" } },
  au: { name: { en: "Australia", zh: "澳大利亚" }, power: { en: "230 V · 50 Hz", zh: "230 伏 · 50 赫兹" } },
  gcc: { name: { en: "Gulf", zh: "海湾" }, power: { en: "220 V · 50 Hz", zh: "220 伏 · 50 赫兹" } },
  other: { name: { en: "Other country", zh: "其他国家" }, power: { en: "Tell us the plug", zh: "来信说明插头" } },
};

export const toneInfo: Record<Tone, L> = {
  enamel: { en: "Enamel", zh: "搪瓷绿" },
  ink: { en: "Ink", zh: "墨色" },
  bone: { en: "Bone", zh: "骨色" },
  copper: { en: "Copper", zh: "铜棕" },
  tomato: { en: "Tomato", zh: "番茄红" },
};

export const equipment: Record<MenuId, EquipmentItem[]> = {
  coffee: [
    { name: { en: "Service window, counter, and a cup rail", zh: "售卖窗、操作台、杯架" }, supply: "ours" },
    { name: { en: "Water filter and a shelf sized for a 2-group machine you supply", zh: "过滤器，以及一台你自备双头咖啡机的台面" }, supply: "yours" },
    { name: { en: "Undercounter fridge", zh: "台下冷藏" }, supply: "ours" },
    { name: { en: "One sink", zh: "一个水槽" }, supply: "ours" },
  ],
  fried: [
    { name: { en: "Two-basket floor fryer and a dump station", zh: "双篮落地炸炉和倒料台" }, supply: "ours" },
    { name: { en: "Exhaust hood over the fryers", zh: "炸炉上方排烟罩" }, supply: "ours" },
    { name: { en: "Upright fridge by the door", zh: "靠门立式冷藏" }, supply: "ours" },
    { name: { en: "Pack counter at the window and a prep bench", zh: "窗口出餐台和备料台" }, supply: "ours" },
    { name: { en: "Grease trap, sized on the drawing", zh: "隔油池，尺寸画在图纸上" }, supply: "ours" },
  ],
  pizza: [
    { name: { en: "Gas and power stub for a deck oven", zh: "甲板烤箱的气口和电源" }, supply: "ours" },
    { name: { en: "The oven itself, quoted only if you want us to fit a named model", zh: "烤箱本身。要我们装指定型号时，才写进报价" }, supply: "yours" },
    { name: { en: "Makeup bench and peel hooks", zh: "制作台和披萨铲挂钩" }, supply: "ours" },
    { name: { en: "Fridge under the bench", zh: "台下冷藏" }, supply: "ours" },
    { name: { en: "Hood reserved above the oven space", zh: "烤箱位上方预留烟罩" }, supply: "ours" },
  ],
  grill: [
    { name: { en: "Flat top facing the window", zh: "对着窗口的铁板" }, supply: "ours" },
    { name: { en: "Space for a charbroiler beside it", zh: "铁板旁的烧烤炉位置" }, supply: "ours" },
    { name: { en: "Exhaust hood over the cook line", zh: "出餐线上方排烟罩" }, supply: "ours" },
    { name: { en: "Cooler drawers and a hand sink", zh: "冷藏抽屉和洗手池" }, supply: "ours" },
  ],
  noodle: [
    { name: { en: "Two stock pots and a noodle boiler", zh: "两口高汤锅和一台煮面炉" }, supply: "ours" },
    { name: { en: "Hood and a water boiler", zh: "烟罩和开水器" }, supply: "ours" },
    { name: { en: "Pass over a cold table for toppings", zh: "配料冷台上方的出餐口" }, supply: "ours" },
    { name: { en: "Bowl shelf and a ware sink", zh: "碗架和洗涤槽" }, supply: "ours" },
  ],
  dessert: [
    { name: { en: "Topping rail, dipper well, and a dry store", zh: "淋酱台、挖球井和干货柜" }, supply: "ours" },
    { name: { en: "Dipping cabinet or gelato case, your brand", zh: "展示冷柜或意式冰淇淋柜，用你的牌子" }, supply: "yours" },
    { name: { en: "Undercounter freezer", zh: "台下冷冻" }, supply: "ours" },
    { name: { en: "One sink", zh: "一个水槽" }, supply: "ours" },
  ],
  mixed: [
    { name: { en: "Flat top and one floor fryer", zh: "铁板和一台落地炸炉" }, supply: "ours" },
    { name: { en: "Hood, fridge, pack counter, prep bench", zh: "烟罩、冷藏、出餐台、备料台" }, supply: "ours" },
    { name: { en: "Grease trap, sized on the drawing", zh: "隔油池，尺寸画在图纸上" }, supply: "ours" },
  ],
};

const sharedKit: EquipmentItem[] = [
  { name: { en: "Shore-power inlet and labeled breakers", zh: "岸电进线口和贴了标签的空开" }, supply: "ours" },
  { name: { en: "Fresh tank, waste tank, and a pump", zh: "清水箱、污水箱和水泵" }, supply: "ours" },
  { name: { en: "LED interior lights and an e-stop at the window", zh: "室内 LED，窗口旁急停" }, supply: "ours" },
  { name: { en: "Extinguisher bracket", zh: "灭火器支架" }, supply: "ours" },
];

export function kitFor(draft: Draft): EquipmentItem[] {
  const items = [...equipment[draft.menu], ...sharedKit];
  if (draft.generator) {
    items.push({ name: { en: "Generator, ventilated, on the drawing", zh: "发电机，带通风，画在图纸上" }, supply: "ours" });
  }
  if (draft.platform !== "cart") {
    items.push({ name: { en: "Ware sink in addition to the hand sink", zh: "洗手池之外再加一个洗涤槽" }, supply: "ours" });
  }
  return items;
}

export const plans: Record<MenuId, PlanDef> = {
  coffee: {
    columns: "1.3fr 1fr 0.7fr",
    rows: "1fr 1fr",
    areas: `"win counter door" "win cold door"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "counter", kind: "work", name: { en: "Machine shelf", zh: "咖啡机位" } },
      { area: "cold", kind: "cold", name: { en: "Fridge", zh: "冷藏" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
    ],
  },
  fried: {
    columns: "1fr 1fr 1fr 0.75fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "pay fry fry cold" "prep fry fry cold"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "pay", kind: "work", name: { en: "Pack", zh: "出餐" } },
      { area: "fry", kind: "cook", name: { en: "Fryers", zh: "炸炉" } },
      { area: "cold", kind: "cold", name: { en: "Fridge", zh: "冷藏" } },
      { area: "prep", kind: "work", name: { en: "Prep", zh: "备料" } },
    ],
  },
  pizza: {
    columns: "1.2fr 1fr 0.75fr",
    rows: "0.7fr 1.1fr 1fr",
    areas: `"win win door" "oven oven cold" "make make cold"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "oven", kind: "cook", name: { en: "Oven space", zh: "烤箱位" } },
      { area: "cold", kind: "cold", name: { en: "Fridge", zh: "冷藏" } },
      { area: "make", kind: "work", name: { en: "Makeup", zh: "制作" } },
    ],
  },
  grill: {
    columns: "1fr 1fr 0.9fr 0.7fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "flat flat cold door" "prep char cold tanks"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "flat", kind: "cook", name: { en: "Flat top", zh: "铁板" } },
      { area: "cold", kind: "cold", name: { en: "Cooler", zh: "冷藏" } },
      { area: "prep", kind: "work", name: { en: "Prep", zh: "备料" } },
      { area: "char", kind: "cook", name: { en: "Grill", zh: "烧烤炉" } },
      { area: "tanks", kind: "panel", name: { en: "Tanks", zh: "水箱" } },
    ],
  },
  noodle: {
    columns: "1.1fr 1fr 0.8fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win door" "wok boil cold" "prep boil cold"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "wok", kind: "cook", name: { en: "Stock", zh: "高汤" } },
      { area: "boil", kind: "cook", name: { en: "Boiler", zh: "煮面" } },
      { area: "cold", kind: "cold", name: { en: "Toppings", zh: "配料" } },
      { area: "prep", kind: "work", name: { en: "Pass", zh: "出餐" } },
    ],
  },
  dessert: {
    columns: "1.2fr 1fr 0.75fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win door" "dip rail cold" "pack rail cold"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "dip", kind: "cold", name: { en: "Cabinet", zh: "冷柜" } },
      { area: "rail", kind: "work", name: { en: "Toppings", zh: "淋酱" } },
      { area: "cold", kind: "cold", name: { en: "Freezer", zh: "冷冻" } },
      { area: "pack", kind: "work", name: { en: "Pack", zh: "出餐" } },
    ],
  },
  mixed: {
    columns: "1fr 1fr 0.9fr 0.7fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "flat fry cold door" "prep prep cold tanks"`,
    cells: [
      { area: "win", kind: "glass", name: { en: "Window", zh: "窗口" } },
      { area: "door", kind: "door", name: { en: "Door", zh: "门" } },
      { area: "flat", kind: "cook", name: { en: "Flat top", zh: "铁板" } },
      { area: "fry", kind: "cook", name: { en: "Fryer", zh: "炸炉" } },
      { area: "cold", kind: "cold", name: { en: "Fridge", zh: "冷藏" } },
      { area: "prep", kind: "work", name: { en: "Prep", zh: "备料" } },
      { area: "tanks", kind: "panel", name: { en: "Tanks", zh: "水箱" } },
    ],
  },
};

export type Model = {
  id: string;
  name: L;
  summary: L;
  preset: Partial<Draft>;
};

export const models: Model[] = [
  {
    id: "window-cart",
    name: { en: "Window cart", zh: "窗口手推车" },
    summary: {
      en: "Coffee, crepes, or one countertop fryer. No hitch and no floor fryer.",
      zh: "咖啡、可丽饼，或一台台面炸炉。没有拖钩，也没有落地炸炉。",
    },
    preset: { platform: "cart", length: 2.2, menu: "coffee", heat: "electric", windows: 1, tone: "bone" },
  },
  {
    id: "fry-trailer",
    name: { en: "Fry trailer", zh: "炸炉拖车" },
    summary: {
      en: "Two baskets, a pack counter at the glass, fridge where you restock.",
      zh: "双篮，出餐台贴着玻璃，冷藏放在补货的那一侧。",
    },
    preset: { platform: "trailer", length: 5.2, menu: "fried", heat: "mixed", windows: 1, tone: "enamel" },
  },
  {
    id: "oven-trailer",
    name: { en: "Oven trailer", zh: "烤箱拖车" },
    summary: {
      en: "A nose for the oven and a window that does not sit in the heat.",
      zh: "车头留给烤箱，窗口避开那一团热气。",
    },
    preset: { platform: "trailer", length: 5.2, menu: "pizza", heat: "mixed", windows: 1, tone: "tomato" },
  },
  {
    id: "grill-trailer",
    name: { en: "Grill trailer", zh: "明档烧烤拖车" },
    summary: {
      en: "The flat top faces the queue. Bottles sit at the tongue, not under the glass.",
      zh: "铁板朝着排队的人。气瓶在拖杆上，不在玻璃下面。",
    },
    preset: { platform: "trailer", length: 6.0, menu: "grill", heat: "lpg", windows: 1, tone: "copper" },
  },
  {
    id: "twin-trailer",
    name: { en: "Twin-window trailer", zh: "双窗口拖车" },
    summary: {
      en: "Two service sides for a long pitch. The plan shows the cook side. The second window is opposite.",
      zh: "场地长的时候两侧都出餐。平面画的是操作侧，第二个窗口在对面。",
    },
    preset: { platform: "trailer", length: 7.2, menu: "mixed", heat: "mixed", windows: 2, tone: "ink" },
  },
  {
    id: "chassis-body",
    name: { en: "Chassis body", zh: "上车厢体" },
    summary: {
      en: "A kitchen for a truck you already own, or one your country will actually register.",
      zh: "装在你已有的卡车上，或装在你的国家确实能上牌的底盘上。",
    },
    preset: { platform: "truck", length: 4.5, menu: "fried", heat: "mixed", windows: 1, tone: "enamel" },
  },
];

export type Study = {
  id: string;
  title: L;
  situation: L;
  story: L;
  points: L[];
  preset: Partial<Draft>;
};

export const studies: Study[] = [
  {
    id: "one-group",
    title: { en: "One group, one window", zh: "一台咖啡机，一个窗口" },
    situation: { en: "230 V · 50 Hz · a pitch that already has power", zh: "230 伏 · 50 赫兹 · 场地已经有电" },
    story: {
      en: "No fryer, so there is no hood and no gas bottle. The conversation with the venue is about a cart, not a vehicle.",
      zh: "没有炸炉，就没有烟罩，也没有气瓶。和场地谈的是一辆手推车，不是一辆机动车。",
    },
    points: [
      { en: "Machine stays yours. We leave the shelf, the water, and the breaker.", zh: "咖啡机是你的。我们留台面、水和空开。" },
      { en: "Bone paint, one window, electric only.", zh: "骨色，单窗，纯电。" },
      { en: "Two 25 L tanks. Enough for a market day, not a festival.", zh: "两个 25 升水箱。够一个集市日，不够一个音乐节。" },
    ],
    preset: { menu: "coffee", platform: "cart", length: 2.2, market: "eu", heat: "electric", windows: 1, tone: "bone", generator: false },
  },
  {
    id: "two-fryers",
    title: { en: "Two fryers, one queue", zh: "两台炸炉，一条队" },
    situation: { en: "120/240 V · 60 Hz · shore power a short run from the pitch", zh: "120/240 伏 · 60 赫兹 · 岸电就在场地旁边" },
    story: {
      en: "Oil stays off the passing lane. The person packing faces the glass. The fridge is at the door so raw chicken never crosses the pack counter.",
      zh: "油不靠人行的那一侧。出餐的人面对玻璃。冷藏在门口，生鸡不用穿过出餐台。",
    },
    points: [
      { en: "Mixed heat: fryers on gas, fridge and lights on shore power.", zh: "混合能源：炸炉用气，冷藏和灯用岸电。" },
      { en: "United States inlet is a different breaker layout. Say so before we draw.", zh: "美国的进线，空开布置不一样。画图前要讲清楚。" },
      { en: "Generator stays off this one. The pitch has power.", zh: "这辆不带发电机。场地有电。" },
    ],
    preset: { menu: "fried", platform: "trailer", length: 5.2, market: "us", heat: "mixed", windows: 1, tone: "enamel", generator: false },
  },
  {
    id: "grill-walk",
    title: { en: "Grill facing the walk", zh: "明档对着人行道" },
    situation: { en: "220 V · 50 Hz · LPG the venue already allows", zh: "220 伏 · 50 赫兹 · 场地允许液化气" },
    story: {
      en: "People stop because they can see the flat top. The bottles are caged on the tongue, away from the queue and away from the glass.",
      zh: "人会停下来，是因为看得见铁板。气瓶关在拖杆的笼子里，远离队伍，也远离玻璃。",
    },
    points: [
      { en: "Six metres gives the charbroiler its own bay.", zh: "六米，烧烤炉才有自己的一格。" },
      { en: "Copper body, lime awning. The food is still the sign.", zh: "铜棕色厢体，黄绿色雨棚。招牌仍然是菜。" },
      { en: "Local gas sign-off is not part of the build.", zh: "当地的燃气验收不包含在造车里。" },
    ],
    preset: { menu: "grill", platform: "trailer", length: 6.0, market: "gcc", heat: "lpg", windows: 1, tone: "copper", generator: false },
  },
];

export function menuById(id: MenuId) {
  return menus.find((item) => item.id === id) ?? menus[0];
}

export function modelById(id: string) {
  return models.find((item) => item.id === id);
}
