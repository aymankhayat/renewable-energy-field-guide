import { useEffect, useRef } from 'react';
import type { SourceKey } from '../data/types';

type RGB = [number, number, number];
type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a})`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Fades what's already drawn, leaving motion trails on a transparent canvas. */
function fade(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = `rgba(0,0,0,${amount})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Where a centrepiece (sun, moon) sits in the hero: inside the orbit rig, which is
 * on the right on wide screens and below the headline on narrow ones.
 */
function focal(W: number, H: number) {
  return W > 1100 ? { x: W * 0.72, y: H * 0.42 } : { x: W * 0.5, y: H * 0.62 };
}

/* Each factory sets up its own particles and returns a per-frame draw function. */
const EFFECTS: Record<SourceKey, (c: RGB, w: number, h: number) => Draw> = {
  // A slowly turning corona with pulses of light moving outward.
  solar: (c, w, h) => {
    const photons = Array.from({ length: 70 }, () => ({ a: rand(0, Math.PI * 2), d: rand(0, 1), v: rand(0.0015, 0.004) }));
    return (ctx, W, H, t) => {
      ctx.clearRect(0, 0, W, H);
      const { x: cx, y: cy } = focal(W, H);
      const r = Math.min(W, H) * 0.17;
      const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 3.2);
      glow.addColorStop(0, rgba(c, 0.55));
      glow.addColorStop(0.3, rgba(c, 0.14));
      glow.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba(c, 0.9);
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rgba(c, 0.35);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2 + t * 0.00006;
        const len = r * (1.35 + 0.35 * Math.sin(t * 0.0012 + i * 1.7));
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85);
        ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx.stroke();
      }
      for (let k = 0; k < 3; k++) {
        const p = ((t * 0.00022 + k / 3) % 1);
        ctx.strokeStyle = rgba(c, 0.28 * (1 - p));
        ctx.beginPath(); ctx.arc(cx, cy, r * (0.7 + p * 3), 0, Math.PI * 2); ctx.stroke();
      }
      for (const ph of photons) {
        ph.d += ph.v;
        if (ph.d > 1) { ph.d = 0; ph.a = rand(0, Math.PI * 2); }
        const dist = r * 0.8 + ph.d * Math.max(W, H) * 0.6;
        ctx.fillStyle = rgba(c, 0.7 * (1 - ph.d));
        ctx.fillRect(cx + Math.cos(ph.a) * dist, cy + Math.sin(ph.a) * dist, 2, 2);
      }
      void w; void h;
    };
  },

  // Particles following a shifting flow field, leaving streamlines.
  wind: (c, w, h) => {
    const ps = Array.from({ length: 340 }, () => ({ x: rand(0, w), y: rand(0, h), life: rand(40, 220) }));
    return (ctx, W, H, t) => {
      fade(ctx, W, H, 0.035);
      ctx.strokeStyle = rgba(c, 0.85);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const p of ps) {
        const ang = Math.sin(p.x * 0.0035 + t * 0.0003) * 0.5 + Math.cos(p.y * 0.007 - t * 0.0002) * 0.35;
        const nx = p.x + Math.cos(ang) * 2.4, ny = p.y + Math.sin(ang) * 1.6;
        ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
        p.x = nx; p.y = ny; p.life--;
        if (p.x > W || p.y < 0 || p.y > H || p.life < 0) { p.x = rand(-40, W * 0.3); p.y = rand(0, H); p.life = rand(80, 260); }
      }
      ctx.stroke();
    };
  },

  // Falling streaks over layered, flowing water.
  hydro: (c, w, h) => {
    const drops = Array.from({ length: 90 }, () => ({ x: rand(w * 0.55, w), y: rand(0, h), v: rand(3, 7), l: rand(10, 30) }));
    return (ctx, W, H, t) => {
      fade(ctx, W, H, 0.25);
      ctx.strokeStyle = rgba(c, 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + d.l);
        d.y += d.v;
        if (d.y > H * 0.72) { d.y = rand(-40, 0); d.x = rand(W * 0.55, W); }
      }
      ctx.stroke();
      for (let k = 0; k < 4; k++) {
        const base = H * (0.74 + k * 0.07);
        ctx.strokeStyle = rgba(c, 0.5 - k * 0.09);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y = base + Math.sin(x * 0.012 + t * 0.002 * (1 + k * 0.3) + k) * (6 + k * 2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };
  },

  // Embers rising from a pulsing seam of heat.
  geothermal: (c, w, h) => {
    const embers = Array.from({ length: 120 }, () => ({ x: rand(0, w), y: rand(0, h), v: rand(0.4, 1.4), s: rand(1, 2.6), ph: rand(0, 6) }));
    return (ctx, W, H, t) => {
      ctx.clearRect(0, 0, W, H);
      const pulse = 0.35 + 0.1 * Math.sin(t * 0.0015);
      const g = ctx.createLinearGradient(0, H, 0, H * 0.35);
      g.addColorStop(0, rgba(c, pulse));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rgba(c, 0.25);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const y = H - 18 - Math.abs(Math.sin(x * 0.02 + t * 0.0008)) * 14;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (const e of embers) {
        e.y -= e.v; e.x += Math.sin(t * 0.002 + e.ph) * 0.4;
        if (e.y < 0) { e.y = H + rand(0, 40); e.x = rand(0, W); }
        const lift = 1 - e.y / H;
        const flicker = 0.6 + 0.4 * Math.sin(t * 0.01 + e.ph * 3);
        ctx.fillStyle = lift < 0.4 ? `rgba(255,${Math.round(200 - lift * 200)},90,${0.9 * flicker})` : rgba(c, (1 - lift) * flicker);
        ctx.beginPath(); ctx.arc(e.x, e.y, e.s * (1 - lift * 0.5), 0, Math.PI * 2); ctx.fill();
      }
    };
  },

  // Drifting cells joined by a mycelium-like web.
  biomass: (c, w, h) => {
    const nodes = Array.from({ length: 55 }, () => ({ x: rand(0, w), y: rand(0, h), vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25), r: rand(1.5, 4), ph: rand(0, 6) }));
    return (ctx, W, H, t) => {
      ctx.clearRect(0, 0, W, H);
      const reach = Math.min(W, H) * 0.28;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < reach) {
            ctx.strokeStyle = rgba(c, 0.3 * (1 - d / reach));
            ctx.beginPath(); ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo((a.x + b.x) / 2 + 12, (a.y + b.y) / 2 - 12, b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const s = n.r * (1 + 0.35 * Math.sin(t * 0.002 + n.ph));
        ctx.fillStyle = rgba(c, 0.2);
        ctx.beginPath(); ctx.arc(n.x, n.y, s * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(c, 0.85);
        ctx.beginPath(); ctx.arc(n.x, n.y, s, 0, Math.PI * 2); ctx.fill();
      }
    };
  },

  // Electrolysis: bubbles and H₂ pairs rising off an electrode plate along the floor.
  hydrogen: (c, w, h) => {
    const bubbles = Array.from({ length: 110 }, () => ({ bx: rand(0, w), y: rand(0, h), r: rand(2, 7), v: rand(0.5, 1.6), ph: rand(0, 6), pair: Math.random() < 0.35 }));
    return (ctx, W, H, t) => {
      ctx.clearRect(0, 0, W, H);
      const plate = ctx.createLinearGradient(0, H, 0, H - 40);
      plate.addColorStop(0, rgba(c, 0.35));
      plate.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = plate;
      ctx.fillRect(0, H - 40, W, 40);
      for (const b of bubbles) {
        b.y -= b.v;
        if (b.y < -20) { b.y = H + rand(0, 30); b.bx = rand(0, W); }
        const x = b.bx + Math.sin(t * 0.002 + b.ph) * 10;
        const alpha = Math.min(1, b.y / (H * 0.25));
        ctx.strokeStyle = rgba(c, 0.7 * alpha);
        ctx.lineWidth = 1.2;
        if (b.pair) {
          ctx.beginPath(); ctx.arc(x - b.r * 0.8, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + b.r * 0.8, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = rgba(c, 0.5 * alpha);
          ctx.beginPath(); ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
        }
      }
      void w;
    };
  },

  // Moon over a slow swell; the whole sea rises and falls with the tide.
  tidal: (c, w, h) => {
    const glints = Array.from({ length: 40 }, () => ({ x: rand(0, w), k: Math.floor(rand(0, 6)), ph: rand(0, 6) }));
    return (ctx, W, H, t) => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = focal(W, H);
      const mr = Math.min(W, H) * 0.08;
      const halo = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 5);
      halo.addColorStop(0, rgba(c, 0.3)); halo.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(226,236,255,0.85)';
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      const tide = Math.sin(t * 0.00035) * H * 0.05;
      const waveY = (k: number, x: number) =>
        H * (0.52 + k * 0.08) + tide + Math.sin(x * (0.008 - k * 0.0006) - t * 0.0012 * (1 + k * 0.15) + k * 1.3) * (8 + k * 3);
      for (let k = 0; k < 6; k++) {
        ctx.strokeStyle = rgba(c, 0.6 - k * 0.07);
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y = waveY(k, x);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (const g of glints) {
        const a = Math.max(0, Math.sin(t * 0.003 + g.ph));
        ctx.fillStyle = `rgba(226,236,255,${a * 0.8})`;
        ctx.fillRect(g.x, waveY(g.k, g.x) - 1, 3, 1.5);
      }
      void h;
    };
  },
};

interface Props {
  source: SourceKey;
  color: string;
}

/** Full-bleed animated canvas showing each source's physical process. */
export function Backdrop({ source, color }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, draw: Draw | null = null, raf = 0, visible = true;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = EFFECTS[source](hexToRgb(color), w, h);
      if (reduced) {
        // Settle into a representative still frame.
        for (let i = 0; i < 90; i++) draw(ctx, w, h, 4000 + i * 16);
      }
    };

    const loop = (t: number) => {
      if (visible && draw) draw(ctx, w, h, t);
      raf = requestAnimationFrame(loop);
    };

    setup();
    const ro = new ResizeObserver(() => setup());
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [source, color]);

  return <canvas ref={ref} className="backdrop" aria-hidden="true" />;
}
