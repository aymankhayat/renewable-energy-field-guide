/**
 * Sun geometry and a simple clear-sky model, all computed on the device.
 * Sun position follows NOAA's general solar position equations; clear-sky
 * irradiance uses the Kasten–Young air mass with Meinel's direct-beam model.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface SunPosition {
  /** Degrees above the horizon (negative when below). */
  elevation: number;
  /** Degrees clockwise from true north. */
  azimuth: number;
}

interface DayParams {
  /** Solar declination, radians. */
  decl: number;
  /** Equation of time, minutes. */
  eqtime: number;
}

function isLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function dayParams(year: number, dayOfYear: number, hourUTC = 12): DayParams {
  const g = ((2 * Math.PI) / (isLeap(year) ? 366 : 365)) * (dayOfYear - 1 + (hourUTC - 12) / 24);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  return { decl, eqtime };
}

function dayOfYear(year: number, month: number, day: number) {
  return Math.round((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / 86400000) + 1;
}

/** Sun position for a latitude, declination (radians) and hour angle (degrees, 0 = solar noon). */
function sunFromHourAngle(latDeg: number, decl: number, haDeg: number): SunPosition {
  const phi = latDeg * RAD;
  const ha = haDeg * RAD;
  const cosZen = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
  const elevation = 90 - Math.acos(clamp(cosZen, -1, 1)) * DEG;
  const fromSouth = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi));
  return { elevation, azimuth: (fromSouth * DEG + 540) % 360 };
}

/** Where the sun is at a given moment for a place on Earth. */
export function sunPosition(date: Date, lat: number, lon: number): SunPosition {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const doy = dayOfYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const { decl, eqtime } = dayParams(date.getUTCFullYear(), doy, hours);
  const trueSolarMinutes = hours * 60 + eqtime + 4 * lon;
  return sunFromHourAngle(lat, decl, trueSolarMinutes / 4 - 180);
}

export interface SunTimes {
  sunrise: Date | null;
  solarNoon: Date;
  sunset: Date | null;
  /** Minutes of daylight. */
  daylight: number;
  polar: 'day' | 'night' | null;
}

