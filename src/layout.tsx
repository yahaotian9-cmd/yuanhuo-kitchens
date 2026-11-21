import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { copy } from "./copy";
import { sales } from "./data";
import { useApp } from "./state";
import { LANGS, type Lang } from "./types";

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="3" fill="#dce86a" />
      <rect x="6" y="9" width="20" height="10" fill="#0f2f27" />
      <rect x="6" y="21" width="20" height="2.5" fill="#0f2f27" />
    </svg>
  );
}

function LangPicker() {
  const { lang, setLang } = useApp();
  const text = copy[lang];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((item) => item.id === lang) ?? LANGS[0];

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="lang-wrap" ref={ref}>
      <button
        type="button"
        className="lang"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={text.langLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {current.code}
      </button>
      {open ? (
        <ul className="lang-menu" role="listbox" aria-label={text.langLabel}>
          {LANGS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === lang}
                className={item.id === lang ? "on" : ""}
                onClick={() => {
                  setLang(item.id as Lang);
                  setOpen(false);
                }}
              >
                <span>{item.code}</span>
                <em>{item.name}</em>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { lang } = useApp();
  const text = copy[lang];
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <a className="skip" href="#content">
        {text.skip}
      </a>
      <header className="bar">
        <NavLink to="/" end className="brand">
          <Mark />
          <span>
            <strong>{lang === "zh" || lang === "ar" ? sales.brandZh : sales.brandEn}</strong>
            <small>{lang === "zh" || lang === "ar" ? sales.brandEn : sales.brandZh}</small>
          </span>
        </NavLink>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? text.closeMenu : text.menuLabel}
        </button>
        <nav id="site-nav" className={open ? "nav open" : "nav"}>
          <NavLink to="/models">{text.nav.models}</NavLink>
          <NavLink to="/build">{text.nav.build}</NavLink>
          <NavLink to="/workshop">{text.nav.workshop}</NavLink>
          <NavLink to="/layouts">{text.nav.layouts}</NavLink>
          <NavLink to="/inquiry">{text.nav.inquiry}</NavLink>
        </nav>
        <LangPicker />
      </header>
      <main id="content">{children}</main>
      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <Mark />
            <p>
              {lang === "zh" ? sales.brandZh : sales.brandEn}
              <span> · {text.footerPlace}</span>
            </p>
          </div>
          <p className="fine">{text.footerNote}</p>
        </div>
      </footer>
    </>
  );
}

export function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <header className="page-head">
      <div className="wrap">
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </header>
  );
}
