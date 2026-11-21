import { lx, type Draft, type EquipmentItem, type Heat, type L, type Market, type MenuId, type PlanDef, type Platform, type Tone } from "./types";

/**
 * Taihong Machinery — custom food-truck exporter.
 * Leave whatsappE164 empty until you have a real number — do not invent one.
 */
export const sales = {
  brandEn: "TAIHONG",
  brandSubEn: "MACHINERY",
  brandZh: "泰宏机械",
  email: "",
  whatsappE164: "",
  yard: lx("Weifang, Shandong, China", "中国山东潍坊") as L,
  port: lx("FOB Qingdao", "青岛港 FOB") as L,
  /** Cursor Apps / portal base URL after publish. Empty = /track on same host when linked. */
  portalUrl: "",
  logoSrc: `${import.meta.env.BASE_URL}logo-taihong.png`,
  bannerSrc: `${import.meta.env.BASE_URL}hero-banner.jpg`,
  mascotSrc: `${import.meta.env.BASE_URL}ip-mascot.png`,
  mascotSideSrc: `${import.meta.env.BASE_URL}ip-mascot-side.png`,
};

export const tonePaint: Record<Tone, { body: string; trim: string }> = {
  enamel: { body: "#0b2a4a", trim: "#071c32" },
  ink: { body: "#1a1f2a", trim: "#0d1118" },
  bone: { body: "#eef1f5", trim: "#cfd6e0" },
  copper: { body: "#e85d04", trim: "#b84400" },
  tomato: { body: "#c2410c", trim: "#7c2d12" },
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
  shore: "unsure",
  gasOk: "unsure",
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
  const tri = ["yes", "no", "unsure"];
  if (!tri.includes(next.shore)) next.shore = "unsure";
  if (!tri.includes(next.gasOk)) next.gasOk = "unsure";
  for (const key of textKeys) {
    if (typeof next[key] !== "string") next[key] = "";
  }
  return next;
}

export const menus: { id: MenuId; name: L; blurb: L }[] = [
  {
    id: "coffee",
    name: lx("Coffee", "咖啡"),
    blurb: lx("Filter, cups, and a shelf for your own machine.", "过滤、杯子，和一台你自备咖啡机的位子。"),
  },
  {
    id: "fried",
    name: lx("Fried chicken", "炸鸡"),
    blurb: lx("Fryers behind the pack station, fridge by the door.", "炸炉在出餐台后面，冷藏靠门。"),
  },
  {
    id: "pizza",
    name: lx("Pizza", "披萨"),
    blurb: lx("Oven space and a makeup bench. The oven is quoted on the drawing.", "留出烤箱位和制作台。烤箱在图纸上另计。"),
  },
  {
    id: "grill",
    name: lx("Grill", "烧烤"),
    blurb: lx("Flat top at the window so the food is the sign.", "铁板对着窗口，菜本身就是招牌。"),
  },
  {
    id: "noodle",
    name: lx("Noodles", "面档"),
    blurb: lx("Stock, a boiler, and room to face the bowl.", "高汤、煮面和面对碗的操作位。"),
  },
  {
    id: "dessert",
    name: lx("Dessert", "甜品"),
    blurb: lx("A cold cabinet you bring, and a topping rail we fit.", "冷柜你带，淋酱台我们装。"),
  },
  {
    id: "mixed",
    name: lx("Mixed street menu", "混合街食"),
    blurb: lx("Flat top, one fryer, fridge. The usual first truck.", "铁板、一台炸炉、冷藏。第一辆车最常见的组合。"),
  },
];