/** Sunrise, solar noon and sunset for the place's current calendar day. */
export function sunTimes(date: Date, lat: number, lon: number): SunTimes {
  // Use the location's own calendar day, estimated from its longitude.
  const local = new Date(date.getTime() + (lon / 15) * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth(), d = local.getUTCDate();
  const { decl, eqtime } = dayParams(y, dayOfYear(y, m, d), 12);
  const dayStart = Date.UTC(y, m, d);
  const at = (minutes: number) => new Date(dayStart + minutes * 60000);

  const noon = 720 - 4 * lon - eqtime;
  const phi = lat * RAD;
  const cosH = Math.cos(90.833 * RAD) / (Math.cos(phi) * Math.cos(decl)) - Math.tan(phi) * Math.tan(decl);

  if (cosH > 1) return { sunrise: null, solarNoon: at(noon), sunset: null, daylight: 0, polar: 'night' };
  if (cosH < -1) return { sunrise: null, solarNoon: at(noon), sunset: null, daylight: 1440, polar: 'day' };

  const h0 = Math.acos(cosH) * DEG;
  return { sunrise: at(noon - 4 * h0), solarNoon: at(noon), sunset: at(noon + 4 * h0), daylight: 8 * h0, polar: null };
}

/** Clear-sky direct, diffuse and global irradiance (W/m²) for a sun elevation. */
function clearSky(elevation: number) {
  if (elevation <= 0.5) return null;
  const zen = 90 - elevation;
  const airMass = 1 / (Math.cos(zen * RAD) + 0.50572 * Math.pow(96.07995 - zen, -1.6364));
  const dni = 1353 * Math.pow(0.7, Math.pow(airMass, 0.678));
  const dhi = 0.1 * dni;
  const ghi = dni * Math.sin(elevation * RAD) + dhi;
  return { dni, dhi, ghi };
}

/** Irradiance on a tilted plane: direct beam + isotropic sky diffuse + ground reflection (albedo 0.2). */
function onPanel(sun: SunPosition, sky: { dni: number; dhi: number; ghi: number }, tilt: number, panelAz: number) {
  const t = tilt * RAD;
  const cosIncidence = Math.sin(sun.elevation * RAD) * Math.cos(t) + Math.cos(sun.elevation * RAD) * Math.sin(t) * Math.cos((sun.azimuth - panelAz) * RAD);
  return sky.dni * Math.max(0, cosIncidence) + sky.dhi * (1 + Math.cos(t)) / 2 + sky.ghi * 0.2 * (1 - Math.cos(t)) / 2;
}

export interface TiltPlan {
  /** Best fixed tilt for the whole year, degrees. */
  annual: number;
  /** Best tilt for the half-year when the sun is high. */
  summer: number;
  /** Best tilt for the half-year when the sun is low. */
  winter: number;
  /** What to actually use: the annual optimum, but at least 10° so rain can clean the panels. */
  recommended: number;
  /** Direction the panels should face, degrees from true north (180 = south, 0 = north). */
  azimuth: number;
  /** Extra yearly clear-sky sunlight vs flat panels, percent. */
  gainVsFlat: number;
  equatorial: boolean;
}

/**
 * Finds the best tilt by simulating the sun every 20 minutes on every third day of a year
 * and summing clear-sky light on an equator-facing panel for each tilt from 0° to 90°.
 */
export function optimalTilts(lat: number): TiltPlan {
  const hemi = lat >= 0 ? 1 : -1;
  const panelAz = lat >= 0 ? 180 : 0;
  const samples: { sun: SunPosition; sky: NonNullable<ReturnType<typeof clearSky>>; summer: boolean }[] = [];

  for (let doy = 1; doy <= 365; doy += 3) {
    const { decl } = dayParams(2025, doy, 12);
    const summer = decl * hemi > 0;
    for (let ha = -180; ha < 180; ha += 5) {
      const sun = sunFromHourAngle(lat, decl, ha);
      const sky = clearSky(sun.elevation);
      if (sky) samples.push({ sun, sky, summer });
    }
  }

  const best = { annual: [0, -1], summer: [0, -1], winter: [0, -1] } as Record<'annual' | 'summer' | 'winter', [number, number]>;
  let flat = 0;
  for (let tilt = 0; tilt <= 90; tilt++) {
    let all = 0, sum = 0, win = 0;
    for (const s of samples) {
      const e = onPanel(s.sun, s.sky, tilt, panelAz);
      all += e;
      if (s.summer) sum += e; else win += e;
    }
    if (tilt === 0) flat = all;
    if (all > best.annual[1]) best.annual = [tilt, all];
    if (sum > best.summer[1]) best.summer = [tilt, sum];
    if (win > best.winter[1]) best.winter = [tilt, win];
  }

  const annual = best.annual[0];
  // Close to the poles there may be no winter sun at all.
  const winter = best.winter[1] > 0 ? best.winter[0] : Math.min(90, annual + 15);

  return {
    annual,
    summer: best.summer[0],
    winter,
    recommended: Math.max(annual, 10),
    azimuth: panelAz,
    gainVsFlat: flat > 0 ? Math.round((best.annual[1] / flat - 1) * 100) : 0,
    equatorial: Math.abs(lat) < 5,
  };
}

export interface RowSpacing {
  /** Distance from the front of one row to the front of the next, metres. */
  pitch: number;
  /** Clear ground between rows, metres. */
  gap: number;
  /** Share of the ground covered by panels (0–1). */
  coverage: number;
  /** Solar-time window the spacing protects on the shortest day. */
  window: '9:00–15:00' | '10:00–14:00' | 'around noon';
  /** The sun never rises on the shortest day. */
  polarNight: boolean;
  /** The midwinter sun stays under 5° even at midday, so some shading is hard to avoid. */
  lowSun: boolean;
}

/** Row spacing so panels don't shade the row behind them on the shortest day of the year. */
export function rowSpacing(lat: number, tilt: number, panelLength: number): RowSpacing {
  const hemi = lat >= 0 ? 1 : -1;
  const decl = -hemi * 23.44 * RAD;
  const panelAz = lat >= 0 ? 180 : 0;
  const height = panelLength * Math.sin(tilt * RAD);
  const footprint = panelLength * Math.cos(tilt * RAD);

  const noonElevation = sunFromHourAngle(lat, decl, 0).elevation;
  if (noonElevation <= 1) return { pitch: NaN, gap: NaN, coverage: NaN, window: 'around noon', polarNight: true, lowSun: true };

  const shadowOver = (start: number, end: number) => {
    let longest = 0, lowest = 90;
    for (let t = start; t <= end + 1e-9; t += 0.25) {
      const sun = sunFromHourAngle(lat, decl, (t - 12) * 15);
      lowest = Math.min(lowest, sun.elevation);
      if (sun.elevation <= 0) continue;
      const along = Math.cos((sun.azimuth - panelAz) * RAD);
      longest = Math.max(longest, (height * along) / Math.tan(sun.elevation * RAD));
    }
    return { longest, lowest };
  };

  let window: RowSpacing['window'] = '9:00–15:00';
  let r = shadowOver(9, 15);
  if (r.lowest < 8) { window = '10:00–14:00'; r = shadowOver(10, 14); }
  if (r.lowest < 5) { window = 'around noon'; r = shadowOver(11.5, 12.5); }

  const gap = Math.max(0, r.longest);
  const pitch = footprint + gap;
  return { pitch, gap, coverage: panelLength / pitch, window, polarNight: false, lowSun: noonElevation < 5 };
}
