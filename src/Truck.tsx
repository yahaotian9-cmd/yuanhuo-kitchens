import { tonePaint } from "./data";
import type { Heat, Platform, Tone } from "./types";

type Props = {
  platform: Platform;
  tone: Tone;
  windows: 0 | 1 | 2;
  heat: Heat;
};

function Wheel({ x, y, r = 30 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#16140f" />
      <circle cx={x} cy={y} r={r * 0.52} fill="#c56a32" />
      <circle cx={x} cy={y} r={r * 0.14} fill="#16140f" />
    </g>
  );
}

function Bottles({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="0" y="18" width="48" height="40" fill="none" stroke="#efe7d6" strokeWidth="2" />
      <rect x="6" y="4" width="14" height="32" rx="5" fill="#d9d3c6" stroke="#1b1914" />
      <rect x="26" y="4" width="14" height="32" rx="5" fill="#d9d3c6" stroke="#1b1914" />
    </g>
  );
}

function Glass({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#10241c" />
      <rect x={x + 8} y={y + h - 22} width={w - 16} height="7" fill="#c56a32" />
      <rect x={x + 6} y={y + 8} width={w * 0.35} height={h * 0.28} fill="#ffffff" opacity="0.14" />
    </g>
  );
}

function Windows({ x, y, w, h, count }: { x: number; y: number; w: number; h: number; count: 0 | 1 | 2 }) {
  if (count === 0) {
    return <rect x={x} y={y} width={w * 0.45} height={h} rx="2" fill="#000" opacity="0.18" />;
  }
  if (count === 1) return <Glass x={x} y={y} w={w} h={h} />;
  const gap = 16;
  const each = (w - gap) / 2;
  return (
    <g>
      <Glass x={x} y={y} w={each} h={h} />
      <Glass x={x + each + gap} y={y} w={each} h={h} />
    </g>
  );
}

export function Truck({ platform, tone, windows, heat }: Props) {
  const paint = tonePaint[tone];
  const stripe = "#ddf06a";
  const showGas = heat !== "electric";

  return (
    <svg viewBox="0 0 820 360" role="presentation" aria-hidden="true">
      <ellipse cx="430" cy="318" rx="280" ry="12" fill="#000" opacity="0.28" />
      {platform === "trailer" && (
        <g>
          <path d="M36 214 H176" stroke="#efe7d6" strokeWidth="8" strokeLinecap="round" />
          <circle cx="30" cy="214" r="10" fill="none" stroke="#efe7d6" strokeWidth="4" />
          <path d="M96 214 v28" stroke="#efe7d6" strokeWidth="4" />
          <circle cx="96" cy="250" r="8" fill="#efe7d6" />
          {showGas && <Bottles x={48} y={156} />}
          <rect x="176" y="88" width="590" height="180" rx="6" fill={paint.body} stroke="#1b1914" strokeWidth="3" />
          <rect x="176" y="206" width="590" height="14" fill={stripe} />
          <rect x="188" y="248" width="566" height="8" fill={paint.trim} />
          <Windows x={248} y={112} w={windows === 2 ? 320 : 220} h={82} count={windows} />
          <path d="M236 104 H500 l14 18 H224 Z" fill={stripe} />
          <path d="M260 122 v-18 M470 122 v-14" stroke="#1b1914" strokeWidth="3" />
          <rect x="692" y="124" width="58" height="132" rx="2" fill={paint.trim} stroke="#1b1914" strokeWidth="2" />
          <circle cx="738" cy="190" r="3" fill={stripe} />
          <rect x="560" y="64" width="54" height="30" rx="3" fill="#d9d3c6" stroke="#1b1914" />
          <Wheel x={330} y={292} />
          <Wheel x={690} y={292} />
        </g>
      )}
      {platform === "truck" && (
        <g>
          <path d="M38 268 L38 196 Q42 156 92 150 L168 142 H214 V268 Z" fill="#1b1914" />
          <path d="M78 164 L150 156 L150 198 L70 204 Z" fill="#c5d4cc" />
          <path d="M168 168 H206" stroke="#efe7d6" strokeWidth="3" />
          <rect x="206" y="100" width="560" height="168" rx="4" fill={paint.body} stroke="#1b1914" strokeWidth="3" />
          <rect x="206" y="204" width="560" height="14" fill={stripe} />
          <rect x="214" y="250" width="544" height="10" fill="#1b1914" />
          <Windows x={268} y={122} w={windows === 2 ? 280 : 210} h={72} count={windows} />
          <path d="M256 114 H500 l12 16 H246 Z" fill={stripe} />
          <rect x="690" y="136" width="58" height="120" fill={paint.trim} stroke="#1b1914" />
          <rect x="620" y="82" width="48" height="28" rx="3" fill="#d9d3c6" stroke="#1b1914" />
          {showGas && <Bottles x={600} y={214} scale={0.7} />}
          <Wheel x={120} y={286} r={28} />
          <Wheel x={620} y={292} r={30} />
          <Wheel x={676} y={292} r={30} />
        </g>
      )}
      {platform === "cart" && (
        <g>
          <path d="M150 150 h46 v70" fill="none" stroke="#efe7d6" strokeWidth="8" strokeLinecap="round" />
          <rect x="196" y="112" width="430" height="156" rx="8" fill={paint.body} stroke="#1b1914" strokeWidth="3" />
          <rect x="196" y="206" width="430" height="14" fill={stripe} />
          <Windows x={248} y={132} w={200} h={64} count={windows === 0 ? 0 : 1} />
          <path d="M236 124 H470 l12 16 H226 Z" fill={stripe} />
          <rect x="548" y="146" width="58" height="108" rx="2" fill={paint.trim} stroke="#1b1914" />
          {showGas && <Bottles x={500} y={196} scale={0.62} />}
          <Wheel x={300} y={286} r={26} />
          <Wheel x={540} y={286} r={26} />
        </g>
      )}
    </svg>
  );
}
