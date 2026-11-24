import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LIST,
  COMPLIANCE_OPTIONS,
  ORDER_FLOW,
  PLATFORM_LABEL,
  STATUS_LABEL,
  compressImageFile,
  slugify,
  useAdminOrders,
  useCatalog,
  type AdminOrder,
  type CatalogProduct,
  type OrderStatus,
  type ProductSpec,
  type ProductStatus,
} from "../catalog";
import { sales } from "../data";
import { useTitle } from "../state";
import type { MenuId, Platform } from "../types";

const AUTH_KEY = "taihong_admin_authed_v1";

type EditorState = {
  id: string | null;
  slug: string;
  sku: string;
  nameEn: string;
  nameZh: string;
  summaryEn: string;
  summaryZh: string;
  description: string;
  platform: Platform;
  category: MenuId;
  length: string;
  width: string;
  height: string;
  priceLow: string;
  priceHigh: string;
  moq: string;
  leadDays: string;
  compliance: string[];
  coverUrl: string;
  gallery: string[];
  specs: ProductSpec[];
  status: ProductStatus;
  featured: boolean;
  sortOrder: string;
};

function makeEmptyEditor(): EditorState {
  return {
    id: null,
    slug: "",
    sku: "",
    nameEn: "",
    nameZh: "",
    summaryEn: "",
    summaryZh: "",
    description: "",
    platform: "trailer",
    category: "fried",
    length: "5.2",
    width: "2.1",
    height: "2.5",
    priceLow: "19500",
    priceHigh: "26500",
    moq: "1",
    leadDays: "25–35 days",
    compliance: ["EU CE", "US DOT/NSF"],
    coverUrl: "",
    gallery: [],
    specs: [
      { k: "Food contact", v: "304 stainless steel" },
      { k: "Power", v: "230V/50Hz or 120/240V/60Hz" },
      { k: "Water tanks", v: "2×60L fresh + 120L grey" },
    ],
    status: "published",
    featured: false,
    sortOrder: "50",
  };
}

function productToEditor(p: CatalogProduct, asCopy = false): EditorState {
  const gallery = [...p.gallery];
  if (p.coverUrl && !gallery.includes(p.coverUrl)) gallery.unshift(p.coverUrl);
  return {
    id: asCopy ? null : p.id,
    slug: asCopy ? `${p.slug}-copy` : p.slug,
    sku: asCopy ? `${p.sku}-B` : p.sku,
    nameEn: asCopy ? `${p.nameEn} (Copy)` : p.nameEn,
    nameZh: asCopy ? `${p.nameZh}（副本）` : p.nameZh,
    summaryEn: p.summaryEn,
    summaryZh: p.summaryZh,
    description: p.description,
    platform: p.platform,
    category: p.category,
    length: String(p.length),
    width: String(p.width),
    height: String(p.height),
    priceLow: String(p.priceLow),
    priceHigh: String(p.priceHigh),
    moq: String(p.moq),
    leadDays: p.leadDays,
    compliance: [...p.compliance],
    coverUrl: p.coverUrl || gallery[0] || "",
    gallery,
    specs: p.specs.length > 0 ? p.specs.map((s) => ({ ...s })) : [{ k: "", v: "" }],
    status: asCopy ? "draft" : p.status,
    featured: asCopy ? false : p.featured,
    sortOrder: String(p.sortOrder),
  };
}

export function Admin() {
  useTitle("TAIHONG 运营后台");
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(AUTH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("demo");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<"products" | "orders">("products");

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim() !== "demo") {
      setLoginErr("演示密码为 demo");
      return;
    }
    try {
      window.sessionStorage.setItem(AUTH_KEY, "1");
    } catch {
      // ignore
    }
    setAuthed(true);
    setLoginErr("");
  }

  function logout() {
    try {
      window.sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
    setAuthed(false);
  }

  if (!authed) {
    return (
      <section className="section">
        <div className="wrap adm-login-wrap">
          <div className="adm-card">
            <p className="kicker">TAIHONG MACHINERY OPS</p>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>运营管理后台</h1>
            <p className="fine">
              可直接在线体验全套<strong>商品上品管理</strong>（传图、报价、参数、上下架并实时同步前台）与<strong>订单跟踪管理</strong>。
              默认体验密码：<code>demo</code>
            </p>
            <form onSubmit={login} style={{ marginTop: "1rem" }}>
              <label className="adm-field">
                <span>管理员密码</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              {loginErr ? <p className="adm-warn">{loginErr}</p> : null}
              <div className="adm-actions">
                <button className="btn btn-lime" type="submit">
                  进入管理后台
                </button>
                <Link className="btn btn-line" to="/models">
                  返回前台车型
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section adm-page">
      <div className="wrap">
        <div className="adm-head">
          <div>
            <p className="kicker">TAIHONG OPS CONSOLE</p>
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}>泰宏机械 · 商品上品与订单后台</h1>
          </div>
          <div className="adm-nav">
            <button
              type="button"
              className={`adm-tab ${tab === "products" ? "on" : ""}`}
              onClick={() => setTab("products")}
            >
              商品上品管理
            </button>
            <button
              type="button"
              className={`adm-tab ${tab === "orders" ? "on" : ""}`}
              onClick={() => setTab("orders")}
            >
              订单与物流管理
            </button>
            <Link className="adm-tab" to="/models">
              查看前台车型 ↗
            </Link>
            <Link className="adm-tab" to="/track">
              客户查单页 ↗
            </Link>
            <button type="button" className="adm-tab" onClick={logout}>
              退出
            </button>
          </div>
        </div>

        <p className="adm-banner">
          在线实时演示模式：你在「商品上品」中新建、上传实拍图、调价、上架/下架的商品会<strong>立即同步到前台车型页与首页</strong>（保存在当前浏览器）。多人团队共用版后端 <code>portal/</code>（Next.js + Postgres）已同步升级相同功能。
        </p>

        {tab === "products" ? <ProductsWorkbench /> : <OrdersWorkbench />}
      </div>
    </section>
  );
}

