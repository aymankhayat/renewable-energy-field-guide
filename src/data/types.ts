import type { Quantity } from '../lib/units';

export type SourceKey =
  | 'solar'
  | 'wind'
  | 'hydro'
  | 'geothermal'
  | 'biomass'
  | 'hydrogen'
  | 'tidal';

export type RegionKey =
  | 'mena'
  | 'europe'
  | 'namerica'
  | 'latam'
  | 'ssafrica'
  | 'sasia'
  | 'easia'
  | 'oceania';

export interface Metric {
  label: string;
  quantity: Quantity;
  note?: string;
}

export interface Hotspot {
  name: string;
  /** [longitude, latitude] */
  coords: [number, number];
  detail: string;
}

export interface RegionFit {
  score: 1 | 2 | 3 | 4 | 5;
  note: string;
}

export interface EnergySource {
  key: SourceKey;
  label: string;
  /** What kind of thing this is, shown under the name. */
  kind: string;
  color: string;
  summary: string;
  whatItIs: string;
  howWeHarvest: string;
  bestEnvironments: string;
  capacityFactor: { min: number; max: number; text: string };
  cost: string;
  land: { quantity?: Quantity; text: string };
  metrics: Metric[];
  /** ISO 3166-1 numeric country code → suitability tier (3 = excellent). */
  countries: Record<number, 1 | 2 | 3>;
  hotspots: Hotspot[];
  fit: Record<RegionKey, RegionFit>;
}
