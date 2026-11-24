import { useEffect, useState } from "react";
import { models as baseModels, sales, sanitize } from "./data";
import { estimate } from "./spec";
import type { Draft, Lang, MenuId, Platform } from "./types";

export type ProductStatus = "published" | "draft" | "archived";
export type ProductSpec = { k: string; v: string };

export type CatalogProduct = {
  id: string;
  slug: string;
  sku: string;
  nameEn: string;
  nameZh: string;
  summaryEn: string;
  summaryZh: string;
  description: string;
  platform: Platform;
  category: MenuId;
  length: number;
  width: number;
  height: number;
  priceLow: number;
  priceHigh: number;
  moq: number;
  leadDays: string;
  compliance: string[];
  coverUrl: string;
  gallery: string[];
  specs: ProductSpec[];
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
  preset: Partial<Draft>;
};

export type OrderStatus =
  | "inquiry"
  | "quoted"
  | "deposit"
  | "producing"
  | "ready"
  | "shipped"
  | "delivered";

export type OrderPayment = {
  id: string;
  kind: "deposit" | "progress" | "balance" | "other";
  amountUsd: number;
  method: string;
  reference: string;
  paidAt: string;
  note: string;
};

export type OrderMedia = {
  id: string;
  kind: "photo" | "video";
  title: string;
  url: string;
};

export type OrderShipment = {
  carrier: string;
  trackingNo: string;
  etd: string;
  eta: string;
  status: string;
  lastEvent: string;
};

export type AdminOrder = {
  id: string;
  code: string;
  productSlug: string;
  productName: string;
  customerName: string;
  company: string;
  country: string;
  email: string;
  whatsapp: string;
  status: OrderStatus;
  totalUsd: number;
  notes: string;
  payments: OrderPayment[];
  media: OrderMedia[];
  shipment: OrderShipment;
  updatedAt: string;
};

export const ORDER_FLOW: { id: OrderStatus; label: string }[] = [
  { id: "inquiry", label: "询盘" },
  { id: "quoted", label: "已报价" },
  { id: "deposit", label: "已付定金" },
  { id: "producing", label: "生产中" },
  { id: "ready", label: "验货待发" },
  { id: "shipped", label: "已发货" },
  { id: "delivered", label: "已签收" },
];

export const COMPLIANCE_OPTIONS = ["EU CE", "US DOT/NSF", "UK", "AU ADR", "GCC"];

export const CATEGORY_LIST: { id: MenuId; label: string }[] = [
  { id: "fried", label: "炸鸡/薯条 Fried" },
  { id: "coffee", label: "咖啡/饮品 Coffee" },
  { id: "grill", label: "烧烤/汉堡 Grill" },
  { id: "pizza", label: "披萨/烘焙 Pizza" },
  { id: "noodle", label: "面食/中餐 Noodle" },
  { id: "dessert", label: "甜品/冰淇淋 Dessert" },
  { id: "mixed", label: "综合餐车 Mixed" },
];

export const STATUS_LABEL: Record<ProductStatus, string> = {
  published: "已上架",
  draft: "草稿",
  archived: "已下架",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  cart: "手推车 Cart",
  trailer: "拖车 Trailer",
  truck: "卡车厢体 Truck",
};

