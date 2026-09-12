import type { RegionKey } from './types';

export const REGIONS: { key: RegionKey; label: string }[] = [
  { key: 'mena', label: 'Gulf & MENA' },
  { key: 'europe', label: 'Europe' },
  { key: 'namerica', label: 'North America' },
  { key: 'latam', label: 'Latin America' },
  { key: 'ssafrica', label: 'Sub-Saharan Africa' },
  { key: 'sasia', label: 'South & Central Asia' },
  { key: 'easia', label: 'East & Southeast Asia' },
  { key: 'oceania', label: 'Oceania' },
];

export const REGION_LABEL = Object.fromEntries(REGIONS.map(r => [r.key, r.label])) as Record<RegionKey, string>;

/** Countries whose centroid would put them in the wrong bucket. */
const OVERRIDES: Record<number, RegionKey> = {
  643: 'europe',   // Russia
  304: 'namerica', // Greenland
  484: 'latam',    // Mexico
  44: 'latam',     // Bahamas
  760: 'mena',     // Syria
  795: 'sasia',    // Turkmenistan
  860: 'sasia',    // Uzbekistan
  626: 'easia',    // Timor-Leste
};

/**
 * Assigns a country to a region from its ISO code and centroid.
 * Coarse on purpose: good enough to group countries on the map.
 */
export function regionOf(id: number, [lon, lat]: [number, number]): RegionKey {
  if (OVERRIDES[id]) return OVERRIDES[id];
  if (lon < -30) return lat > 24 ? 'namerica' : 'latam';
  if ((lat < 0 && lon > 125) || lon > 160) return 'oceania';
  if (lat > 36 && lon < 50) return 'europe';
  if (lon >= -20 && lon < 63 && lat >= 12 && (lat > 18.5 || lon > 35)) return 'mena';
  if (lon >= -20 && lon < 55 && lat < 18.5) return 'ssafrica';
  if (lon >= 60 && lon < 95 && lat > 5) return 'sasia';
  return 'easia';
}
