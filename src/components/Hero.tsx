import { useEffect, useMemo } from 'react';
import type { PointerEvent } from 'react';
import type { EnergySource, RegionKey, SourceKey } from '../data/types';
import { ORDER } from '../data/sources';
import { PRESENTATION } from '../data/presentation';
import { REGION_LABEL } from '../data/regions';
import { formatQuantity } from '../lib/units';
import type { UnitSystem } from '../lib/units';
import { Backdrop } from './Backdrop';
import { SourceIcon } from './Icons';
import { FitDots, SourceNav } from './Controls';

interface Props {
  source: EnergySource;
  units: UnitSystem;
  region: RegionKey;
  onSelect: (k: SourceKey) => void;
}

/** A deterministic "year of output" trace that stays inside the source's capacity-factor range. */
function sparkline(key: SourceKey, min: number, max: number) {
  const seed = [...key].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  // Frame the chart around this source's own range so every trace fills the card.
  const lo = Math.max(0, min - 10);
  const hi = Math.min(100, max + 10);
  const pts = Array.from({ length: 24 }, (_, i) => {
    const wobble = Math.sin(i * 0.8 + seed) * 0.6 + Math.sin(i * 0.33 + seed * 1.7) * 0.4;
    const v = (min + max) / 2 + wobble * ((max - min) / 2);
    return [(i / 23) * 200, 54 - ((v - lo) / (hi - lo)) * 46] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return { line, area: `${line} L200 60 L0 60 Z` };
}

export function Hero({ source, units, region, onSelect }: Props) {
  const p = PRESENTATION[source.key];
  const cf = source.capacityFactor;
  const fit = source.fit[region];
  const spark = useMemo(() => sparkline(source.key, cf.min, cf.max), [source.key, cf.min, cf.max]);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // Warm the cache so switching sources never waits on a photo.
  useEffect(() => {
    const id = window.setTimeout(() => {
      ORDER.forEach(k => { new Image().src = PRESENTATION[k].hero.src; });
    }, 1500);
    return () => window.clearTimeout(id);
  }, []);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  return (
    <section className="hero" id="sources" onPointerMove={onMove} aria-labelledby="hero-title">
      <div className="hero-media" key={source.key}>
        <img className="hero-photo" src={p.hero.src} alt={p.hero.alt} style={{ objectPosition: p.hero.focus }} />
        <Backdrop source={source.key} color={source.color} />
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-copy" key={source.key}>
          <p className="badge"><span className="badge-dot" aria-hidden="true" />{source.kind}</p>
          <h1 id="hero-title" className="hero-title">
            <span className="visually-hidden">{source.label}: </span>
            <span className="hl">{p.headline[0]}</span>
            <span className="hl hl--pill">
              <span className="title-pill" aria-hidden="true">
                <span className="title-pill-knob"><SourceIcon source={source.key} /></span>
              </span>
              {p.headline[1]}
            </span>
            <span className="hl">{p.headline[2]}</span>
          </h1>
          <p className="hero-summary">{source.summary}</p>
          <a className="hero-stat" href="#atlas">
            <span><strong>{source.hotspots.length}</strong> landmark sites</span>
            <span className="hero-stat-faces" aria-hidden="true">
              {[15, 50, 85].map(x => (
                <span key={x} style={{ backgroundImage: `url(${p.detail.src})`, backgroundPosition: `${x}% 50%` }} />
              ))}
            </span>
          </a>
        </div>

        <div className="hero-rig" key={`rig-${source.key}`}>
          <svg className="orbit" viewBox="0 0 400 400" aria-hidden="true">
            <circle className="orbit-ring" cx="200" cy="200" r="180" />
            <circle className="orbit-ring orbit-ring--dash" cx="200" cy="200" r="148" />
            {[-90, 160, 25, 100].map(a => (
              <circle
                key={a}
                className="orbit-node"
                cx={200 + 180 * Math.cos((a * Math.PI) / 180)}
                cy={200 + 180 * Math.sin((a * Math.PI) / 180)}
                r="6"
              />
            ))}
            {!reduced && (
              <circle className="orbit-sat" r="4">
                <animateMotion dur="16s" repeatCount="indefinite" path="M200,20 a180,180 0 1,1 -0.1,0" />
              </circle>
            )}
          </svg>

          {source.metrics.slice(0, 2).map((m, i) => {
            const q = formatQuantity(m.quantity, units);
            return (
              <div className={`rig-label rig-label--${i}`} key={m.label}>
                <span className="rig-label-name">{m.label}</span>
                <strong>{q.value}<em>{q.unit}</em></strong>
              </div>
            );
          })}

          <a className="rig-cta" href="#atlas">
            <span className="rig-cta-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </span>
            <span>Explore<br />the atlas</span>
          </a>
        </div>
      </div>

      <div className="dock">
        <SourceNav active={source.key} dimmed={false} onSelect={onSelect} />
      </div>

      <div className="hero-cards">
        <article className="hcard hcard--chart">
          <div className="hcard-head">
            <h2>Share of the year at full output</h2>
            <span className="hcard-pill">{cf.min}–{cf.max}%</span>
          </div>
          <svg className="spark" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={source.color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={source.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={spark.area} fill="url(#spark-fill)" />
            <path d={spark.line} className="spark-line" />
          </svg>
          <p className="hcard-note">Capacity factor: {cf.text}</p>
        </article>

        <a className="hcard hcard--fit" href="#fit">
          <span className="hcard-label">Fit for {REGION_LABEL[region]}</span>
          <strong className="hcard-big">{fit.score}<small>/5</small></strong>
          <FitDots score={fit.score} />
          <svg className="planet" viewBox="0 0 320 120" aria-hidden="true">
            <defs>
              <radialGradient id="planet-fill" cx="50%" cy="20%" r="75%">
                <stop offset="0%" stopColor={source.color} stopOpacity="0.9" />
                <stop offset="55%" stopColor="#0E2233" />
                <stop offset="100%" stopColor="#05090D" />
              </radialGradient>
            </defs>
            <circle cx="160" cy="330" r="300" fill="url(#planet-fill)" />
            <circle cx="160" cy="330" r="300" className="planet-rim" />
            <ellipse cx="160" cy="330" rx="120" ry="300" className="planet-grid" />
            <ellipse cx="160" cy="330" rx="230" ry="300" className="planet-grid" />
            <path d="M-20 70 Q160 20 340 70" className="planet-grid" />
          </svg>
        </a>

        <figure className="hcard hcard--photo">
          <img src={p.detail.src} alt={p.detail.alt} loading="lazy" style={{ objectPosition: p.detail.focus }} />
          <figcaption>{p.detail.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