const CATALOG_KEY = "taihong_catalog_v1";
const ORDERS_KEY = "taihong_orders_v1";
const SYNC_EVENT = "taihong-admin-sync";

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildDefaultCatalog(): CatalogProduct[] {
  const now = new Date().toISOString();
  const extraMeta: Record<
    string,
    { sku: string; width: number; height: number; leadDays: string; compliance: string[]; featured: boolean; coverUrl: string; description: string; specs: ProductSpec[] }
  > = {
    "window-cart": {
      sku: "TH-CT-220",
      width: 1.6,
      height: 2.2,
      leadDays: "18–25 days",
      compliance: ["EU CE", "UK", "AU ADR"],
      featured: false,
      coverUrl: "",
      description: "Lightweight insulated composite cart with fold-down service shelf, dual 25L water tanks, and plug-in shore power breaker box.",
      specs: [
        { k: "Food contact", v: "304 stainless steel" },
        { k: "Power", v: "230V/50Hz single-phase" },
        { k: "Water tanks", v: "2×25L fresh + waste" },
      ],
    },
    "fry-trailer": {
      sku: "TH-TR-520",
      width: 2.1,
      height: 2.5,
      leadDays: "28–35 days",
      compliance: ["EU CE", "US DOT/NSF", "UK"],
      featured: true,
      coverUrl: sales.bannerSrc,
      description: "High-output double-basket fry line with twin-axle AL-KO brake chassis, commercial baffle exhaust hood, and shore-power + LPG mixed system.",
      specs: [
        { k: "Food contact", v: "304 stainless steel" },
        { k: "Axle", v: "Twin axle w/ brake" },
        { k: "Water tanks", v: "2×60L fresh + 120L grey" },
        { k: "Power", v: "EU 230V/50Hz or US 120/240V/60Hz" },
      ],
    },
    "oven-trailer": {
      sku: "TH-TR-520P",
      width: 2.1,
      height: 2.5,
      leadDays: "28–35 days",
      compliance: ["EU CE", "US DOT/NSF"],
      featured: false,
      coverUrl: "",
      description: "Dedicated nose bay for deck or brick-style pizza oven with heat-isolated serving window and marble prep chiller.",
      specs: [
        { k: "Food contact", v: "304 stainless steel" },
        { k: "Oven bay", v: "Reinforced nose deck + chimney port" },
        { k: "Crew", v: "2–3 operators" },
      ],
    },
    "grill-trailer": {
      sku: "TH-TR-600",
      width: 2.2,
      height: 2.5,
      leadDays: "30–40 days",
      compliance: ["EU CE", "US DOT/NSF", "GCC"],
      featured: true,
      coverUrl: sales.bannerSrc,
      description: "Show-kitchen flat top and charbroiler facing the customer queue, with caged LPG cylinders mounted safely on the drawbar.",
      specs: [
        { k: "Ventilation", v: "2.5m commercial hood + centrifugal fan" },
        { k: "Heat", v: "LPG flat top & charbroiler" },
        { k: "Floor", v: "Anti-slip aluminum tread plate" },
      ],
    },
    "twin-trailer": {
      sku: "TH-TR-720",
      width: 2.2,
      height: 2.6,
      leadDays: "35–45 days",
      compliance: ["EU CE", "US DOT/NSF", "GCC"],
      featured: false,
      coverUrl: "",
      description: "Dual-side service windows engineered for festivals, stadiums, and high-footfall venues running two queues simultaneously.",
      specs: [
        { k: "Service windows", v: "2 opposite hydraulic awnings" },
        { k: "Crew", v: "4–5 operators" },
        { k: "Shipping", v: "1 unit per 40HQ container" },
      ],
    },
    "chassis-body": {
      sku: "TH-TK-450",
      width: 2.1,
      height: 2.3,
      leadDays: "25–35 days",
      compliance: ["EU CE", "GCC", "AU ADR"],
      featured: false,
      coverUrl: "",
      description: "Custom drop-on kitchen box engineered to bolt onto your locally registered truck chassis (chassis not included).",
      specs: [
        { k: "Scope", v: "Kitchen body + subframe only" },
        { k: "Shipping", v: "Export crate in 40HQ container" },
      ],
    },
  };

  return baseModels.map((m, idx) => {
    const spec = sanitize({ ...m.preset, market: "eu", qty: 1, generator: false });
    const band = estimate(spec);
    const meta = extraMeta[m.id];
    const cover = meta?.coverUrl || "";
    return {
      id: m.id,
      slug: m.id,
      sku: meta?.sku ?? `TH-00${idx + 1}`,
      nameEn: m.name.en,
      nameZh: m.name.zh,
      summaryEn: m.summary.en,
      summaryZh: m.summary.zh,
      description: meta?.description ?? "",
      platform: spec.platform,
      category: spec.menu,
      length: spec.length,
      width: meta?.width ?? 2.1,
      height: meta?.height ?? 2.5,
      priceLow: band.low,
      priceHigh: band.high,
      moq: 1,
      leadDays: meta?.leadDays ?? "25–40 days",
      compliance: meta?.compliance ?? ["EU CE", "US DOT/NSF"],
      coverUrl: cover,
      gallery: cover ? [cover] : [],
      specs: meta?.specs ?? [{ k: "Food contact", v: "304 stainless steel" }],
      status: "published",
      featured: meta?.featured ?? false,
      sortOrder: (idx + 1) * 10,
      updatedAt: now,
      preset: m.preset,
    };
  });
}

