import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultDraft, sales, sanitize } from "./data";
import { isLang, LANGS, type Draft, type Lang } from "./types";

type State = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  resetTruck: () => void;
};

const Ctx = createContext<State | null>(null);

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("yuanhuo-lang");
    if (isLang(saved)) return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

function readSharedDraft(): Partial<Draft> | null {
  try {
    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    if (qIndex < 0) return null;
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    const raw = params.get("c");
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw.replace(/-/g, "+").replace(/_/g, "/"))));
    return JSON.parse(json) as Partial<Draft>;
  } catch {
    return null;
  }
}

export function encodeDraft(draft: Draft): string {
  const slim: Partial<Draft> = {
    menu: draft.menu,
    platform: draft.platform,
    length: draft.length,
    market: draft.market,
    heat: draft.heat,
    windows: draft.windows,
    tone: draft.tone,
    generator: draft.generator,
    qty: draft.qty,
    shore: draft.shore,
    gasOk: draft.gasOk,
  };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function shareUrl(draft: Draft): string {
  const base = `${window.location.origin}${window.location.pathname}#/build?c=${encodeDraft(draft)}`;
  return base;
}

export function AppState({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);
  const [draft, setDraftState] = useState<Draft>(() => {
    const shared = typeof window !== "undefined" ? readSharedDraft() : null;
    if (shared) return sanitize(shared);
    try {
      const raw = sessionStorage.getItem("yuanhuo-draft-v2");
      return sanitize(raw ? (JSON.parse(raw) as Partial<Draft>) : null);
    } catch {
      return sanitize(null);
    }
  });

  useEffect(() => {
    const meta = LANGS.find((item) => item.id === lang) ?? LANGS[0];
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.documentElement.dir = meta.dir;
    document.documentElement.dataset.lang = lang;
    try {
      localStorage.setItem("yuanhuo-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    try {
      sessionStorage.setItem("yuanhuo-draft-v2", JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => sanitize({ ...prev, ...patch }));
  const resetTruck = () =>
    setDraftState((prev) =>
      sanitize({
        ...defaultDraft,
        name: prev.name,
        company: prev.company,
        country: prev.country,
        email: prev.email,
        whatsapp: prev.whatsapp,
        note: prev.note,
      }),
    );

  return <Ctx.Provider value={{ lang, setLang, draft, setDraft, resetTruck }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside AppState");
  return value;
}

export function useTitle(page: string) {
  const { lang } = useApp();
  useEffect(() => {
    const brand = lang === "zh" ? sales.brandZh : sales.brandEn;
    document.title = `${page} · ${brand}`;
  }, [page, lang]);
}
