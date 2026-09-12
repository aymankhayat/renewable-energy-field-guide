import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
  geoCentroid, geoDistance, geoGraticule10, geoInterpolate, geoNaturalEarth1, geoOrthographic, geoPath,
} from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import world from 'world-atlas/countries-110m.json';
import type { EnergySource, RegionKey } from '../data/types';
import { REGION_LABEL, regionOf } from '../data/regions';

export type MapMode = 'globe' | 'flat';

type CountryFeature = Feature<Geometry, { name: string }>;
interface Country { id: number; name: string; feature: CountryFeature; region: RegionKey }

const topo = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const collection = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;

const COUNTRIES: Country[] = collection.features
  .filter(f => Number(f.id) !== 10) // Antarctica: no suitability data, and it dominates the flat map
  .map(f => {
    const id = f.id === undefined ? -1 : Number(f.id);
    return { id, name: f.properties.name, feature: f, region: regionOf(id, geoCentroid(f) as [number, number]) };
  });

const LAND: FeatureCollection = { type: 'FeatureCollection', features: COUNTRIES.map(c => c.feature) };
const SPHERE: GeoPermissibleObjects = { type: 'Sphere' };
const GRATICULE = geoGraticule10();

/** Where the globe turns to face when a region is selected: [lon, lat]. */
const REGION_CENTER: Record<RegionKey, [number, number]> = {
  mena: [45, 24], europe: [15, 50], namerica: [-100, 45], latam: [-62, -15],
  ssafrica: [22, -4], sasia: [75, 30], easia: [115, 22], oceania: [145, -25],
};

const TIER_LABEL = { 3: 'Excellent', 2: 'Good', 1: 'Moderate' } as const;
const TIER_OPACITY = { 3: 0.88, 2: 0.52, 1: 0.26 } as const;

const W = 960;
const H = 500;

interface Tip { x: number; y: number; title: string; body: string }

interface Props {
  source: EnergySource;
  mode: MapMode;
  /** Region to outline; omit to outline nothing. */
  region?: RegionKey;
  onRegionSelect?: (r: RegionKey) => void;
  /** When set, a click anywhere on the map picks a point instead of a region. */
  onPick?: (coords: [number, number]) => void;
  /** A picked point to mark, as [lon, lat]. */
  pin?: [number, number];
}