function buildDefaultOrders(): AdminOrder[] {
  const now = new Date().toISOString();
  return [
    {
      id: "ord-1",
      code: "TH-2401",
      productSlug: "fry-trailer",
      productName: "5.2米双篮炸炉餐车 · Fry trailer",
      customerName: "Ana Costa",
      company: "Costa Street Co",
      country: "Portugal",
      email: "ana@costa.example",
      whatsapp: "+351 900 000 000",
      status: "producing",
      totalUsd: 24000,
      notes: "EU 230V/50Hz, RAL 9016 body with TAIHONG orange trim.",
      payments: [
        { id: "p-1", kind: "deposit", amountUsd: 7200, method: "TT", reference: "SWIFT-2401-A", paidAt: "2026-10-28", note: "30% 首付定金" },
        { id: "p-2", kind: "progress", amountUsd: 9600, method: "TT", reference: "SWIFT-2401-B", paidAt: "2026-11-12", note: "40% 车壳焊接完成进度款" },
      ],
      media: [
        { id: "m-1", kind: "photo", title: "车壳焊接与喷漆完成", url: sales.bannerSrc },
      ],
      shipment: {
        carrier: "COSCO Shipping",
        trackingNo: "COSU6391820410",
        etd: "2026-11-30",
        eta: "2026-12-28",
        status: "preparing",
        lastEvent: "已向货代订 40HQ 舱位，待工厂出厂质检后装柜",
      },
      updatedAt: now,
    },
    {
      id: "ord-2",
      code: "TH-2402",
      productSlug: "grill-trailer",
      productName: "6.0米明档铁板烧烤拖车 · Grill trailer",
      customerName: "Omar Hassan",
      company: "Gulf Bites LLC",
      country: "UAE",
      email: "omar@gulfbites.example",
      whatsapp: "+971 50 000 0000",
      status: "deposit",
      totalUsd: 28000,
      notes: "GCC 220V/50Hz, LPG cylinder cage on drawbar, extra roof AC.",
      payments: [
        { id: "p-3", kind: "deposit", amountUsd: 8400, method: "TT", reference: "SWIFT-2402-A", paidAt: "2026-11-18", note: "30% 定金到账" },
      ],
      media: [],
      shipment: {
        carrier: "",
        trackingNo: "",
        etd: "",
        eta: "",
        status: "preparing",
        lastEvent: "排产图纸已由客户签字确认",
      },
      updatedAt: now,
    },
  ];
}

export function loadCatalog(): CatalogProduct[] {
  try {
    const raw = window.localStorage.getItem(CATALOG_KEY);
    if (!raw) return buildDefaultCatalog();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as CatalogProduct[];
  } catch {
    // ignore storage parse failure
  }
  return buildDefaultCatalog();
}

export function saveCatalog(items: CatalogProduct[]) {
  try {
    window.localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded — ignore gracefully
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

export function resetCatalog() {
  const fresh = buildDefaultCatalog();
  saveCatalog(fresh);
  return fresh;
}

export function loadOrders(): AdminOrder[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return buildDefaultOrders();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AdminOrder[];
  } catch {
    // ignore
  }
  return buildDefaultOrders();
}

export function saveOrders(items: AdminOrder[]) {
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

export function useCatalog() {
  const [items, setItems] = useState<CatalogProduct[]>(() => loadCatalog());

  useEffect(() => {
    const refresh = () => setItems(loadCatalog());
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const sorted = [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const published = sorted.filter((p) => p.status === "published");

  return {
    all: sorted,
    published,
    update(next: CatalogProduct[]) {
      saveCatalog(next);
      setItems(next);
    },
    reset() {
      const fresh = resetCatalog();
      setItems(fresh);
    },
  };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => loadOrders());

  useEffect(() => {
    const refresh = () => setOrders(loadOrders());
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    orders,
    update(next: AdminOrder[]) {
      saveOrders(next);
      setOrders(next);
    },
  };
}

export function productTitle(p: CatalogProduct, lang: Lang): string {
  if (lang === "zh") return p.nameZh || p.nameEn;
  return p.nameEn || p.nameZh;
}

export function productSummary(p: CatalogProduct, lang: Lang): string {
  if (lang === "zh") return p.summaryZh || p.summaryEn;
  return p.summaryEn || p.summaryZh;
}

export function productDraft(p: CatalogProduct): Draft {
  return sanitize({
    ...p.preset,
    platform: p.platform,
    menu: p.category,
    length: p.length,
    market: "eu",
    qty: 1,
    generator: false,
  });
}

export async function compressImageFile(file: File, maxDim = 960): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("不支持的图片格式"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(String(reader.result || ""));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}
