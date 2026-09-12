import type { EnergySource, RegionKey } from '../data/types';
import { REGION_LABEL } from '../data/regions';
import { formatQuantity } from '../lib/units';
import type { UnitSystem } from '../lib/units';
import { SourceIcon } from './Icons';
import { FitDots, RegionPicker, Segmented } from './Controls';
import { WorldMap, TIER_OPACITY } from './WorldMap';
import { SolarPlanner } from './SolarPlanner';
import type { MapMode } from './WorldMap';

interface Props {
  source: EnergySource;
  units: UnitSystem;
  region: RegionKey;
  onRegion: (r: RegionKey) => void;
  mapMode: MapMode;
  onMapMode: (m: MapMode) => void;
}

/** Everything below the hero that describes the selected source. */
export function SourceSections({ source, units, region, onRegion, mapMode, onMapMode }: Props) {
  const fit = source.fit[region];
  const land = source.land.quantity ? formatQuantity(source.land.quantity, units) : null;
  const cf = source.capacityFactor;

  return (
    <>
      <section className="section explain" id="explain" aria-labelledby="explain-title">
        <header className="section-head">
          <p className="badge"><span className="badge-dot" aria-hidden="true" />How it works</p>
          <h2 id="explain-title" className="section-title">
            <SourceIcon source={source.key} className="section-title-icon" />
            {source.label}, explained
          </h2>
        </header>
        <div className="explain-grid">
          <div className="explain-text">
            <div>
              <h3>What it is</h3>
              <p>{source.whatItIs}</p>
            </div>
            <div>
              <h3>How we harvest it</h3>
              <p>{source.howWeHarvest}</p>
            </div>
          </div>
          <dl className="instrument" aria-label={`${source.label} key numbers`}>
            {source.metrics.map(m => {
              const q = formatQuantity(m.quantity, units);
              return (
                <div className="instrument-row" key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>
                    <span className="instrument-value">{q.value}</span>
                    <span className="instrument-unit">{q.unit}</span>
                  </dd>
                  {m.note && <dd className="instrument-note">{m.note}</dd>}
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {source.key === 'solar' && <SolarPlanner units={units} />}

      <section className="section atlas" id="atlas" aria-labelledby="atlas-title">
        <header className="section-head section-head--split">
          <div>
            <p className="badge"><span className="badge-dot" aria-hidden="true" />Atlas</p>
            <h2 id="atlas-title" className="section-title">Where it works best</h2>
            <p className="section-lede">{source.bestEnvironments}</p>
          </div>
          <Segmented
            label="Map view"
            value={mapMode}
            onChange={onMapMode}
            options={[{ value: 'globe', label: 'Globe' }, { value: 'flat', label: 'Flat map' }]}
          />
        </header>

        <WorldMap source={source} region={region} mode={mapMode} onRegionSelect={onRegion} />

        <div className="atlas-foot">
          <ul className="legend" aria-label="Map legend">
            {([3, 2, 1] as const).map(t => (
              <li key={t}>
                <span className="swatch" style={{ opacity: TIER_OPACITY[t] }} />
                {t === 3 ? 'Excellent' : t === 2 ? 'Good' : 'Moderate'}
              </li>
            ))}
            <li><span className="swatch swatch--pin" />Notable site</li>
          </ul>
          <p className="atlas-hint">
            {mapMode === 'globe' ? 'Drag to turn the globe. ' : ''}Click a country to rate its region below.
          </p>
        </div>
      </section>

      <section className="section bento" id="fit" aria-label={`${source.label} figures and regional fit`}>
        <div className="tile">
          <h3>Capacity factor</h3>
          <p className="tile-value">{cf.text}</p>
          <div className="range" aria-hidden="true">
            <span style={{ left: `${cf.min}%`, width: `${cf.max - cf.min}%` }} />
          </div>
          <p className="tile-note">Share of the year it runs at full output</p>
        </div>
        <div className="tile">
          <h3>Typical cost</h3>
          <p className="tile-value">{source.cost}</p>
          <p className="tile-note">Lifetime cost per unit of energy (LCOE)</p>
        </div>
        <div className="tile">
          <h3>Land footprint</h3>
          <p className="tile-value">{land ? `${land.value} ${land.unit}` : source.land.text}</p>
          {land && <p className="tile-note">{source.land.text}</p>}
        </div>
        <div className="tile tile--fit" aria-live="polite">
          <div className="tile-fit-head">
            <h3>Fit for {REGION_LABEL[region]}</h3>
            <RegionPicker value={region} onChange={onRegion} />
          </div>
          <div className="tile-fit-body">
            <strong className="tile-fit-score">{fit.score}<small>/5</small></strong>
            <div>
              <FitDots score={fit.score} />
              <p>{fit.note}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
