import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { copy } from "./copy";
import { sales } from "./data";
import { useApp } from "./state";

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="4" fill="#e2f56b" />
      <rect x="5" y="8" width="22" height="12" fill="#14352b" />
      <rect x="5" y="22" width="22" height="3" fill="#14352b" />
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useApp();
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
            <strong>{lang === "zh" ? sales.brandZh : sales.brandEn}</strong>
            <small>{lang === "zh" ? sales.brandEn : sales.brandZh}</small>
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
        <button type="button" className="lang" onClick={() => setLang(lang === "en" ? "zh" : "en")}>
          {text.langSwitch}
        </button>
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
