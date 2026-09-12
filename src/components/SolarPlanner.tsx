import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { SOURCES } from '../data/sources';
import { CITIES } from '../data/cities';
import { optimalTilts, rowSpacing, sunPosition, sunTimes } from '../lib/solar';
import type { SunPosition } from '../lib/solar';
import { formatQuantity } from '../lib/units';
import type { UnitSystem } from '../lib/units';
import { WorldMap } from './WorldMap';

type LocSource = 'gps' | 'city' | 'map' | 'manual';
interface Loc { lat: number; lon: number; label: string; source: LocSource }
type Status = 'idle' | 'locating' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';

const STATUS_TEXT: Partial<Record<Status, string>> = {
  denied: 'Location access is blocked. Search for a city or pick a spot on the map instead.',
  unavailable: "Your device couldn't find its location. Search for a city or pick a spot on the map instead.",
  timeout: 'Finding your location took too long. Try again, or search for a city instead.',
  unsupported: "This browser can't share its location. Search for a city or pick a spot on the map instead.",
};

const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const compassPoint = (az: number) => POINTS[Math.round(az / 45) % 8];

const cityLabel = (c: { name: string; country: string }) => `${c.name}, ${c.country}`;

function formatCoords(lat: number, lon: number) {
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} h ${m} min`;
}

/**
 * Device location uses the browser's own time zone. Picked places use an offset estimated
 * from longitude, since time zones can't be looked up offline.
 */
function clockFor(loc: Loc) {
  if (loc.source === 'gps') {
    return { format: (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: 'your local time' };
  }
  const offset = Math.round(loc.lon / 15);
  return {
    format: (d: Date) => new Date(d.getTime() + offset * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
    label: `approximate local time (UTC${offset >= 0 ? '+' : '−'}${Math.abs(offset)})`,
  };
}

interface Props { units: UnitSystem }

export function SolarPlanner({ units }: Props) {
  const [loc, setLoc] = useState<Loc | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [query, setQuery] = useState('');
  const [latText, setLatText] = useState('');
  const [lonText, setLonText] = useState('');
  const [coordError, setCoordError] = useState('');
  const [picking, setPicking] = useState(false);
  const [panelLength, setPanelLength] = useState(2); // metres
  const [now, setNow] = useState(() => new Date());

  // Keep the live sun reading current.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const choose = (next: Loc) => {
    setLoc(next);
    setLatText(next.lat.toFixed(4));
    setLonText(next.lon.toFixed(4));
    setCoordError('');
  };

  const locate = () => {
    if (!('geolocation' in navigator)) { setStatus('unsupported'); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        choose({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location', source: 'gps' });
        setStatus('idle');
      },
      err => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  const onQuery = (value: string) => {
    setQuery(value);
    const v = value.trim().toLowerCase();
    const city = CITIES.find(c => cityLabel(c).toLowerCase() === v || c.name.toLowerCase() === v);
    if (city) choose({ lat: city.lat, lon: city.lon, label: cityLabel(city), source: 'city' });
  };

  const applyCoords = (e: FormEvent) => {
    e.preventDefault();
    const lat = Number(latText.replace(',', '.'));
    const lon = Number(lonText.replace(',', '.'));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) { setCoordError('Enter a latitude between -90 and 90.'); return; }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) { setCoordError('Enter a longitude between -180 and 180.'); return; }
    choose({ lat, lon, label: 'Entered coordinates', source: 'manual' });
  };

  const plan = useMemo(() => (loc ? optimalTilts(loc.lat) : null), [loc?.lat]);
  const spacing = useMemo(() => (loc && plan ? rowSpacing(loc.lat, plan.recommended, panelLength) : null), [loc?.lat, plan, panelLength]);
  const live = loc ? sunPosition(now, loc.lat, loc.lon) : null;
  const times = loc ? sunTimes(now, loc.lat, loc.lon) : null;
  const clock = loc ? clockFor(loc) : null;

  const length = (m: number) => { const q = formatQuantity({ kind: 'length', min: m }, units); return `${q.value} ${q.unit}`; };
  const panelInput = units === 'metric' ? panelLength.toFixed(1) : (panelLength * 3.28084).toFixed(1);
  const onPanelInput = (value: string) => {
    const n = Number(value.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return;
    const metres = units === 'metric' ? n : n / 3.28084;
    setPanelLength(Math.min(6, Math.max(0.5, metres)));
  };

  const north = loc ? loc.lat >= 0 : true;
  const statusText = STATUS_TEXT[status];

  return (
    <section className="section planner" id="planner" aria-labelledby="planner-title" style={{ '--c': SOURCES.solar.color } as CSSProperties}>
      <header className="section-head">
        <p className="badge"><span className="badge-dot" aria-hidden="true" />Solar planner</p>
        <h2 id="planner-title" className="section-title">Plan panels for your spot</h2>
        <p className="section-lede">
          Share your location, search for a city, or pick a point on the map. The best angle and direction are worked out on your device from the sun’s path over a full year.
        </p>
        <p className="planner-credit">
          <span className="planner-credit-item"><span className="planner-credit-role">Idea by</span> Emad Albalaa</span>
          <span className="planner-credit-item"><span className="planner-credit-role">Designed &amp; built by</span> Ayman Khayat</span>
        </p>
      </header>

      <div className="planner-grid">
        <div className="planner-controls">
          <button type="button" className="locate-btn" onClick={locate} disabled={status === 'locating'}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></svg>
            {status === 'locating' ? 'Finding your location…' : loc?.source === 'gps' ? 'Update my location' : 'Use my location'}
          </button>
          <p className="planner-privacy">Your location stays on this device. It isn’t sent anywhere or saved.</p>
          {statusText && <p className="planner-status" role="alert">{statusText}</p>}

          <div className="planner-or" aria-hidden="true"><span>or</span></div>

          <label className="field">
            <span>Search for a city</span>
            <input list="planner-cities" value={query} onChange={e => onQuery(e.target.value)} placeholder="Start typing, e.g. Dubai" autoComplete="off" />
          </label>
          <datalist id="planner-cities">
            {CITIES.map(c => <option key={cityLabel(c)} value={cityLabel(c)} />)}
          </datalist>

          <form className="coords" onSubmit={applyCoords} noValidate>
            <label className="field">
              <span>Latitude</span>
              <input inputMode="decimal" value={latText} onChange={e => setLatText(e.target.value)} placeholder="25.20" />
            </label>
            <label className="field">
              <span>Longitude</span>
              <input inputMode="decimal" value={lonText} onChange={e => setLonText(e.target.value)} placeholder="55.27" />
            </label>
            <button type="submit" className="ghost-btn">Use these coordinates</button>
          </form>
          {coordError && <p className="planner-status" role="alert">{coordError}</p>}

          <button type="button" className="ghost-btn" aria-expanded={picking} onClick={() => setPicking(p => !p)}>
            {picking ? 'Hide the map' : 'Pick on the map'}
          </button>
          {picking && (
            <div className="planner-map">
              <WorldMap
                source={SOURCES.solar}
                mode="flat"
                onPick={([lon, lat]) => choose({ lat, lon, label: 'Picked on the map', source: 'map' })}
                pin={loc ? [loc.lon, loc.lat] : undefined}
              />
              <p className="atlas-hint">Click anywhere on the map to set the location.</p>
            </div>
          )}
        </div>

        <div className="planner-results" aria-live="polite">
          {!loc || !plan || !live || !times || !clock ? (
            <div className="planner-empty">
              <svg viewBox="0 0 120 80" aria-hidden="true">
                <circle cx="88" cy="22" r="10" className="empty-sun" />
                <path d="M18 64 70 40" className="empty-panel" />
                <path d="M10 66h100" className="empty-ground" />
              </svg>
              <p><strong>Your panel plan appears here.</strong></p>
              <p>Use your location, search for a city, or pick a spot on the map to get the best tilt, direction, and row spacing for that place.</p>
            </div>
          ) : (
            <>
              <div className="plan-where">
                <span>{loc.label}</span>
                <span className="mono">{formatCoords(loc.lat, loc.lon)}</span>
              </div>

              <div className="plan-main">
                <figure className="plan-card">
                  <TiltDiagram tilt={plan.recommended} noonElevation={90 - Math.abs(loc.lat)} towards={north ? 'south' : 'north'} />
                  <figcaption>
                    <span className="plan-label">Best fixed tilt</span>
                    <strong className="plan-big">{plan.recommended}°</strong>
                    <span className="plan-note">
                      {plan.annual < 10
                        ? `The sun is nearly overhead here, so the ideal is only ${plan.annual}°. Use at least 10° so rain can wash the panels clean.`
                        : `About ${plan.gainVsFlat}% more sunlight over a year than panels laid flat.`}
                    </span>
                  </figcaption>
                </figure>

                <figure className="plan-card">
                  <Compass panelAz={plan.azimuth} sun={live} />
                  <figcaption>
                    <span className="plan-label">Face the panels</span>
                    <strong className="plan-big">{plan.equatorial ? 'Either way' : north ? 'True south' : 'True north'}</strong>
                    <span className="plan-note">
                      {plan.equatorial
                        ? 'You’re close to the equator, so direction barely matters. Keep a gentle tilt either way.'
                        : `Azimuth ${plan.azimuth}°. A phone compass shows magnetic ${north ? 'south' : 'north'}, which can be several degrees off true ${north ? 'south' : 'north'}; a map app will show the true direction.`}
                    </span>
                  </figcaption>
                </figure>
              </div>

              <div className="plan-seasons">
                <div className="season">
                  <span className="plan-label">Year-round</span>
                  <strong>{plan.annual}°</strong>
                  <span className="plan-note">Set once and leave it</span>
                </div>
                <div className="season">
                  <span className="plan-label">Summer</span>
                  <strong>{plan.summer}°</strong>
                  <span className="plan-note">{north ? 'April to September' : 'October to March'}</span>
                </div>
                <div className="season">
                  <span className="plan-label">Winter</span>
                  <strong>{plan.winter}°</strong>
                  <span className="plan-note">{north ? 'October to March' : 'April to September'}</span>
                </div>
              </div>

              <div className="plan-panel">
                <h3>The sun here right now</h3>
                <dl className="plan-stats">
                  <div><dt>Height above horizon</dt><dd>{live.elevation > 0 ? `${live.elevation.toFixed(0)}°` : 'Below the horizon'}</dd></div>
                  <div><dt>Direction</dt><dd>{live.azimuth.toFixed(0)}° {compassPoint(live.azimuth)}</dd></div>
                  <div><dt>Daylight today</dt><dd>{times.polar === 'day' ? '24 h (midnight sun)' : times.polar === 'night' ? 'None (polar night)' : formatDuration(times.daylight)}</dd></div>
                  <div><dt>Sunrise</dt><dd>{times.sunrise ? clock.format(times.sunrise) : '—'}</dd></div>
                  <div><dt>Solar noon</dt><dd>{clock.format(times.solarNoon)}</dd></div>
                  <div><dt>Sunset</dt><dd>{times.sunset ? clock.format(times.sunset) : '—'}</dd></div>
                </dl>
                <p className="plan-note">Times shown in {clock.label}. The sun is highest at solar noon, when panels produce the most.</p>
              </div>

              <div className="plan-panel">
                <div className="plan-panel-head">
                  <h3>Row spacing</h3>
                  <label className="field field--inline">
                    <span>Panel length (slope)</span>
                    <input inputMode="decimal" value={panelInput} onChange={e => onPanelInput(e.target.value)} aria-describedby="panel-unit" />
                    <span id="panel-unit" className="field-unit">{units === 'metric' ? 'm' : 'ft'}</span>
                  </label>
                </div>
                {spacing && !spacing.polarNight ? (
                  <>
                    <dl className="plan-stats">
                      <div><dt>Row to row (front edges)</dt><dd>{length(spacing.pitch)}</dd></div>
                      <div><dt>Clear gap between rows</dt><dd>{length(spacing.gap)}</dd></div>
                      <div><dt>Ground covered by panels</dt><dd>{Math.round(spacing.coverage * 100)}%</dd></div>
                    </dl>
                    <p className="plan-note">
                      Keeps each row out of the next row’s shadow {spacing.window === 'around noon' ? 'around midday' : `from ${spacing.window}`} on the shortest day of the year, with panels at {plan.recommended}°.
                      {spacing.lowSun
                        ? ' The midwinter sun barely clears the horizon here, so some winter shading is hard to avoid at any spacing. Most installers accept it and place rows closer together.'
                        : spacing.window === 'around noon'
                          ? ' The winter sun is very low here, so this only protects the middle of the day. Many installers accept some winter shading to fit more rows.'
                          : ''}
                    </p>
                  </>
                ) : (
                  <p className="plan-note">The sun doesn’t rise on the shortest day here, so rows can’t be spaced to avoid midwinter shading.</p>
                )}
              </div>

              <p className="plan-caveat">
                These figures assume clear skies and open ground. Local weather, shade from buildings or trees, and your installer’s advice should come first.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Side view: the panel pivots at its low edge, with the midday equinox sun shining onto it. */
function TiltDiagram({ tilt, noonElevation, towards }: { tilt: number; noonElevation: number; towards: 'south' | 'north' }) {
  const hx = 88, hy = 132, len = 130;
  const t = (tilt * Math.PI) / 180;
  const tip = [hx + len * Math.cos(t), hy - len * Math.sin(t)];
  const arcR = 42;
  const arcEnd = [hx + arcR * Math.cos(t), hy - arcR * Math.sin(t)];
  const mid = [hx + len * 0.5 * Math.cos(t), hy - len * 0.5 * Math.sin(t)];
  const e = (Math.max(5, Math.min(88, noonElevation)) * Math.PI) / 180;
  const sun = [mid[0] - 118 * Math.cos(e), mid[1] - 118 * Math.sin(e)];
  const sunX = Math.max(16, sun[0]), sunY = Math.max(16, sun[1]);

  return (
    <svg className="tilt" viewBox="0 0 280 160" role="img" aria-label={`Panel tilted ${tilt} degrees, facing ${towards}`}>
      <line className="tilt-ray" x1={sunX} y1={sunY} x2={mid[0]} y2={mid[1]} />
      <circle className="tilt-sun" cx={sunX} cy={sunY} r="10" />
      <path className="tilt-ground" d="M14 132H266" />
      <line className="tilt-leg" x1={tip[0]} y1={tip[1]} x2={tip[0]} y2={hy} />
      <path className="tilt-arc" d={`M${hx + arcR} ${hy} A${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} />
      <line className="tilt-panel" x1={hx} y1={hy} x2={tip[0]} y2={tip[1]} />
      <text className="tilt-label" x={hx + arcR + 8} y={hy - 8}>{tilt}°</text>
      <text className="tilt-dir" x="16" y="152">← {towards === 'south' ? 'South' : 'North'} (towards the equator)</text>
    </svg>
  );
}

