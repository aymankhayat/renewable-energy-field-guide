import type { EnergySource, SourceKey } from './types';
import { solar, wind, hydro, geothermal } from './sources-primary';
import { biomass, hydrogen, tidal } from './sources-secondary';

export const SOURCES: Record<SourceKey, EnergySource> = {
  solar, wind, hydro, geothermal, biomass, hydrogen, tidal,
};

export const ORDER: SourceKey[] = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'hydrogen', 'tidal'];
