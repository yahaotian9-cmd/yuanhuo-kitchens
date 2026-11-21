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
  /** front | look-left (native side art) | look-right (mirrored side) */
  const [pose, setPose] = useState<"front" | "left" | "right">("front");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

    let frame = 0;
    function onMove(event: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = rootRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.45;
        const dx = (event.clientX - cx) / Math.max(window.innerWidth, 1);
        const dy = (event.clientY - cy) / Math.max(window.innerHeight, 1);
        const offset = event.clientX - cx;

        // Discrete pose swap — no opacity blend (that caused the white ghost bug).
        let next: "front" | "left" | "right" = "front";
        if (offset < -72) next = "left";
        else if (offset > 72) next = "right";

        setPose(next);
        setTilt({
          x: Math.max(-6, Math.min(6, dy * -8)),
          y: Math.max(-8, Math.min(8, dx * 10)),
        });
      });
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
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

  const showSide = pose !== "front";

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
        <span className="mascot-tilt" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
          <span className="mascot-bob">
            <span className={`mascot-stage${showSide ? " is-side" : ""}`}>
              <img
                className={`mascot-front${showSide ? " is-hidden" : ""}`}
                src={sales.mascotSrc}
                alt=""
                width={148}
                height={148}
                draggable={false}
              />
              <img
                className={`mascot-side${showSide ? " is-shown" : ""}${pose === "right" ? " is-flip" : ""}`}
                src={sales.mascotSideSrc}
                alt=""
                width={148}
                height={148}
                draggable={false}
              />
            </span>
          </span>
        </span>
        <span className="mascot-shadow" aria-hidden="true" />
      </button>
    </div>
  );
}