/** Top-down compass: the panel's facing direction, plus where the sun is right now. */
function Compass({ panelAz, sun }: { panelAz: number; sun: SunPosition }) {
  const c = 100, r = 74;
  const above = sun.elevation > 0;
  return (
    <svg className="compass" viewBox="0 0 200 200" role="img" aria-label={`Panels face ${panelAz} degrees; the sun is at ${Math.round(sun.azimuth)} degrees, ${above ? 'above' : 'below'} the horizon`}>
      <circle className="compass-ring" cx={c} cy={c} r={r} />
      <circle className="compass-ring compass-ring--inner" cx={c} cy={c} r={r - 22} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const inner = i % 6 === 0 ? r - 10 : r - 5;
        return <line key={i} className="compass-tick" x1={c + inner * Math.sin(a)} y1={c - inner * Math.cos(a)} x2={c + r * Math.sin(a)} y2={c - r * Math.cos(a)} />;
      })}
      {(['N', 'E', 'S', 'W'] as const).map((l, i) => {
        const a = (i * 90 * Math.PI) / 180;
        return <text key={l} className="compass-letter" x={c + (r + 14) * Math.sin(a)} y={c - (r + 14) * Math.cos(a) + 4}>{l}</text>;
      })}
      <g className="compass-needle" style={{ transform: `rotate(${panelAz}deg)` }}>
        <line x1={c} y1={c} x2={c} y2={c - r + 16} />
        <path d={`M${c - 7} ${c - r + 26} L${c} ${c - r + 12} L${c + 7} ${c - r + 26} Z`} />
      </g>
      <circle className="compass-hub" cx={c} cy={c} r="5" />
      <g className="compass-sunmark" style={{ transform: `rotate(${sun.azimuth}deg)` }}>
        <circle className={above ? 'compass-sun' : 'compass-sun compass-sun--down'} cx={c} cy={c - r} r="8" />
      </g>
    </svg>
  );
}