export const platformInfo: Record<Platform, { name: L; note: L; width: L }> = {
  cart: {
    name: lx("Cart", "手推车"),
    width: lx("About 1.7 m wide", "宽约 1.7 米"),
    note: lx("A cart is not a road trailer. It stays on a pitch that already has power.", "手推车不是上路的拖车。它停在已经有电的场地里。"),
  },
  trailer: {
    name: lx("Trailer", "拖车"),
    width: lx("About 2.1 m wide", "宽约 2.1 米"),
    note: lx("The usual export. Hitch is a 50 mm ball unless the drawing says otherwise. Registration in your country stays with you.", "最常出口的一种。拖钩默认 50 毫米球头，图纸另有说明除外。在你国家上牌，由你来办。"),
  },
  truck: {
    name: lx("Truck body", "上车厢体"),
    width: lx("Body width follows the chassis, usually 2.0–2.2 m", "厢宽跟着底盘走，通常 2.0–2.2 米"),
    note: lx("This is a kitchen body, not a chassis cab. Many countries will not register a chassis built in China. If you already have a truck, send the frame width and the cab-to-axle length before we draw.", "这是厨房厢体，不是带驾驶室的底盘。很多国家不上中国产底盘的牌。你要是已有卡车，画图前把大梁宽度和驾驶室到后桥的尺寸发过来。"),
  },
};

export const heatInfo: Record<Heat, L> = {
  lpg: lx("LPG", "液化气"),
  electric: lx("Electric only", "纯电"),
  mixed: lx("LPG and electric", "液化气 + 电"),
};

export const marketInfo: Record<Market, { name: L; power: L }> = {
  eu: { name: lx("Europe", "欧洲"), power: lx("230 V · 50 Hz", "230 伏 · 50 赫兹") },
  uk: { name: lx("United Kingdom", "英国"), power: lx("230 V · 50 Hz", "230 伏 · 50 赫兹") },
  us: { name: lx("United States", "美国"), power: lx("120/240 V · 60 Hz", "120/240 伏 · 60 赫兹") },
  au: { name: lx("Australia", "澳大利亚"), power: lx("230 V · 50 Hz", "230 伏 · 50 赫兹") },
  gcc: { name: lx("Gulf", "海湾"), power: lx("220 V · 50 Hz", "220 伏 · 50 赫兹") },
  other: { name: lx("Other country", "其他国家"), power: lx("Tell us the plug", "来信说明插头") },
};

export const toneInfo: Record<Tone, L> = {
  enamel: lx("Navy", "海军蓝", { ar: "كحلي", es: "Azul marina", ru: "Тёмно-синий" }),
  ink: lx("Ink", "墨色", { ar: "حبر", es: "Tinta", ru: "Чернильный" }),
  bone: lx("Bone", "骨色", { ar: "عاجي", es: "Hueso", ru: "Слоновая кость" }),
  copper: lx("Orange", "品牌橙", { ar: "برتقالي", es: "Naranja", ru: "Оранжевый" }),
  tomato: lx("Flame", "焰橙", { ar: "لهب", es: "Llama", ru: "Огненный" }),
};

