import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { copy } from "./copy";
import { sales } from "./data";
import { useApp } from "./state";

const HIDE_KEY = "taihong-mascot-hide";

function tipForPath(pathname: string, mascot: (typeof copy)["en"]["mascot"]) {
  if (pathname === "/" || pathname === "") return mascot.home;
  if (pathname.startsWith("/build")) return mascot.build;
  if (pathname.startsWith("/inquiry")) return mascot.inquiry;
  if (pathname.startsWith("/workshop")) return mascot.workshop;
  return mascot.default;
}

export function MascotGuide() {
  const { lang } = useApp();
  const text = copy[lang];
  const location = useLocation();
  const tip = useMemo(() => tipForPath(location.pathname, text.mascot), [location.pathname, text.mascot]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, side: 0 });

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
    } catch {
      /* ignore */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), reduce ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    if (hidden || !ready) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    function onMove(event: MouseEvent) {
      const node = rootRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.45;
      const dx = (event.clientX - cx) / Math.max(window.innerWidth, 1);
      const dy = (event.clientY - cy) / Math.max(window.innerHeight, 1);
      const side = Math.max(-1, Math.min(1, (cx - event.clientX) / 280));
      setTilt({
        x: Math.max(-8, Math.min(8, dy * -10)),
        y: Math.max(-12, Math.min(12, dx * 14)),
        side: side > 0.35 ? Math.min(1, (side - 0.35) / 0.45) : 0,
      });
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [hidden, ready]);

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function show() {
    setHidden(false);
    setOpen(true);
    setReady(true);
    try {
      localStorage.removeItem(HIDE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (hidden) {
    return (
      <button type="button" className="mascot-reopen" onClick={show} aria-label={text.mascot.reopen}>
        <img src={sales.mascotSrc} alt="" width={48} height={48} />
        <span>{text.mascot.reopen}</span>
      </button>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`mascot-guide${ready ? " is-ready" : ""}${open ? " is-open" : ""}`}
      aria-label={text.mascot.label}
    >
      <div className={`mascot-bubble${open ? " is-open" : ""}`} role="status">
        <p>{tip}</p>
        <div className="mascot-bubble-actions">
          <Link className="btn btn-lime mascot-cta" to="/inquiry" onClick={() => setOpen(false)}>
            {text.mascot.cta}
          </Link>
          <button type="button" className="mascot-dismiss" onClick={hide}>
            {text.mascot.dismiss}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="mascot-avatar"
        aria-expanded={open}
        aria-label={text.mascot.label}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="mascot-tilt"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <span className="mascot-bob">
            <span className="mascot-stage">
              <img className="mascot-front" src={sales.mascotSrc} alt="" width={148} height={148} draggable={false} />
              <img
                className="mascot-side"
                src={sales.mascotSideSrc}
                alt=""
                width={148}
                height={148}
                draggable={false}
                style={{ opacity: tilt.side }}
              />
            </span>
          </span>
        </span>
        <span className="mascot-shadow" aria-hidden="true" />
      </button>
    </div>
  );
}

export function BrandBadge({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-badge ${className}`.trim()}
      src={sales.badgeSrc}
      alt="TAIHONG"
      width={72}
      height={72}
      loading="lazy"
    />
  );
}