function ProductsWorkbench() {
  const { all, update, reset } = useCatalog();
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(makeEmptyEditor);
  const [urlInput, setUrlInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: all.length,
      published: all.filter((p) => p.status === "published").length,
      draft: all.filter((p) => p.status === "draft").length,
      archived: all.filter((p) => p.status === "archived").length,
      featured: all.filter((p) => p.featured).length,
    }),
    [all],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (platformFilter !== "all" && p.platform !== platformFilter) return false;
      if (q) {
        const hay = `${p.nameEn} ${p.nameZh} ${p.sku} ${p.slug} ${p.summaryEn} ${p.summaryZh}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, statusFilter, platformFilter, query]);

  const allSelected = visible.length > 0 && visible.every((p) => selectedIds.includes(p.id));

  function openNew() {
    setError(null);
    setNotice(null);
    setEditor(makeEmptyEditor());
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(p: CatalogProduct, asCopy = false) {
    setError(null);
    setNotice(null);
    setEditor(productToEditor(p, asCopy));
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, 6)) {
      try {
        const dataUrl = await compressImageFile(file);
        added.push(dataUrl);
      } catch {
        setError(`图片 ${file.name} 处理失败`);
      }
    }
    if (added.length > 0) {
      setEditor((cur) => {
        const nextGallery = [...cur.gallery, ...added].slice(0, 12);
        return { ...cur, gallery: nextGallery, coverUrl: cur.coverUrl || nextGallery[0] || "" };
      });
    }
  }

  function normalizeImageUrl(raw: string): string {
    const clean = raw.trim();
    if (!clean) return "";
    if (/^(https?:\/\/|data:image\/)/i.test(clean)) return clean;
    const base = import.meta.env.BASE_URL || "/";
    if (clean.startsWith(base)) return clean;
    return `${base}${clean.replace(/^\.?\//, "")}`;
  }

  function addUrlImage(explicit?: string) {
    const clean = normalizeImageUrl(explicit ?? urlInput);
    if (!clean) return;
    setEditor((cur) => {
      const nextGallery = cur.gallery.includes(clean) ? cur.gallery : [...cur.gallery, clean].slice(0, 12);
      return { ...cur, gallery: nextGallery, coverUrl: cur.coverUrl || clean };
    });
    if (!explicit) setUrlInput("");
  }

  function moveGallery(idx: number, dir: -1 | 1) {
    setEditor((cur) => {
      const target = idx + dir;
      if (target < 0 || target >= cur.gallery.length) return cur;
      const next = [...cur.gallery];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return { ...cur, gallery: next };
    });
  }

  function removeGallery(url: string) {
    setEditor((cur) => {
      const next = cur.gallery.filter((x) => x !== url);
      return { ...cur, gallery: next, coverUrl: cur.coverUrl === url ? next[0] || "" : cur.coverUrl };
    });
  }

  function toggleCompliance(tag: string) {
    setEditor((cur) => ({
      ...cur,
      compliance: cur.compliance.includes(tag)
        ? cur.compliance.filter((t) => t !== tag)
        : [...cur.compliance, tag],
    }));
  }

  function saveProduct(targetStatus: ProductStatus) {
    setError(null);
    const nameEn = editor.nameEn.trim();
    const nameZh = editor.nameZh.trim();
    if (!nameEn && !nameZh) {
      setError("请至少填写中文或英文商品名称。");
      return;
    }
    const baseSlug = slugify(editor.slug || nameEn || nameZh || "truck") || `item-${Date.now()}`;
    let finalSlug = baseSlug;
    if (!editor.id && all.some((p) => p.slug === finalSlug || p.id === finalSlug)) {
      finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }
    const len = Math.max(1.2, Math.min(12, Number(editor.length) || 5.2));
    const low = Math.max(0, Math.round(Number(editor.priceLow) || 0));
    const high = Math.max(low, Math.round(Number(editor.priceHigh) || low));
    const prefix = editor.platform === "cart" ? "TH-CT" : editor.platform === "truck" ? "TH-TK" : "TH-TR";
    const sku = editor.sku.trim() || `${prefix}-${Math.round(len * 100)}`;
    const gallery = [...editor.gallery];
    const coverUrl = editor.coverUrl || gallery[0] || "";
    if (coverUrl && !gallery.includes(coverUrl)) gallery.unshift(coverUrl);

    const existing = editor.id ? all.find((p) => p.id === editor.id) : undefined;
    const record: CatalogProduct = {
      id: existing?.id ?? finalSlug,
      slug: finalSlug,
      sku,
      nameEn: nameEn || nameZh,
      nameZh: nameZh || nameEn,
      summaryEn: editor.summaryEn.trim() || editor.summaryZh.trim(),
      summaryZh: editor.summaryZh.trim() || editor.summaryEn.trim(),
      description: editor.description.trim(),
      platform: editor.platform,
      category: editor.category,
      length: len,
      width: Math.max(1.0, Math.min(3.5, Number(editor.width) || 2.1)),
      height: Math.max(1.5, Math.min(4.0, Number(editor.height) || 2.5)),
      priceLow: low,
      priceHigh: high,
      moq: Math.max(1, Math.round(Number(editor.moq) || 1)),
      leadDays: editor.leadDays.trim() || "25–35 days",
      compliance: editor.compliance,
      coverUrl,
      gallery,
      specs: editor.specs.filter((s) => s.k.trim() || s.v.trim()),
      status: targetStatus,
      featured: editor.featured,
      sortOrder: Math.round(Number(editor.sortOrder) || 100),
      updatedAt: new Date().toISOString(),
      preset: {
        ...(existing?.preset ?? {}),
        platform: editor.platform,
        menu: editor.category,
        length: len,
        heat: editor.platform === "cart" ? "electric" : "mixed",
        windows: len >= 6.8 ? 2 : 1,
        tone: existing?.preset?.tone ?? "enamel",
      },
    };

    const next = existing ? all.map((p) => (p.id === existing.id ? record : p)) : [record, ...all];
    update(next);
    setEditorOpen(false);
    setNotice(
      targetStatus === "published"
        ? `已保存并上架「${record.nameZh}」，前台车型页已实时生效！`
        : `已保存「${record.nameZh}」（${STATUS_LABEL[targetStatus]}）`,
    );
  }

  function quickPatch(id: string, patch: Partial<CatalogProduct>, msg: string) {
    const next = all.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p));
    update(next);
    setNotice(msg);
  }

  function batchStatus(status: ProductStatus) {
    if (selectedIds.length === 0) return;
    const set = new Set(selectedIds);
    const next = all.map((p) => (set.has(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    update(next);
    setSelectedIds([]);
    setNotice(`已批量将 ${set.size} 个商品设为「${STATUS_LABEL[status]}」`);
  }

  function deleteIds(ids: string[]) {
    if (ids.length === 0) return;
    if (!window.confirm(`确定删除选中的 ${ids.length} 个商品吗？`)) return;
    const set = new Set(ids);
    update(all.filter((p) => !set.has(p.id)));
    setSelectedIds([]);
    setNotice(`已删除 ${ids.length} 个商品`);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taihong-products-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const previewLow = Number(editor.priceLow) || 0;
  const previewHigh = Math.max(previewLow, Number(editor.priceHigh) || previewLow);

  return (
    <>
      <div className="adm-kpis">
        <div className="adm-kpi">
          <span>全部商品</span>
          <b>{counts.all}</b>
        </div>
        <div className="adm-kpi">
          <span>已上架（前台可见）</span>
          <b>{counts.published}</b>
        </div>
        <div className="adm-kpi">
          <span>草稿箱</span>
          <b>{counts.draft}</b>
        </div>
        <div className="adm-kpi">
          <span>已下架</span>
          <b>{counts.archived}</b>
        </div>
        <div className="adm-kpi accent">
          <span>首页推荐</span>
          <b>{counts.featured}</b>
        </div>
      </div>

      {error ? <p className="adm-warn">{error}</p> : null}
      {notice ? (
        <p className="adm-ok">
          {notice}{" "}
          <Link to="/models" style={{ textDecoration: "underline", fontWeight: 600 }}>
            去前台查看效果 →
          </Link>
        </p>
      ) : null}

      {editorOpen ? (
        <section className="adm-card">
          <div className="adm-bar-row">
            <div>
              <h2 style={{ fontSize: "1.45rem" }}>{editor.id ? `编辑商品 · ${editor.nameZh || editor.nameEn}` : "新建商品上品"}</h2>
              <p className="fine">左侧录入多图与出口规格参数，右侧实时预览买家视图。</p>
            </div>
            <button type="button" className="btn btn-line adm-sm" onClick={() => setEditorOpen(false)}>
              收起编辑器
            </button>
          </div>

          <div className="adm-editor">
            <div>
              <div className="adm-sec">
                <h3>1. 基础信息</h3>
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>英文商品标题（海外买家展示）*</span>
                    <input
                      value={editor.nameEn}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditor((c) => ({ ...c, nameEn: v, slug: c.id || c.slug ? c.slug : slugify(v) }));
                      }}
                      placeholder="e.g. 5.5m Airstream Coffee Trailer"
                    />
                  </label>
                  <label className="adm-field">
                    <span>中文商品名（运营管理识别）</span>
                    <input
                      value={editor.nameZh}
                      onChange={(e) => setEditor({ ...editor, nameZh: e.target.value })}
                      placeholder="例如：5.5米美式咖啡餐车"
                    />
                  </label>
                  <label className="adm-field">
                    <span>SKU / 型号编码</span>
                    <input
                      value={editor.sku}
                      onChange={(e) => setEditor({ ...editor, sku: e.target.value })}
                      placeholder="留空自动生成，如 TH-TR-550"
                    />
                  </label>
                  <label className="adm-field">
                    <span>URL Slug</span>
                    <input
                      value={editor.slug}
                      onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
                      placeholder="airstream-coffee-550"
                    />
                  </label>
                  <label className="adm-field">
                    <span>车体类型</span>
                    <select
                      value={editor.platform}
                      onChange={(e) => setEditor({ ...editor, platform: e.target.value as Platform })}
                    >
                      <option value="cart">手推车 Cart</option>
                      <option value="trailer">拖车 Trailer</option>
                      <option value="truck">卡车厢体 Truck</option>
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>主营菜单分类</span>
                    <select
                      value={editor.category}
                      onChange={(e) => setEditor({ ...editor, category: e.target.value as MenuId })}
                    >
                      {CATEGORY_LIST.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="adm-sec">
                <h3>2. 商品实拍图与主图管理</h3>
                <div className="adm-upload">
                  <label className="btn btn-line adm-sm" style={{ cursor: "pointer" }}>
                    + 本地上传多图
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        onUploadFiles(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <input
                    className="adm-url-in"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="或粘贴图片外链 https://..."
                  />
                  <button type="button" className="btn btn-line adm-sm" onClick={() => addUrlImage()}>
                    添加外链
                  </button>
                  <button type="button" className="btn btn-line adm-sm" onClick={() => addUrlImage(sales.bannerSrc)}>
                    用工厂实拍样图
                  </button>
                </div>
                {editor.gallery.length > 0 ? (
                  <div className="adm-gallery">
                    {editor.gallery.map((url, idx) => {
                      const isCover = editor.coverUrl === url || (!editor.coverUrl && idx === 0);
                      return (
                        <div key={`${url.slice(0, 32)}-${idx}`} className={`adm-gitem ${isCover ? "cover" : ""}`}>
                          <img src={url} alt={`图 ${idx + 1}`} />
                          <div className="adm-gbar">
                            <button
                              type="button"
                              className={isCover ? "is-main" : ""}
                              onClick={() => setEditor({ ...editor, coverUrl: url })}
                            >
                              {isCover ? "主图" : "设主图"}
                            </button>
                            <button type="button" onClick={() => moveGallery(idx, -1)} disabled={idx === 0}>
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGallery(idx, 1)}
                              disabled={idx === editor.gallery.length - 1}
                            >
                              →
                            </button>
                            <button type="button" onClick={() => removeGallery(url)}>
                              删
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="fine" style={{ marginTop: "0.45rem" }}>
                    暂未上传实拍图（未传图时前台自动展示泰宏矢量车体图；上传实拍图后前台直接展示真车照片）。
                  </p>
                )}
              </div>

              <div className="adm-sec">
                <h3>3. FOB 报价、尺寸与出口合规</h3>
                <div className="adm-grid-3">
                  <label className="adm-field">
                    <span>FOB 最低价 (USD)</span>
                    <input
                      type="number"
                      value={editor.priceLow}
                      onChange={(e) => setEditor({ ...editor, priceLow: e.target.value })}
                    />
                  </label>
                  <label className="adm-field">
                    <span>FOB 最高价 (USD)</span>
                    <input
                      type="number"
                      value={editor.priceHigh}
                      onChange={(e) => setEditor({ ...editor, priceHigh: e.target.value })}
                    />
                  </label>
                  <label className="adm-field">
                    <span>起订量 MOQ</span>
                    <input
                      type="number"
                      min={1}
                      value={editor.moq}
                      onChange={(e) => setEditor({ ...editor, moq: e.target.value })}
                    />
                  </label>
                  <label className="adm-field">
                    <span>车长 L (m)</span>
                    <input value={editor.length} onChange={(e) => setEditor({ ...editor, length: e.target.value })} />
                  </label>
                  <label className="adm-field">
                    <span>车宽 W (m)</span>
                    <input value={editor.width} onChange={(e) => setEditor({ ...editor, width: e.target.value })} />
                  </label>
                  <label className="adm-field">
                    <span>车高 H (m)</span>
                    <input value={editor.height} onChange={(e) => setEditor({ ...editor, height: e.target.value })} />
                  </label>
                </div>
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>交期 Lead time</span>
                    <input
                      value={editor.leadDays}
                      onChange={(e) => setEditor({ ...editor, leadDays: e.target.value })}
                    />
                  </label>
                  <label className="adm-field">
                    <span>排序权重（越小越靠前）</span>
                    <input
                      type="number"
                      value={editor.sortOrder}
                      onChange={(e) => setEditor({ ...editor, sortOrder: e.target.value })}
                    />
                  </label>
                </div>
                <div className="adm-field">
                  <span>出口标准 / 认证标签</span>
                  <div className="adm-chips">
                    {COMPLIANCE_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`adm-chip ${editor.compliance.includes(tag) ? "on" : ""}`}
                        onClick={() => toggleCompliance(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>4. 卖点文案与规格参数</h3>
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>英文卖点摘要</span>
                    <textarea
                      value={editor.summaryEn}
                      onChange={(e) => setEditor({ ...editor, summaryEn: e.target.value })}
                      placeholder="Short pitch shown on product list..."
                    />
                  </label>
                  <label className="adm-field">
                    <span>中文卖点摘要</span>
                    <textarea
                      value={editor.summaryZh}
                      onChange={(e) => setEditor({ ...editor, summaryZh: e.target.value })}
                      placeholder="简述核心配置与适用业态..."
                    />
                  </label>
                </div>
                <label className="adm-field">
                  <span>详细配置描述</span>
                  <textarea
                    value={editor.description}
                    onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                    placeholder="车体材质、电路标准、标配炉具、包装与集装箱装箱说明..."
                  />
                </label>

                <div className="adm-field">
                  <span>技术规格参数表</span>
                  {editor.specs.map((row, idx) => (
                    <div key={idx} className="adm-spec-row">
                      <input
                        placeholder="参数名，如 Food contact"
                        value={row.k}
                        onChange={(e) => {
                          const next = [...editor.specs];
                          next[idx] = { ...next[idx], k: e.target.value };
                          setEditor({ ...editor, specs: next });
                        }}
                      />
                      <input
                        placeholder="参数值，如 304 stainless steel"
                        value={row.v}
                        onChange={(e) => {
                          const next = [...editor.specs];
                          next[idx] = { ...next[idx], v: e.target.value };
                          setEditor({ ...editor, specs: next });
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-line adm-sm"
                        onClick={() => setEditor({ ...editor, specs: editor.specs.filter((_, i) => i !== idx) })}
                      >
                        删
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      type="button"
                      className="btn btn-line adm-sm"
                      onClick={() => setEditor({ ...editor, specs: [...editor.specs, { k: "", v: "" }] })}
                    >
                      + 添加参数行
                    </button>
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>5. 发布设置</h3>
                <div className="adm-actions">
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={editor.featured}
                      onChange={(e) => setEditor({ ...editor, featured: e.target.checked })}
                    />
                    <span>首页置顶推荐</span>
                  </label>
                  <button type="button" className="btn btn-lime" onClick={() => saveProduct("published")}>
                    保存并立即上架
                  </button>
                  <button type="button" className="btn btn-line" onClick={() => saveProduct("draft")}>
                    存为草稿
                  </button>
                  {editor.id ? (
                    <button type="button" className="btn btn-line" onClick={() => saveProduct("archived")}>
                      保存并下架
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="adm-preview">
              <div className="adm-preview-media">
                {editor.coverUrl || editor.gallery[0] ? (
                  <img src={editor.coverUrl || editor.gallery[0]} alt="预览主图" />
                ) : (
                  <span className="fine">上传实拍主图后在此预览</span>
                )}
              </div>
              <div className="adm-preview-body">
                <div className="adm-badges">
                  <span className={`adm-badge ${editor.status}`}>{STATUS_LABEL[editor.status]}</span>
                  {editor.featured ? <span className="adm-badge featured">首页推荐</span> : null}
                  <span className="adm-badge">{PLATFORM_LABEL[editor.platform]}</span>
                </div>
                <h3 style={{ marginTop: "0.45rem" }}>{editor.nameEn || "Untitled Model"}</h3>
                {editor.nameZh ? <div className="fine">{editor.nameZh}</div> : null}
                <div className="adm-preview-price">
                  ${previewLow.toLocaleString()} – ${previewHigh.toLocaleString()} <small>FOB USD</small>
                </div>
                <p className="fine">{editor.summaryEn || editor.summaryZh || "填写卖点摘要后在此实时预览"}</p>
                <p className="fine">
                  尺寸 {editor.length}×{editor.width}×{editor.height}m · MOQ {editor.moq} · {editor.leadDays}
                </p>
                {editor.compliance.length > 0 ? (
                  <div className="adm-badges" style={{ marginTop: "0.4rem" }}>
                    {editor.compliance.map((c) => (
                      <span key={c} className="adm-badge">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
                {editor.specs.filter((s) => s.k || s.v).length > 0 ? (
                  <ul className="adm-preview-specs">
                    {editor.specs
                      .filter((s) => s.k || s.v)
                      .slice(0, 5)
                      .map((s, i) => (
                        <li key={i}>
                          <span className="fine">{s.k}</span>
                          <b>{s.v}</b>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="adm-card">
        <div className="adm-bar-row">
          <div className="adm-tabs">
            {(
              [
                { id: "all", label: `全部 (${counts.all})` },
                { id: "published", label: `已上架 (${counts.published})` },
                { id: "draft", label: `草稿 (${counts.draft})` },
                { id: "archived", label: `已下架 (${counts.archived})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`adm-pill ${statusFilter === t.id ? "on" : ""}`}
                onClick={() => setStatusFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="adm-search-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索商品名 / SKU / Slug…"
              aria-label="搜索商品"
            />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as "all" | Platform)}
              aria-label="筛选车体"
            >
              <option value="all">全部车体</option>
              <option value="cart">手推车 Cart</option>
              <option value="trailer">拖车 Trailer</option>
              <option value="truck">卡车厢体 Truck</option>
            </select>
            <button type="button" className="btn btn-lime adm-sm" onClick={openNew}>
              + 新建上品
            </button>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="adm-batch">
            <b>已勾选 {selectedIds.length} 件商品</b>
            <button type="button" className="btn btn-ink adm-sm" onClick={() => batchStatus("published")}>
              批量上架
            </button>
            <button type="button" className="btn btn-line adm-sm" onClick={() => batchStatus("archived")}>
              批量下架
            </button>
            <button type="button" className="btn btn-line adm-sm adm-danger" onClick={() => deleteIds(selectedIds)}>
              批量删除
            </button>
          </div>
        ) : null}

        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelectedIds(allSelected ? [] : visible.map((p) => p.id))}
                    aria-label="全选"
                  />
                </th>
                <th>商品信息</th>
                <th>车体 / 尺寸 / 认证</th>
                <th>FOB 价格带</th>
                <th>状态</th>
                <th style={{ textAlign: "right" }}>快捷操作</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fine" style={{ textAlign: "center", padding: "1.8rem 0" }}>
                    暂无匹配商品，点击右上角「+ 新建上品」创建新车型。
                  </td>
                </tr>
              ) : null}
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() =>
                        setSelectedIds((cur) => (cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id]))
                      }
                      aria-label={`选择 ${p.nameZh}`}
                    />
                  </td>
                  <td>
                    <div className="adm-prod-cell">
                      {p.coverUrl ? (
                        <img className="adm-thumb" src={p.coverUrl} alt={p.nameEn} />
                      ) : (
                        <div className="adm-thumb-empty">矢量图</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {p.nameZh} <span className="fine">· {p.nameEn}</span>
                        </div>
                        <div className="fine">
                          SKU: {p.sku} · {p.gallery.length} 张实拍图 · 排序 {p.sortOrder}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      {PLATFORM_LABEL[p.platform]} · {p.length}×{p.width}×{p.height}m
                    </div>
                    <div className="fine">
                      {p.compliance.join(", ") || "未标注"} · {p.leadDays}
                    </div>
                  </td>
                  <td>
                    <b>
                      ${p.priceLow.toLocaleString()} – ${p.priceHigh.toLocaleString()}
                    </b>
                    <div className="fine">MOQ {p.moq}</div>
                  </td>
                  <td>
                    <div className="adm-badges">
                      <span className={`adm-badge ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                      {p.featured ? <span className="adm-badge featured">首页推荐</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button type="button" className="btn btn-line adm-sm" onClick={() => openEdit(p)}>
                        编辑
                      </button>
                      {p.status === "published" ? (
                        <button
                          type="button"
                          className="btn btn-line adm-sm"
                          onClick={() => quickPatch(p.id, { status: "archived" }, `已下架「${p.nameZh}」`)}
                        >
                          下架
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ink adm-sm"
                          onClick={() => quickPatch(p.id, { status: "published" }, `已上架「${p.nameZh}」`)}
                        >
                          上架
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-line adm-sm"
                        onClick={() =>
                          quickPatch(
                            p.id,
                            { featured: !p.featured },
                            p.featured ? `已取消推荐「${p.nameZh}」` : `已设为首页推荐「${p.nameZh}」`,
                          )
                        }
                      >
                        {p.featured ? "取消推荐" : "推首页"}
                      </button>
                      <button type="button" className="btn btn-line adm-sm" onClick={() => openEdit(p, true)}>
                        复制
                      </button>
                      <Link className="btn btn-line adm-sm" to={`/models/${p.id}`}>
                        前台预览
                      </Link>
                      <button
                        type="button"
                        className="btn btn-line adm-sm adm-danger"
                        onClick={() => deleteIds([p.id])}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-footer-tools">
          <button type="button" className="btn btn-line adm-sm" onClick={exportJson}>
            导出商品库 JSON
          </button>
          <button
            type="button"
            className="btn btn-line adm-sm"
            onClick={() => {
              if (window.confirm("确定恢复为初始默认车型数据吗？")) {
                reset();
                setNotice("已恢复默认车型库。");
              }
            }}
          >
            重置为默认数据
          </button>
        </div>
      </section>
    </>
  );
}

function OrdersWorkbench() {
  const { all: products } = useCatalog();
  const { orders, update } = useAdminOrders();
  const [activeId, setActiveId] = useState<string | null>(orders[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    company: "",
    country: "",
    email: "",
    whatsapp: "",
    productSlug: products[0]?.slug ?? "",
    totalUsd: "22000",
    notes: "",
  });

  const active = orders.find((o) => o.id === activeId) ?? orders[0] ?? null;

  function createOrder(e: React.FormEvent) {
    e.preventDefault();
    const prod = products.find((p) => p.slug === newOrder.productSlug);
    const code = `TH-${Math.floor(2400 + Math.random() * 600)}`;
    const record: AdminOrder = {
      id: `ord-${Date.now()}`,
      code,
      productSlug: prod?.slug ?? "",
      productName: prod ? `${prod.nameZh} · ${prod.nameEn}` : "定制车型",
      customerName: newOrder.customerName.trim(),
      company: newOrder.company.trim(),
      country: newOrder.country.trim(),
      email: newOrder.email.trim(),
      whatsapp: newOrder.whatsapp.trim(),
      status: "inquiry",
      totalUsd: Math.max(0, Math.round(Number(newOrder.totalUsd) || 0)),
      notes: newOrder.notes.trim(),
      payments: [],
      media: [],
      shipment: { carrier: "", trackingNo: "", etd: "", eta: "", status: "preparing", lastEvent: "" },
      updatedAt: new Date().toISOString(),
    };
    update([record, ...orders]);
    setActiveId(record.id);
    setCreating(false);
    setNotice(`已创建订单 ${code}（客户可在查单页用订单号 + 邮箱查询）`);
    setNewOrder({
      customerName: "",
      company: "",
      country: "",
      email: "",
      whatsapp: "",
      productSlug: products[0]?.slug ?? "",
      totalUsd: "22000",
      notes: "",
    });
  }

  function patchOrder(id: string, patch: Partial<AdminOrder>, msg?: string) {
    update(orders.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)));
    if (msg) setNotice(msg);
  }

  async function onUploadOrderPhoto(order: AdminOrder, file: File | null, title: string) {
    if (!file) return;
    const url = await compressImageFile(file, 1000);
    patchOrder(
      order.id,
      {
        media: [...order.media, { id: `m-${Date.now()}`, kind: "photo", title: title || file.name, url }],
        status: order.status === "deposit" || order.status === "producing" ? "ready" : order.status,
      },
      "已上传生产实拍图",
    );
  }

  return (
    <>
      {notice ? <p className="adm-ok">{notice}</p> : null}

      <section className="adm-card">
        <div className="adm-bar-row">
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>客户订单列表 ({orders.length})</h2>
            <p className="fine">点击任意订单维护收款记录、上传生产图与海运提单号，客户在「客户查单页」可实时查看。</p>
          </div>
          <button type="button" className="btn btn-lime adm-sm" onClick={() => setCreating((v) => !v)}>
            {creating ? "取消新建" : "+ 新建订单"}
          </button>
        </div>

        {creating ? (
          <form onSubmit={createOrder} className="adm-sec" style={{ marginBottom: "1rem" }}>
            <div className="adm-grid-3">
              <label className="adm-field">
                <span>客户姓名 *</span>
                <input
                  required
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>公司名称</span>
                <input
                  value={newOrder.company}
                  onChange={(e) => setNewOrder({ ...newOrder, company: e.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>国家 / 地区 *</span>
                <input
                  required
                  value={newOrder.country}
                  onChange={(e) => setNewOrder({ ...newOrder, country: e.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>邮箱 *</span>
                <input
                  required
                  type="email"
                  value={newOrder.email}
                  onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>关联上架商品</span>
                <select
                  value={newOrder.productSlug}
                  onChange={(e) => setNewOrder({ ...newOrder, productSlug: e.target.value })}
                >
                  <option value="">自定义方案</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.nameZh} ({p.sku})
                    </option>
                  ))}
                </select>
              </label>
              <label className="adm-field">
                <span>合同总额 (USD)</span>
                <input
                  type="number"
                  value={newOrder.totalUsd}
                  onChange={(e) => setNewOrder({ ...newOrder, totalUsd: e.target.value })}
                />
              </label>
            </div>
            <label className="adm-field">
              <span>备注</span>
              <input value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} />
            </label>
            <button type="submit" className="btn btn-ink adm-sm">
              保存订单
            </button>
          </form>
        ) : null}

        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户 / 国家</th>
                <th>车型</th>
                <th>状态</th>
                <th>合同额 / 已收款</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const paid = o.payments.reduce((sum, p) => sum + p.amountUsd, 0);
                const statusLabel = ORDER_FLOW.find((s) => s.id === o.status)?.label ?? o.status;
                return (
                  <tr key={o.id} className={active?.id === o.id ? "adm-row-on" : ""}>
                    <td>
                      <b>{o.code}</b>
                    </td>
                    <td>
                      {o.customerName} <span className="fine">· {o.country}</span>
                      <div className="fine">{o.email}</div>
                    </td>
                    <td>{o.productName}</td>
                    <td>
                      <span className="adm-badge published">{statusLabel}</span>
                    </td>
                    <td>
                      <b>${o.totalUsd.toLocaleString()}</b>
                      <div className="fine">已收 ${paid.toLocaleString()}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="btn btn-line adm-sm" onClick={() => setActiveId(o.id)}>
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {active ? (
        <section className="adm-card">
          <div className="adm-bar-row">
            <div>
              <h2 style={{ fontSize: "1.4rem" }}>
                订单详情 · {active.code}（{active.customerName} / {active.country}）
              </h2>
              <p className="fine">
                {active.productName} · 邮箱 {active.email}
              </p>
            </div>
          </div>

          <div className="adm-flow">
            {ORDER_FLOW.map((step, idx) => {
              const curIdx = ORDER_FLOW.findIndex((s) => s.id === active.status);
              const cls = step.id === active.status ? "on" : curIdx > idx ? "done" : "";
              return (
                <button
                  key={step.id}
                  type="button"
                  className={cls}
                  onClick={() => patchOrder(active.id, { status: step.id as OrderStatus }, `订单状态已更新为「${step.label}」`)}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          <div className="adm-grid-2">
            <div>
              <h3>收款记录</h3>
              <ul className="adm-list">
                {active.payments.map((p) => (
                  <li key={p.id}>
                    <b>
                      {p.kind} · ${p.amountUsd.toLocaleString()}
                    </b>
                    <span className="fine">
                      {p.method} · {p.paidAt} · {p.reference} {p.note}
                    </span>
                  </li>
                ))}
                {active.payments.length === 0 ? <li className="fine">暂无收款记录</li> : null}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const amount = Math.max(0, Math.round(Number(fd.get("amount")) || 0));
                  if (!amount) return;
                  patchOrder(
                    active.id,
                    {
                      payments: [
                        ...active.payments,
                        {
                          id: `p-${Date.now()}`,
                          kind: (fd.get("kind") as "deposit" | "progress" | "balance" | "other") || "deposit",
                          amountUsd: amount,
                          method: String(fd.get("method") || "TT"),
                          reference: String(fd.get("ref") || ""),
                          paidAt: String(fd.get("paidAt") || new Date().toISOString().slice(0, 10)),
                          note: String(fd.get("note") || ""),
                        },
                      ],
                    },
                    `已登记收款 $${amount.toLocaleString()}`,
                  );
                  e.currentTarget.reset();
                }}
              >
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>款项类型</span>
                    <select name="kind" defaultValue="deposit">
                      <option value="deposit">定金 deposit</option>
                      <option value="progress">进度款 progress</option>
                      <option value="balance">尾款 balance</option>
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>金额 USD</span>
                    <input name="amount" type="number" required placeholder="5000" />
                  </label>
                </div>
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>水单号</span>
                    <input name="ref" placeholder="SWIFT-..." />
                  </label>
                  <label className="adm-field">
                    <span>备注</span>
                    <input name="note" placeholder="30% 定金" />
                  </label>
                </div>
                <button type="submit" className="btn btn-line adm-sm">
                  + 登记收款
                </button>
              </form>
            </div>

            <div>
              <h3>生产实拍图 & 物流跟踪</h3>
              <div className="adm-gallery" style={{ marginBottom: "0.75rem" }}>
                {active.media.map((m) => (
                  <div key={m.id} className="adm-gitem">
                    <img src={m.url} alt={m.title} />
                    <div className="adm-gbar">
                      <span className="fine">{m.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              <label className="btn btn-line adm-sm" style={{ cursor: "pointer", marginBottom: "0.9rem" }}>
                + 上传生产进度图
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    onUploadOrderPhoto(active, e.target.files?.[0] ?? null, "工厂生产实拍");
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  patchOrder(
                    active.id,
                    {
                      shipment: {
                        carrier: String(fd.get("carrier") || ""),
                        trackingNo: String(fd.get("trackingNo") || ""),
                        etd: String(fd.get("etd") || ""),
                        eta: String(fd.get("eta") || ""),
                        status: String(fd.get("status") || "preparing"),
                        lastEvent: String(fd.get("lastEvent") || ""),
                      },
                    },
                    "已更新海运物流信息",
                  );
                }}
              >
                <div className="adm-grid-2">
                  <label className="adm-field">
                    <span>船司 / 货代</span>
                    <input name="carrier" defaultValue={active.shipment.carrier} key={`${active.id}-c`} />
                  </label>
                  <label className="adm-field">
                    <span>提单 / 柜号</span>
                    <input name="trackingNo" defaultValue={active.shipment.trackingNo} key={`${active.id}-t`} />
                  </label>
                  <label className="adm-field">
                    <span>开船日 ETD</span>
                    <input name="etd" type="date" defaultValue={active.shipment.etd} key={`${active.id}-etd`} />
                  </label>
                  <label className="adm-field">
                    <span>到港日 ETA</span>
                    <input name="eta" type="date" defaultValue={active.shipment.eta} key={`${active.id}-eta`} />
                  </label>
                </div>
                <label className="adm-field">
                  <span>最新物流动态</span>
                  <input name="lastEvent" defaultValue={active.shipment.lastEvent} key={`${active.id}-ev`} />
                </label>
                <button type="submit" className="btn btn-ink adm-sm">
                  保存物流信息
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