export const equipment: Record<MenuId, EquipmentItem[]> = {
  coffee: [
    { name: lx("Service window, counter, and a cup rail", "售卖窗、操作台、杯架"), supply: "ours" },
    { name: lx("Water filter and a shelf sized for a 2-group machine you supply", "过滤器，以及一台你自备双头咖啡机的台面"), supply: "yours" },
    { name: lx("Undercounter fridge", "台下冷藏"), supply: "ours" },
    { name: lx("One sink", "一个水槽"), supply: "ours" },
  ],
  fried: [
    { name: lx("Two-basket floor fryer and a dump station", "双篮落地炸炉和倒料台"), supply: "ours" },
    { name: lx("Exhaust hood over the fryers", "炸炉上方排烟罩"), supply: "ours" },
    { name: lx("Upright fridge by the door", "靠门立式冷藏"), supply: "ours" },
    { name: lx("Pack counter at the window and a prep bench", "窗口出餐台和备料台"), supply: "ours" },
    { name: lx("Grease trap, sized on the drawing", "隔油池，尺寸画在图纸上"), supply: "ours" },
  ],
  pizza: [
    { name: lx("Gas and power stub for a deck oven", "甲板烤箱的气口和电源"), supply: "ours" },
    { name: lx("The oven itself, quoted only if you want us to fit a named model", "烤箱本身。要我们装指定型号时，才写进报价"), supply: "yours" },
    { name: lx("Makeup bench and peel hooks", "制作台和披萨铲挂钩"), supply: "ours" },
    { name: lx("Fridge under the bench", "台下冷藏"), supply: "ours" },
    { name: lx("Hood reserved above the oven space", "烤箱位上方预留烟罩"), supply: "ours" },
  ],
  grill: [
    { name: lx("Flat top facing the window", "对着窗口的铁板"), supply: "ours" },
    { name: lx("Space for a charbroiler beside it", "铁板旁的烧烤炉位置"), supply: "ours" },
    { name: lx("Exhaust hood over the cook line", "出餐线上方排烟罩"), supply: "ours" },
    { name: lx("Cooler drawers and a hand sink", "冷藏抽屉和洗手池"), supply: "ours" },
  ],
  noodle: [
    { name: lx("Two stock pots and a noodle boiler", "两口高汤锅和一台煮面炉"), supply: "ours" },
    { name: lx("Hood and a water boiler", "烟罩和开水器"), supply: "ours" },
    { name: lx("Pass over a cold table for toppings", "配料冷台上方的出餐口"), supply: "ours" },
    { name: lx("Bowl shelf and a ware sink", "碗架和洗涤槽"), supply: "ours" },
  ],
  dessert: [
    { name: lx("Topping rail, dipper well, and a dry store", "淋酱台、挖球井和干货柜"), supply: "ours" },
    { name: lx("Dipping cabinet or gelato case, your brand", "展示冷柜或意式冰淇淋柜，用你的牌子"), supply: "yours" },
    { name: lx("Undercounter freezer", "台下冷冻"), supply: "ours" },
    { name: lx("One sink", "一个水槽"), supply: "ours" },
  ],
  mixed: [
    { name: lx("Flat top and one floor fryer", "铁板和一台落地炸炉"), supply: "ours" },
    { name: lx("Hood, fridge, pack counter, prep bench", "烟罩、冷藏、出餐台、备料台"), supply: "ours" },
    { name: lx("Grease trap, sized on the drawing", "隔油池，尺寸画在图纸上"), supply: "ours" },
  ],
};

const sharedKit: EquipmentItem[] = [
  { name: lx("Shore-power inlet and labeled breakers", "岸电进线口和贴了标签的空开"), supply: "ours" },
  { name: lx("Fresh tank, waste tank, and a pump", "清水箱、污水箱和水泵"), supply: "ours" },
  { name: lx("LED interior lights and an e-stop at the window", "室内 LED，窗口旁急停"), supply: "ours" },
  { name: lx("Extinguisher bracket", "灭火器支架"), supply: "ours" },
];

export function kitFor(draft: Draft): EquipmentItem[] {
  const items = [...equipment[draft.menu], ...sharedKit];
  if (draft.generator) {
    items.push({ name: lx("Generator, ventilated, on the drawing", "发电机，带通风，画在图纸上"), supply: "ours" });
  }
  if (draft.platform !== "cart") {
    items.push({ name: lx("Ware sink in addition to the hand sink", "洗手池之外再加一个洗涤槽"), supply: "ours" });
  }
  return items;
}

