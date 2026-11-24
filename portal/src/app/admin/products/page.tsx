"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import {
  BODY_TYPE_LABEL,
  CATEGORY_OPTIONS,
  COMPLIANCE_TAGS,
  PRODUCT_STATUS_LABEL,
  parseJsonArray,
  slugify,
  type BodyType,
  type ProductRecord,
  type ProductSpec,
  type ProductStatus,
} from "@/lib/products";

type Counts = {
  all: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
};

type EditorState = {
  id: number | null;
  slug: string;
  sku: string;
  name: string;
  name_zh: string;
  summary: string;
  summary_zh: string;
  description: string;
  body_type: BodyType;
  category: string;
  length_m: string;
  width_m: string;
  height_m: string;
  base_price_usd: string;
  price_high_usd: string;
  moq: string;
  lead_days: string;
  compliance: string[];
  cover_url: string;
  gallery: string[];
  specs: ProductSpec[];
  status: ProductStatus;
  featured: boolean;
  sort_order: string;
};

function emptyEditor(): EditorState {
  return {
    id: null,
    slug: "",
    sku: "",
    name: "",
    name_zh: "",
    summary: "",
    summary_zh: "",
    description: "",
    body_type: "trailer",
    category: "fried",
    length_m: "5.2",
    width_m: "2.1",
    height_m: "2.5",
    base_price_usd: "19500",
    price_high_usd: "26500",
    moq: "1",
    lead_days: "25–35 days",
    compliance: ["EU CE", "US DOT/NSF"],
    cover_url: "",
    gallery: [],
    specs: [
      { k: "Food contact", v: "304 stainless steel" },
      { k: "Power", v: "230V/50Hz or 120/240V/60Hz" },
      { k: "Water system", v: "2×60L fresh + 120L grey" },
    ],
    status: "published",
    featured: false,
    sort_order: "100",
  };
}

function recordToEditor(p: ProductRecord, asCopy = false): EditorState {
  const gallery = parseJsonArray<string>(p.gallery_json, p.cover_url ? [p.cover_url] : []);
  if (p.cover_url && !gallery.includes(p.cover_url)) gallery.unshift(p.cover_url);
  const specs = parseJsonArray<ProductSpec>(p.specs_json, []);
  const comp = (p.compliance || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: asCopy ? null : p.id,
    slug: asCopy ? `${p.slug}-copy` : p.slug,
    sku: asCopy ? `${p.sku}-B` : p.sku,
    name: asCopy ? `${p.name} (Copy)` : p.name,
    name_zh: asCopy ? `${p.name_zh || p.name}（副本）` : p.name_zh || "",
    summary: p.summary || "",
    summary_zh: p.summary_zh || "",
    description: p.description || "",
    body_type: p.body_type || "trailer",
    category: p.category || "mixed",
    length_m: String(p.length_m ?? 5.2),
    width_m: String(p.width_m ?? 2.1),
    height_m: String(p.height_m ?? 2.5),
    base_price_usd: String(p.base_price_usd ?? 0),
    price_high_usd: String(p.price_high_usd || p.base_price_usd || 0),
    moq: String(p.moq ?? 1),
    lead_days: p.lead_days || "25–40 days",
    compliance: comp,
    cover_url: p.cover_url || gallery[0] || "",
    gallery,
    specs: specs.length > 0 ? specs : [{ k: "", v: "" }],
    status: asCopy ? "draft" : p.status,
    featured: asCopy ? false : Boolean(p.featured),
    sort_order: String(p.sort_order ?? 100),
  };
}