export function WorldMap({ source, region, mode, onRegionSelect, onPick, pin }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState<[number, number]>(REGION_CENTER[region ?? 'mena']);
  const centerRef = useRef(center);
  centerRef.current = center;
  const drag = useRef<{ x: number; y: number; c: [number, number] } | null>(null);
  /** True once a pointer-down has moved far enough to count as a drag, not a click. */
  const dragged = useRef(false);
  const hovering = useRef(false);
  const tweening = useRef(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // On phones, crop the globe's viewBox to a square so the globe fills the width.
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const vb = mode === 'globe' && narrow ? { x: (W - H) / 2, w: H } : { x: 0, w: W };

  const projection = useMemo(() => {
    if (mode === 'globe') {
      return geoOrthographic().scale(H / 2 - 18).translate([W / 2, H / 2]).clipAngle(90).rotate([-center[0], -center[1]]);
    }
    return geoNaturalEarth1().fitExtent([[12, 12], [W - 12, H - 12]], LAND);
  }, [mode, center]);

  const path = useMemo(() => geoPath(projection), [projection]);

  // Turn the globe to face the selected region.
  useEffect(() => {
    if (mode !== 'globe' || !region) return;
    const target = REGION_CENTER[region];
    if (reduced) { setCenter(target); return; }
    const interp = geoInterpolate(centerRef.current, target);
    const start = performance.now();
    const dur = 1000;
    let raf = 0;
    tweening.current = true;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setCenter(interp(e) as [number, number]);
      if (k < 1) raf = requestAnimationFrame(step);
      else tweening.current = false;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); tweening.current = false; };
  }, [region, mode, reduced]);

  // Slow idle spin while nobody is interacting with the globe.
  useEffect(() => {
    if (mode !== 'globe' || reduced) return;
    let raf = 0;
    let last = performance.now();
    const spin = (now: number) => {
      const dt = now - last;
      last = now;
      if (!drag.current && !hovering.current && !tweening.current && !document.hidden) {
        const [lon, lat] = centerRef.current;
        setCenter([lon + dt * 0.004, lat]);
      }
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, [mode, reduced]);

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (mode !== 'globe') return;
    drag.current = { x: e.clientX, y: e.clientY, c: centerRef.current };
    dragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) dragged.current = true;
    const svgScale = vb.w / e.currentTarget.getBoundingClientRect().width;
    const k = (0.25 * svgScale * 250) / (H / 2 - 18);
    const lat = Math.max(-70, Math.min(70, d.c[1] + (e.clientY - d.y) * k));
    setCenter([d.c[0] - (e.clientX - d.x) * k, lat]);
    setTip(null);
  };
  const endDrag = () => { drag.current = null; };

  // Turn a click into [lon, lat] when the map is being used as a picker.
  const onSvgClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    if (!onPick || dragged.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = vb.x + ((e.clientX - r.left) / r.width) * vb.w;
    const y = ((e.clientY - r.top) / r.height) * H;
    const coords = projection.invert?.([x, y]);
    if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) onPick([coords[0], coords[1]]);
  };

  const visible = (coords: [number, number]) =>
    mode === 'flat' || geoDistance(coords, centerRef.current) < Math.PI / 2 - 0.04;

  return (
    <div
      className={`map map--${mode}`}
      ref={wrapRef}
      onPointerEnter={() => { hovering.current = true; }}
      onPointerLeave={() => { hovering.current = false; setTip(null); }}
    >
      <svg
        viewBox={`${vb.x} 0 ${vb.w} ${H}`}
        role="img"
        aria-label={`${mode === 'globe' ? 'Globe' : 'World map'} showing where ${source.label.toLowerCase()} works best`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onSvgClick}
        className={onPick ? 'is-picker' : undefined}
      >
        <defs>
          <radialGradient id="ocean" cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#15324A" />
            <stop offset="100%" stopColor="#081522" />
          </radialGradient>
          <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor={source.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={source.color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {mode === 'globe' && <circle cx={W / 2} cy={H / 2} r={H / 2 - 18 + 26} fill="url(#atmo)" />}
        <path d={path(SPHERE) ?? undefined} className="map-sphere" fill={mode === 'globe' ? 'url(#ocean)' : undefined} />
        <path d={path(GRATICULE) ?? undefined} className="map-graticule" />

        <g>
          {COUNTRIES.map((c, i) => {
            const d = path(c.feature);
            if (!d) return null;
            const tier = source.countries[c.id];
            return (
              <path
                key={`${c.id}-${i}`}
                d={d}
                className={`country${region && c.region === region ? ' in-region' : ''}`}
                style={tier ? { fill: source.color, fillOpacity: TIER_OPACITY[tier] } : undefined}
                onPointerMove={e => {
                  if (drag.current) return;
                  const p = localPoint(e);
                  setTip({ ...p, title: c.name, body: `${tier ? TIER_LABEL[tier] : 'Limited'} for ${source.label.toLowerCase()} · ${REGION_LABEL[c.region]}` });
                }}
                onClick={() => { if (!dragged.current && !onPick) onRegionSelect?.(c.region); }}
              />
            );
          })}
        </g>

        <g>
          {source.hotspots.map(h => {
            if (!visible(h.coords)) return null;
            const pt = projection(h.coords);
            if (!pt) return null;
            const show = () => {
              const svg = wrapRef.current!.querySelector('svg')!.getBoundingClientRect();
              const s = svg.width / vb.w;
              setTip({ x: (pt[0] - vb.x) * s, y: pt[1] * s, title: h.name, body: h.detail });
            };
            return (
              <g
                key={h.name}
                className="hotspot"
                transform={`translate(${pt[0]},${pt[1]})`}
                tabIndex={0}
                role="button"
                aria-label={`${h.name}: ${h.detail}`}
                onPointerEnter={show}
                onFocus={show}
                onBlur={() => setTip(null)}
              >
                <circle className="hotspot-ring" r="10" />
                <circle className="hotspot-dot" r="4" />
              </g>
            );
          })}
        </g>

        {pin && visible(pin) && (() => {
          const pt = projection(pin);
          return pt ? (
            <g className="pick-pin" transform={`translate(${pt[0]},${pt[1]})`} aria-hidden="true">
              <circle className="pick-pin-ring" r="14" />
              <circle className="pick-pin-dot" r="6" />
            </g>
          ) : null;
        })()}
      </svg>

      {tip && (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }} role="status">
          <strong>{tip.title}</strong>
          <span>{tip.body}</span>
        </div>
      )}
    </div>
  );
}

export { TIER_LABEL, TIER_OPACITY };
