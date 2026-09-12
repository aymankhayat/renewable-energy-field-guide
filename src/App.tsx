import type { CSSProperties } from 'react';
import type { SourceKey, RegionKey } from './data/types';
import { ORDER, SOURCES } from './data/sources';
import { REGIONS } from './data/regions';
import type { UnitSystem } from './lib/units';
import { usePersistentState } from './lib/usePersistentState';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { SourceSections } from './components/SourceSections';
import { CompareView } from './components/CompareView';
import { Footer } from './components/Footer';
import type { MapMode } from './components/WorldMap';

const REGION_KEYS = REGIONS.map(r => r.key);

export function App() {
  const [active, setActive] = usePersistentState<SourceKey>('reg:source', 'solar', ORDER);
  const [units, setUnits] = usePersistentState<UnitSystem>('reg:units', 'metric', ['metric', 'imperial']);
  const [region, setRegion] = usePersistentState<RegionKey>('reg:region', 'mena', REGION_KEYS);
  const [mapMode, setMapMode] = usePersistentState<MapMode>('reg:map', 'globe', ['globe', 'flat']);

  const source = SOURCES[active];

  const openSource = (k: SourceKey) => {
    setActive(k);
    document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app" style={{ '--c': source.color } as CSSProperties}>
      <a className="skip-link" href="#explain">Skip to the explainer</a>
      <TopBar units={units} onUnits={setUnits} />
      <main>
        <Hero source={source} units={units} region={region} onSelect={setActive} />
        <SourceSections
          source={source}
          units={units}
          region={region}
          onRegion={setRegion}
          mapMode={mapMode}
          onMapMode={setMapMode}
        />
        <CompareView units={units} region={region} onRegion={setRegion} onOpen={openSource} />
      </main>
      <Footer />
    </div>
  );
}
