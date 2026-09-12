import type { CSSProperties } from 'react';
import type { RegionKey, SourceKey } from '../data/types';
import { ORDER, SOURCES } from '../data/sources';
import { REGION_LABEL } from '../data/regions';
import { formatQuantity } from '../lib/units';
import type { UnitSystem } from '../lib/units';
import { SourceIcon } from './Icons';
import { FitDots, RegionPicker } from './Controls';

interface Props {
  units: UnitSystem;
  region: RegionKey;
  onRegion: (r: RegionKey) => void;
  onOpen: (k: SourceKey) => void;
}

export function CompareView({ units, region, onRegion, onOpen }: Props) {
  // Strongest fit for the chosen region first.
  const rows = [...ORDER].sort((a, b) => SOURCES[b].fit[region].score - SOURCES[a].fit[region].score);

  return (
    <section className="section compare" id="compare" aria-labelledby="compare-title">
      <header className="section-head section-head--split">
        <div>
          <p className="badge"><span className="badge-dot" aria-hidden="true" />Compare</p>
          <h2 id="compare-title" className="section-title">All sources, ranked for {REGION_LABEL[region]}</h2>
          <p className="section-lede">Pick a region to re-rank the table. Select a source name to open it in the hero above.</p>
        </div>
        <RegionPicker value={region} onChange={onRegion} />
      </header>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Capacity factor</th>
              <th scope="col">Typical cost</th>
              <th scope="col">Land footprint</th>
              <th scope="col">Regional fit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(key => {
              const s = SOURCES[key];
              const land = s.land.quantity ? formatQuantity(s.land.quantity, units) : null;
              return (
                <tr key={key} style={{ '--c': s.color } as CSSProperties}>
                  <th scope="row">
                    <button type="button" className="row-open" onClick={() => onOpen(key)}>
                      <SourceIcon source={key} />
                      {s.label}
                    </button>
                  </th>
                  <td>
                    <div className="range range--table" aria-hidden="true">
                      <span style={{ left: `${s.capacityFactor.min}%`, width: `${s.capacityFactor.max - s.capacityFactor.min}%` }} />
                    </div>
                    <span className="mono">{s.capacityFactor.min}–{s.capacityFactor.max}%</span>
                  </td>
                  <td className="mono">{s.cost}</td>
                  <td>{land ? <span className="mono">{land.value} {land.unit}</span> : s.land.text}</td>
                  <td>
                    <FitDots score={s.fit[region].score} />
                    <span className="fit-note">{s.fit[region].note}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