export const plans: Record<MenuId, PlanDef> = {
  coffee: {
    columns: "1.3fr 1fr 0.7fr",
    rows: "1fr 1fr",
    areas: `"win counter door" "win cold door"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "counter", kind: "work", name: lx("Machine shelf", "咖啡机位") },
      { area: "cold", kind: "cold", name: lx("Fridge", "冷藏") },
      { area: "door", kind: "door", name: lx("Door", "门") },
    ],
  },
  fried: {
    columns: "1fr 1fr 1fr 0.75fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "pay fry fry cold" "prep fry fry cold"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "pay", kind: "work", name: lx("Pack", "出餐") },
      { area: "fry", kind: "cook", name: lx("Fryers", "炸炉") },
      { area: "cold", kind: "cold", name: lx("Fridge", "冷藏") },
      { area: "prep", kind: "work", name: lx("Prep", "备料") },
    ],
  },
  pizza: {
    columns: "1.2fr 1fr 0.75fr",
    rows: "0.7fr 1.1fr 1fr",
    areas: `"win win door" "oven oven cold" "make make cold"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "oven", kind: "cook", name: lx("Oven space", "烤箱位") },
      { area: "cold", kind: "cold", name: lx("Fridge", "冷藏") },
      { area: "make", kind: "work", name: lx("Makeup", "制作") },
    ],
  },
  grill: {
    columns: "1fr 1fr 0.9fr 0.7fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "flat flat cold door" "prep char cold tanks"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "flat", kind: "cook", name: lx("Flat top", "铁板") },
      { area: "cold", kind: "cold", name: lx("Cooler", "冷藏") },
      { area: "prep", kind: "work", name: lx("Prep", "备料") },
      { area: "char", kind: "cook", name: lx("Grill", "烧烤炉") },
      { area: "tanks", kind: "panel", name: lx("Tanks", "水箱") },
    ],
  },
  noodle: {
    columns: "1.1fr 1fr 0.8fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win door" "wok boil cold" "prep boil cold"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "wok", kind: "cook", name: lx("Stock", "高汤") },
      { area: "boil", kind: "cook", name: lx("Boiler", "煮面") },
      { area: "cold", kind: "cold", name: lx("Toppings", "配料") },
      { area: "prep", kind: "work", name: lx("Pass", "出餐") },
    ],
  },
  dessert: {
    columns: "1.2fr 1fr 0.75fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win door" "dip rail cold" "pack rail cold"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "dip", kind: "cold", name: lx("Cabinet", "冷柜") },
      { area: "rail", kind: "work", name: lx("Toppings", "淋酱") },
      { area: "cold", kind: "cold", name: lx("Freezer", "冷冻") },
      { area: "pack", kind: "work", name: lx("Pack", "出餐") },
    ],
  },
  mixed: {
    columns: "1fr 1fr 0.9fr 0.7fr",
    rows: "0.7fr 1fr 1fr",
    areas: `"win win win door" "flat fry cold door" "prep prep cold tanks"`,
    cells: [
      { area: "win", kind: "glass", name: lx("Window", "窗口") },
      { area: "door", kind: "door", name: lx("Door", "门") },
      { area: "flat", kind: "cook", name: lx("Flat top", "铁板") },
      { area: "fry", kind: "cook", name: lx("Fryer", "炸炉") },
      { area: "cold", kind: "cold", name: lx("Fridge", "冷藏") },
      { area: "prep", kind: "work", name: lx("Prep", "备料") },
      { area: "tanks", kind: "panel", name: lx("Tanks", "水箱") },
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
    name: lx("Window cart", "窗口手推车"),
    summary: lx("Coffee, crepes, or one countertop fryer. No hitch and no floor fryer.", "咖啡、可丽饼，或一台台面炸炉。没有拖钩，也没有落地炸炉。"),
    preset: { platform: "cart", length: 2.2, menu: "coffee", heat: "electric", windows: 1, tone: "bone" },
  },
  {
    id: "fry-trailer",
    name: lx("Fry trailer", "炸炉拖车"),
    summary: lx("Two baskets, a pack counter at the glass, fridge where you restock.", "双篮，出餐台贴着玻璃，冷藏放在补货的那一侧。"),
    preset: { platform: "trailer", length: 5.2, menu: "fried", heat: "mixed", windows: 1, tone: "enamel" },
  },
  {
    id: "oven-trailer",
    name: lx("Oven trailer", "烤箱拖车"),
    summary: lx("A nose for the oven and a window that does not sit in the heat.", "车头留给烤箱，窗口避开那一团热气。"),
    preset: { platform: "trailer", length: 5.2, menu: "pizza", heat: "mixed", windows: 1, tone: "tomato" },
  },
  {
    id: "grill-trailer",
    name: lx("Grill trailer", "明档烧烤拖车"),
    summary: lx("The flat top faces the queue. Bottles sit at the tongue, not under the glass.", "铁板朝着排队的人。气瓶在拖杆上，不在玻璃下面。"),
    preset: { platform: "trailer", length: 6.0, menu: "grill", heat: "lpg", windows: 1, tone: "copper" },
  },
  {
    id: "twin-trailer",
    name: lx("Twin-window trailer", "双窗口拖车"),
    summary: lx("Two service sides for a long pitch. The plan shows the cook side. The second window is opposite.", "场地长的时候两侧都出餐。平面画的是操作侧，第二个窗口在对面。"),
    preset: { platform: "trailer", length: 7.2, menu: "mixed", heat: "mixed", windows: 2, tone: "ink" },
  },
  {
    id: "chassis-body",
    name: lx("Chassis body", "上车厢体"),
    summary: lx("A kitchen for a truck you already own, or one your country will actually register.", "装在你已有的卡车上，或装在你的国家确实能上牌的底盘上。"),
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
    title: lx("One group, one window", "一台咖啡机，一个窗口"),
    situation: lx("230 V · 50 Hz · a pitch that already has power", "230 伏 · 50 赫兹 · 场地已经有电"),
    story: lx("No fryer, so there is no hood and no gas bottle. The conversation with the venue is about a cart, not a vehicle.", "没有炸炉，就没有烟罩，也没有气瓶。和场地谈的是一辆手推车，不是一辆机动车。"),
    points: [
      lx("Machine stays yours. We leave the shelf, the water, and the breaker.", "咖啡机是你的。我们留台面、水和空开。"),
      lx("Bone paint, one window, electric only.", "骨色，单窗，纯电。"),
      lx("Two 25 L tanks. Enough for a market day, not a festival.", "两个 25 升水箱。够一个集市日，不够一个音乐节。"),
    ],
    preset: { menu: "coffee", platform: "cart", length: 2.2, market: "eu", heat: "electric", windows: 1, tone: "bone", generator: false },
  },
  {
    id: "two-fryers",
    title: lx("Two fryers, one queue", "两台炸炉，一条队"),
    situation: lx("120/240 V · 60 Hz · shore power a short run from the pitch", "120/240 伏 · 60 赫兹 · 岸电就在场地旁边"),
    story: lx("Oil stays off the passing lane. The person packing faces the glass. The fridge is at the door so raw chicken never crosses the pack counter.", "油不靠人行的那一侧。出餐的人面对玻璃。冷藏在门口，生鸡不用穿过出餐台。"),
    points: [
      lx("Mixed heat: fryers on gas, fridge and lights on shore power.", "混合能源：炸炉用气，冷藏和灯用岸电。"),
      lx("United States inlet is a different breaker layout. Say so before we draw.", "美国的进线，空开布置不一样。画图前要讲清楚。"),
      lx("Generator stays off this one. The pitch has power.", "这辆不带发电机。场地有电。"),
    ],
    preset: { menu: "fried", platform: "trailer", length: 5.2, market: "us", heat: "mixed", windows: 1, tone: "enamel", generator: false },
  },
  {
    id: "grill-walk",
    title: lx("Grill facing the walk", "明档对着人行道"),
    situation: lx("220 V · 50 Hz · LPG the venue already allows", "220 伏 · 50 赫兹 · 场地允许液化气"),
    story: lx("People stop because they can see the flat top. The bottles are caged on the tongue, away from the queue and away from the glass.", "人会停下来，是因为看得见铁板。气瓶关在拖杆的笼子里，远离队伍，也远离玻璃。"),
    points: [
      lx("Six metres gives the charbroiler its own bay.", "六米，烧烤炉才有自己的一格。"),
      lx("Orange body, navy trim. The food is still the sign.", "品牌橙厢体，海军蓝饰条。招牌仍然是菜。"),
      lx("Local gas sign-off is not part of the build.", "当地的燃气验收不包含在造车里。"),
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
