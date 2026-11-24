import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { copy } from "./copy";
import { sales } from "./data";
import { MascotGuide } from "./Mascot";
import { initReveals } from "./motion";
import { useApp } from "./state";
import { LANGS, type Lang } from "./types";

export function Mark({ large = false }: { large?: boolean }) {
  return (
    <img
      className={large ? "mark mark-lg" : "mark"}
      src={sales.logoSrc}
      alt=""
      width={large ? 56 : 40}
      height={large ? 56 : 40}
    />
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
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let stop = () => undefined as void;
    const frame = window.requestAnimationFrame(() => {
      stop = initReveals(document.getElementById("content") ?? document);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      stop();
    };
  }, [location.pathname, lang]);

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
            <small>{lang === "zh" ? sales.brandEn : sales.brandSubEn}</small>
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
          {sales.portalUrl ? (
            <a href={`${sales.portalUrl.replace(/\/$/, "")}/track`}>{text.nav.track}</a>
          ) : (
            <NavLink to="/track">{text.nav.track}</NavLink>
          )}
        </nav>
        <LangPicker />
      </header>
      <main id="content">{children}</main>
      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <Mark large />
            <p>
              {lang === "zh" ? sales.brandZh : `${sales.brandEn} ${sales.brandSubEn}`}
              <span> · {text.footerPlace}</span>
            </p>
          </div>
          <div style={{ display: "grid", gap: "0.35rem", justifyItems: "end" }}>
            <p className="fine" style={{ margin: 0 }}>{text.footerNote}</p>
            <Link className="fine foot-admin-link" to="/admin">
              {lang === "zh" ? "运营后台（上品 / 订单）→" : "Ops Admin →"}
            </Link>
          </div>
        </div>
      </footer>
      {!isAdminRoute ? <MascotGuide /> : null}
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
