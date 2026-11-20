import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultDraft, sales, sanitize } from "./data";
import type { Draft, Lang } from "./types";

type State = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  resetTruck: () => void;
};

const Ctx = createContext<State | null>(null);

export function AppState({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("yuanhuo-lang");
      if (saved === "en" || saved === "zh") return saved;
    } catch {
      /* storage unavailable */
    }
    if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) return "zh";
    return "en";
  });

  const [draft, setDraftState] = useState<Draft>(() => {
    try {
      const raw = sessionStorage.getItem("yuanhuo-draft-v1");
      return sanitize(raw ? (JSON.parse(raw) as Partial<Draft>) : null);
    } catch {
      return sanitize(null);
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.lang = lang;
    try {
      localStorage.setItem("yuanhuo-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    try {
      sessionStorage.setItem("yuanhuo-draft-v1", JSON.stringify(draft));
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