async function compressImageFile(file: File, maxDim = 1280): Promise<string> {
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
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, published: 0, draft: 0, archived: 0, featured: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bodyFilter, setBodyFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (bodyFilter !== "all") qs.set("body_type", bodyFilter);
    if (query.trim()) qs.set("q", query.trim());
    const res = await fetch(`/api/admin/products?${qs.toString()}`);
    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const json = await res.json();
    setProducts(json.products || []);
    if (json.counts) setCounts(json.counts);
  }, [statusFilter, bodyFilter, query]);

  useEffect(() => {
    load().catch(() => setError("加载商品列表失败"));
  }, [load]);

  function openNew() {
    setError(null);
    setNotice(null);
    setEditor(emptyEditor());
    setEditorOpen(true);
  }

  function openEdit(p: ProductRecord, asCopy = false) {
    setError(null);
    setNotice(null);
    setEditor(recordToEditor(p, asCopy));
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
        return { ...cur, gallery: nextGallery, cover_url: cur.cover_url || nextGallery[0] || "" };
      });
    }
  }

  function addImageUrl() {
    const clean = urlInput.trim();
    if (!clean) return;
    setEditor((cur) => {
      const nextGallery = cur.gallery.includes(clean) ? cur.gallery : [...cur.gallery, clean].slice(0, 12);
      return { ...cur, gallery: nextGallery, cover_url: cur.cover_url || clean };
    });
    setUrlInput("");
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
      return { ...cur, gallery: next, cover_url: cur.cover_url === url ? next[0] || "" : cur.cover_url };
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

  async function submitProduct(overrideStatus?: ProductStatus) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const targetStatus = overrideStatus ?? editor.status;
      const payload = {
        id: editor.id,
        slug: editor.slug.trim() || slugify(editor.name || editor.name_zh),
        sku: editor.sku.trim(),
        name: editor.name.trim(),
        name_zh: editor.name_zh.trim(),
        summary: editor.summary.trim(),
        summary_zh: editor.summary_zh.trim(),
        description: editor.description.trim(),
        body_type: editor.body_type,
        category: editor.category,
        length_m: Number(editor.length_m) || 5.2,
        width_m: Number(editor.width_m) || 2.1,
        height_m: Number(editor.height_m) || 2.5,
        base_price_usd: Number(editor.base_price_usd) || 0,
        price_high_usd: Number(editor.price_high_usd) || Number(editor.base_price_usd) || 0,
        moq: Number(editor.moq) || 1,
        lead_days: editor.lead_days.trim(),
        compliance: editor.compliance.join(", "),
        cover_url: editor.cover_url || editor.gallery[0] || "",
        gallery: editor.gallery,
        specs: editor.specs.filter((s) => s.k.trim() || s.v.trim()),
        status: targetStatus,
        featured: editor.featured,
        sort_order: Number(editor.sort_order) || 100,
      };
      const res = await fetch("/api/admin/products", {
        method: editor.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "保存失败");
        return;
      }
      setNotice(
        editor.id
          ? `已保存商品「${payload.name_zh || payload.name}」`
          : `已创建商品「${payload.name_zh || payload.name}」（${PRODUCT_STATUS_LABEL[targetStatus]}）`,
      );
      setEditorOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function quickPatch(id: number, patch: Record<string, unknown>, message: string) {
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) {
      setError("操作失败");
      return;
    }
    setNotice(message);
    await load();
  }

  async function deleteIds(ids: number[]) {
    if (ids.length === 0) return;
    if (!window.confirm(`确定删除选中的 ${ids.length} 个商品吗？此操作不可撤销。`)) return;
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      setError("删除失败");
      return;
    }
    setSelectedIds([]);
    setNotice(`已删除 ${ids.length} 个商品`);
    await load();
  }

  async function batchStatus(status: ProductStatus) {
    if (selectedIds.length === 0) return;
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, status }),
    });
    if (!res.ok) {
      setError("批量操作失败");
      return;
    }
    setSelectedIds([]);
    setNotice(`已批量将 ${selectedIds.length} 个商品设为「${PRODUCT_STATUS_LABEL[status]}」`);
    await load();
  }

  const allSelected = useMemo(
    () => products.length > 0 && products.every((p) => selectedIds.includes(p.id)),
    [products, selectedIds],
  );

  function toggleAll() {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(products.map((p) => p.id));
  }

  function toggleOne(id: number) {
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const previewLow = Number(editor.base_price_usd) || 0;
  const previewHigh = Math.max(previewLow, Number(editor.price_high_usd) || previewLow);

  return (
    <Shell admin>
      <div className="page-top">
        <div>
          <h1>商品上品管理</h1>
          <p className="fine">维护外贸餐车车型库：上传多图、设置 FOB 价格带、出口认证、技术参数与上下架状态。</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="btn lime" type="button" onClick={openNew}>
            + 新建上品
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span>全部商品</span>
          <strong>{counts.all}</strong>
        </div>
        <div className="kpi-card">
          <span>已上架（前台可见）</span>
          <strong>{counts.published}</strong>
        </div>
        <div className="kpi-card">
          <span>草稿箱</span>
          <strong>{counts.draft}</strong>
        </div>
        <div className="kpi-card">
          <span>已下架</span>
          <strong>{counts.archived}</strong>
        </div>
        <div className="kpi-card accent">
          <span>首页推荐</span>
          <strong>{counts.featured}</strong>
        </div>
      </div>

      {error ? <p className="warn">{error}</p> : null}
      {notice ? <p className="ok">{notice}</p> : null}

      {editorOpen ? (
        <section className="card">
          <div className="page-top">
            <div>
              <h2>{editor.id ? `编辑商品 #${editor.id}` : "新建商品上品"}</h2>
              <p className="fine">左侧填写完整参数并上传实拍图，右侧实时预览海外买家看到的效果。</p>
            </div>
            <button className="btn line sm" type="button" onClick={() => setEditorOpen(false)}>
              收起编辑器
            </button>
          </div>

          <div className="editor-shell">
            <div>
              <div className="editor-section">
                <h3>1. 基础信息</h3>
                <div className="grid grid-2">
                  <label className="field">
                    <span>英文商品标题（海外买家可见）*</span>
                    <input
                      value={editor.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditor((cur) => ({
                          ...cur,
                          name: val,
                          slug: cur.id || cur.slug ? cur.slug : slugify(val),
                        }));
                      }}
                      placeholder="e.g. 5.2m Double-Fryer Food Trailer"
                    />
                  </label>
                  <label className="field">
                    <span>中文商品名（国内运营识别）</span>
                    <input
                      value={editor.name_zh}
                      onChange={(e) => setEditor({ ...editor, name_zh: e.target.value })}
                      placeholder="例如：5.2米双篮炸炉餐车"
                    />
                  </label>
                  <label className="field">
                    <span>SKU / 型号编码</span>
                    <input
                      value={editor.sku}
                      onChange={(e) => setEditor({ ...editor, sku: e.target.value })}
                      placeholder="留空自动生成，如 TH-TR-520"
                    />
                  </label>
                  <label className="field">
                    <span>URL Slug</span>
                    <input
                      value={editor.slug}
                      onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
                      placeholder="fry-trailer-520"
                    />
                  </label>
                  <label className="field">
                    <span>车体类型</span>
                    <select
                      value={editor.body_type}
                      onChange={(e) => setEditor({ ...editor, body_type: e.target.value as BodyType })}
                    >
                      <option value="cart">手推车 Cart</option>
                      <option value="trailer">拖车 Trailer</option>
                      <option value="truck">卡车厢体 Truck</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>主营菜品分类</span>
                    <select
                      value={editor.category}
                      onChange={(e) => setEditor({ ...editor, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="editor-section">
                <h3>2. 商品实拍图与封面主图</h3>
                <div className="upload-box">
                  <label className="btn line sm" style={{ margin: 0 }}>
                    上传本地图片（支持多选）
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
                    style={{ flex: 1, minWidth: 200, padding: "0.45rem 0.65rem", border: "1px solid var(--line)", borderRadius: 8 }}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="或粘贴图片外链 https://..."
                  />
                  <button className="btn line sm" type="button" onClick={addImageUrl}>
                    添加外链
                  </button>
                </div>
                {editor.gallery.length > 0 ? (
                  <div className="gallery-list">
                    {editor.gallery.map((url, idx) => {
                      const isCover = editor.cover_url === url || (!editor.cover_url && idx === 0);
                      return (
                        <div key={`${url.slice(0, 32)}-${idx}`} className={`gallery-item ${isCover ? "is-cover" : ""}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`图 ${idx + 1}`} />
                          <div className="gallery-item-bar">
                            <button
                              type="button"
                              onClick={() => setEditor({ ...editor, cover_url: url })}
                              style={isCover ? { background: "var(--orange)", color: "#fff", borderColor: "var(--orange)" } : undefined}
                            >
                              {isCover ? "主图" : "设主图"}
                            </button>
                            <button type="button" onClick={() => moveGallery(idx, -1)} disabled={idx === 0}>
                              ←
                            </button>
                            <button type="button" onClick={() => moveGallery(idx, 1)} disabled={idx === editor.gallery.length - 1}>
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
                  <p className="fine" style={{ marginTop: "0.5rem" }}>
                    暂未上传图片。上传后自动压缩，最多支持 12 张图并可切换主图顺序。
                  </p>
                )}
              </div>

              <div className="editor-section">
                <h3>3. 报价、尺寸与出口合规</h3>
                <div className="grid grid-3">
                  <label className="field">
                    <span>FOB 最低价 (USD)</span>
                    <input
                      type="number"
                      value={editor.base_price_usd}
                      onChange={(e) => setEditor({ ...editor, base_price_usd: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>FOB 最高价 (USD)</span>
                    <input
                      type="number"
                      value={editor.price_high_usd}
                      onChange={(e) => setEditor({ ...editor, price_high_usd: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>起订量 MOQ</span>
                    <input type="number" min={1} value={editor.moq} onChange={(e) => setEditor({ ...editor, moq: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>车长 L (m)</span>
                    <input value={editor.length_m} onChange={(e) => setEditor({ ...editor, length_m: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>车宽 W (m)</span>
                    <input value={editor.width_m} onChange={(e) => setEditor({ ...editor, width_m: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>车高 H (m)</span>
                    <input value={editor.height_m} onChange={(e) => setEditor({ ...editor, height_m: e.target.value })} />
                  </label>
                </div>
                <div className="grid grid-2">
                  <label className="field">
                    <span>交期 Lead time</span>
                    <input
                      value={editor.lead_days}
                      onChange={(e) => setEditor({ ...editor, lead_days: e.target.value })}
                      placeholder="25–35 days"
                    />
                  </label>
                  <label className="field">
                    <span>排序权重（越小越靠前）</span>
                    <input
                      type="number"
                      value={editor.sort_order}
                      onChange={(e) => setEditor({ ...editor, sort_order: e.target.value })}
                    />
                  </label>
                </div>
                <div className="field">
                  <span>出口认证 / 目标市场标准</span>
                  <div className="chip-group">
                    {COMPLIANCE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`chip ${editor.compliance.includes(tag) ? "on" : ""}`}
                        onClick={() => toggleCompliance(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="editor-section">
                <h3>4. 卖点文案与技术参数表</h3>
                <div className="grid grid-2">
                  <label className="field">
                    <span>英文卖点摘要</span>
                    <textarea
                      value={editor.summary}
                      onChange={(e) => setEditor({ ...editor, summary: e.target.value })}
                      placeholder="One-line pitch for overseas buyers"
                    />
                  </label>
                  <label className="field">
                    <span>中文卖点摘要</span>
                    <textarea
                      value={editor.summary_zh}
                      onChange={(e) => setEditor({ ...editor, summary_zh: e.target.value })}
                      placeholder="一句话说明核心配置与适用场景"
                    />
                  </label>
                </div>
                <label className="field">
                  <span>详细配置说明</span>
                  <textarea
                    value={editor.description}
                    onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                    placeholder="标准配置、选配炉具、包装与集装箱装柜说明…"
                  />
                </label>

                <div className="field">
                  <span>技术参数行（前台规格表展示）</span>
                  {editor.specs.map((row, idx) => (
                    <div key={idx} className="spec-row">
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
                        className="btn line sm"
                        onClick={() => setEditor({ ...editor, specs: editor.specs.filter((_, i) => i !== idx) })}
                      >
                        删
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      type="button"
                      className="btn line sm"
                      onClick={() => setEditor({ ...editor, specs: [...editor.specs, { k: "", v: "" }] })}
                    >
                      + 添加参数行
                    </button>
                  </div>
                </div>
              </div>

              <div className="editor-section">
                <h3>5. 发布选项</h3>
                <div className="actions">
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", marginRight: "1rem" }}>
                    <input
                      type="checkbox"
                      checked={editor.featured}
                      onChange={(e) => setEditor({ ...editor, featured: e.target.checked })}
                    />
                    <span>设为首页推荐置顶</span>
                  </label>
                  <button className="btn lime" type="button" disabled={saving} onClick={() => submitProduct("published")}>
                    {saving ? "保存中…" : "保存并立即上架"}
                  </button>
                  <button className="btn line" type="button" disabled={saving} onClick={() => submitProduct("draft")}>
                    存入草稿箱
                  </button>
                  {editor.id ? (
                    <button className="btn line" type="button" disabled={saving} onClick={() => submitProduct("archived")}>
                      保存并下架
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="preview-card">
              <div className="preview-media">
                {editor.cover_url || editor.gallery[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editor.cover_url || editor.gallery[0]} alt="前台预览主图" />
                ) : (
                  <span className="fine">上传主图后在此预览</span>
                )}
              </div>
              <div className="preview-body">
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                  <span className={`badge ${editor.status}`}>{PRODUCT_STATUS_LABEL[editor.status]}</span>
                  {editor.featured ? <span className="badge featured">首页推荐</span> : null}
                  <span className="badge">{BODY_TYPE_LABEL[editor.body_type]}</span>
                </div>
                <h3 style={{ margin: "0.2rem 0" }}>{editor.name || "Untitled Food Trailer"}</h3>
                {editor.name_zh ? <div className="fine">{editor.name_zh}</div> : null}
                <div className="preview-price">
                  ${previewLow.toLocaleString()} – ${previewHigh.toLocaleString()} <span className="fine">FOB</span>
                </div>
                <p className="fine" style={{ marginBottom: "0.4rem" }}>
                  {editor.summary || editor.summary_zh || "填写卖点摘要后将展示在此处"}
                </p>
                <div className="fine">
                  尺寸：{editor.length_m || "—"} × {editor.width_m || "—"} × {editor.height_m || "—"} m · MOQ {editor.moq || 1} · 交期 {editor.lead_days || "—"}
                </div>
                {editor.compliance.length > 0 ? (
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.45rem" }}>
                    {editor.compliance.map((c) => (
                      <span key={c} className="badge">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
                {editor.specs.filter((s) => s.k || s.v).length > 0 ? (
                  <ul className="preview-specs">
                    {editor.specs
                      .filter((s) => s.k || s.v)
                      .slice(0, 5)
                      .map((s, i) => (
                        <li key={i}>
                          <span className="fine">{s.k}</span>
                          <strong>{s.v}</strong>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="toolbar">
          <div className="tabs">
            {[
              { id: "all", label: `全部 (${counts.all})` },
              { id: "published", label: `已上架 (${counts.published})` },
              { id: "draft", label: `草稿 (${counts.draft})` },
              { id: "archived", label: `已下架 (${counts.archived})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab-btn ${statusFilter === t.id ? "on" : ""}`}
                onClick={() => setStatusFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="search-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜商品名 / SKU / Slug…"
              aria-label="搜索商品"
            />
            <select value={bodyFilter} onChange={(e) => setBodyFilter(e.target.value)} aria-label="按车体筛选">
              <option value="all">全部车体</option>
              <option value="cart">手推车 Cart</option>
              <option value="trailer">拖车 Trailer</option>
              <option value="truck">卡车厢体 Truck</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="batch-bar">
            <strong>已选 {selectedIds.length} 项</strong>
            <button className="btn sm" type="button" onClick={() => batchStatus("published")}>
              批量上架
            </button>
            <button className="btn line sm" type="button" onClick={() => batchStatus("archived")}>
              批量下架
            </button>
            <button className="btn danger sm" type="button" onClick={() => deleteIds(selectedIds)}>
              批量删除
            </button>
          </div>
        ) : null}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="全选" />
                </th>
                <th>商品 / SKU</th>
                <th>规格与合规</th>
                <th>FOB 价格带</th>
                <th>状态</th>
                <th style={{ textAlign: "right" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fine" style={{ textAlign: "center", padding: "2rem 0" }}>
                    暂无符合条件的商品，点击右上角「+ 新建上品」开始添加。
                  </td>
                </tr>
              ) : null}
              {products.map((p) => {
                const high = Math.max(Number(p.base_price_usd), Number(p.price_high_usd || 0));
                const galleryCount = parseJsonArray<string>(p.gallery_json).length;
                return (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleOne(p.id)}
                        aria-label={`选择 ${p.name}`}
                      />
                    </td>
                    <td>
                      <div className="prod-cell">
                        {p.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="prod-thumb" src={p.cover_url} alt={p.name} />
                        ) : (
                          <div className="prod-thumb-empty">无图</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {p.name_zh ? `${p.name_zh} · ` : ""}
                            {p.name}
                          </div>
                          <div className="fine">
                            {p.sku || p.slug} · {galleryCount} 张图 · 排序 {p.sort_order}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {BODY_TYPE_LABEL[p.body_type] || p.body_type} · {p.length_m}×{p.width_m}×{p.height_m}m
                      </div>
                      <div className="fine">{p.compliance || "未标注认证"} · {p.lead_days}</div>
                    </td>
                    <td>
                      <strong>
                        ${Number(p.base_price_usd).toLocaleString()}
                        {high > Number(p.base_price_usd) ? ` – $${high.toLocaleString()}` : ""}
                      </strong>
                      <div className="fine">MOQ {p.moq || 1}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
                        <span className={`badge ${p.status}`}>{PRODUCT_STATUS_LABEL[p.status]}</span>
                        {p.featured ? <span className="badge featured">首页推荐</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn line sm" type="button" onClick={() => openEdit(p)}>
                          编辑
                        </button>
                        {p.status === "published" ? (
                          <button
                            className="btn line sm"
                            type="button"
                            onClick={() => quickPatch(p.id, { status: "archived" }, `已下架「${p.name_zh || p.name}」`)}
                          >
                            下架
                          </button>
                        ) : (
                          <button
                            className="btn sm"
                            type="button"
                            onClick={() => quickPatch(p.id, { status: "published" }, `已上架「${p.name_zh || p.name}」`)}
                          >
                            上架
                          </button>
                        )}
                        <button
                          className="btn line sm"
                          type="button"
                          onClick={() =>
                            quickPatch(
                              p.id,
                              { featured: !p.featured },
                              p.featured ? `已取消推荐「${p.name_zh || p.name}」` : `已设为首页推荐「${p.name_zh || p.name}」`,
                            )
                          }
                        >
                          {p.featured ? "取消推荐" : "推首页"}
                        </button>
                        <button className="btn line sm" type="button" onClick={() => openEdit(p, true)}>
                          复制
                        </button>
                        <button className="btn danger sm" type="button" onClick={() => deleteIds([p.id])}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
