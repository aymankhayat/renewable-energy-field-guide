export type UnitSystem = 'metric' | 'imperial';

/** Physical quantity kinds that differ between metric and imperial. */
export type QuantityKind =
  | 'length'        // m ↔ ft
  | 'depth'         // km ↔ mi
  | 'speed'         // m/s ↔ mph
  | 'temperature'   // °C ↔ °F
  | 'landPerPower'  // ha/MW ↔ acres/MW
  | 'irradiance'    // kWh/m²/day ↔ kWh/ft²/day
  | 'fuelEnergy'    // MJ/kg ↔ Btu/lb
  | 'massEnergy'    // kWh/kg ↔ kWh/lb
  | 'pressure'      // bar ↔ psi
  | 'waveFlux'      // kW/m ↔ kW/ft
  | 'waterPerMass'; // L/kg ↔ gal/lb

interface UnitDef {
  metric: string;
  imperial: string;
  toImperial: (v: number) => number;
}

const UNITS: Record<QuantityKind, UnitDef> = {
  length:       { metric: 'm',         imperial: 'ft',          toImperial: v => v * 3.28084 },
  depth:        { metric: 'km',        imperial: 'mi',          toImperial: v => v * 0.621371 },
  speed:        { metric: 'm/s',       imperial: 'mph',         toImperial: v => v * 2.23694 },
  temperature:  { metric: '°C',        imperial: '°F',          toImperial: v => v * 9 / 5 + 32 },
  landPerPower: { metric: 'ha/MW',     imperial: 'acres/MW',    toImperial: v => v * 2.47105 },
  irradiance:   { metric: 'kWh/m²/day', imperial: 'kWh/ft²/day', toImperial: v => v / 10.7639 },
  fuelEnergy:   { metric: 'MJ/kg',     imperial: 'Btu/lb',      toImperial: v => v * 429.923 },
  massEnergy:   { metric: 'kWh/kg',    imperial: 'kWh/lb',      toImperial: v => v / 2.20462 },
  pressure:     { metric: 'bar',       imperial: 'psi',         toImperial: v => v * 14.5038 },
  waveFlux:     { metric: 'kW/m',      imperial: 'kW/ft',       toImperial: v => v / 3.28084 },
  waterPerMass: { metric: 'L/kg',      imperial: 'gal/lb',      toImperial: v => v * 0.119826 },
};

export interface Quantity {
  kind: QuantityKind;
  /** Values are always stored in metric. */
  min: number;
  max?: number;
}

/** Round to a readable precision: 3 significant figures, thousands separated. */
function tidy(v: number): string {
  const abs = Math.abs(v);
  let digits = 0;
  if (abs < 1) digits = 2;
  else if (abs < 10) digits = 1;
  const rounded = abs >= 10000 ? Math.round(v / 10) * 10 : abs >= 100 ? Math.round(v) : Number(v.toFixed(digits));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: digits });
}

export function convert(q: Quantity, system: UnitSystem): { min: number; max?: number; unit: string } {
  const def = UNITS[q.kind];
  if (system === 'metric') return { min: q.min, max: q.max, unit: def.metric };
  return {
    min: def.toImperial(q.min),
    max: q.max === undefined ? undefined : def.toImperial(q.max),
    unit: def.imperial,
  };
}

/** Returns the formatted number range and its unit separately, so they can be styled apart. */
export function formatQuantity(q: Quantity, system: UnitSystem): { value: string; unit: string } {
  const c = convert(q, system);
  const value = c.max === undefined ? tidy(c.min) : `${tidy(c.min)}–${tidy(c.max)}`;
  return { value, unit: c.unit };
}
