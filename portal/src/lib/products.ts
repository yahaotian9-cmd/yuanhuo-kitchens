export type ProductStatus = "draft" | "published" | "archived";
export type BodyType = "cart" | "trailer" | "truck";
export type ProductSpec = { k: string; v: string };

export type ProductRecord = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  name_zh: string;
  summary: string;
  summary_zh: string;
  description: string;
  body_type: BodyType;
  category: string;
  length_m: number;
  width_m: number;
  height_m: number;
  base_price_usd: number;
  price_high_usd: number;
  moq: number;
  lead_days: string;
  compliance: string;
  cover_url: string;
  gallery_json: string;
  specs_json: string;
  status: ProductStatus;
  active: boolean;
  featured: boolean;
  sort_order: number;
  updated_at?: string;
};

export const PRODUCT_STATUSES: ProductStatus[] = ["published", "draft", "archived"];

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  published: "已上架",
  draft: "草稿",
  archived: "已下架",
};

export const BODY_TYPE_LABEL: Record<BodyType, string> = {
  cart: "手推车 Cart",
  trailer: "拖车 Trailer",
  truck: "卡车厢体 Truck",
};

export const CATEGORY_OPTIONS: { id: string; label: string }[] = [
  { id: "fried", label: "炸鸡/薯条 Fried" },
  { id: "coffee", label: "咖啡/饮品 Coffee" },
  { id: "grill", label: "烧烤/汉堡 Grill" },
  { id: "pizza", label: "披萨/烘焙 Pizza" },
  { id: "noodle", label: "面食/中餐 Noodle" },
  { id: "dessert", label: "甜品/冰淇淋 Dessert" },
  { id: "mixed", label: "综合餐车 Mixed" },
];

export const COMPLIANCE_TAGS = ["EU CE", "US DOT/NSF", "UK", "AU ADR", "GCC"];

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseJsonArray<T>(raw: string | null | undefined, fallback: T[] = []): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeStatus(raw: unknown, activeFallback?: unknown): ProductStatus {
  if (raw === "draft" || raw === "published" || raw === "archived") return raw;
  if (typeof activeFallback === "boolean") return activeFallback ? "published" : "archived";
  return "published";
}

export function sanitizeGallery(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => String(x || "").trim())
    .filter((u) => u.startsWith("https://") || u.startsWith("http://") || u.startsWith("/") || u.startsWith("data:image/"))
    .slice(0, 12);
}

export function sanitizeSpecs(input: unknown): ProductSpec[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const rec = item as Record<string, unknown>;
      return { k: String(rec?.k || "").trim(), v: String(rec?.v || "").trim() };
    })
    .filter((item) => item.k !== "" || item.v !== "")
    .slice(0, 20);
}
