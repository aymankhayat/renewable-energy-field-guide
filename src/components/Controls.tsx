import type { CSSProperties, KeyboardEvent } from 'react';
import type { RegionKey, SourceKey } from '../data/types';
import { ORDER, SOURCES } from '../data/sources';
import { REGIONS } from '../data/regions';
import { SourceIcon } from './Icons';

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

/** A small two-or-more-way switch, exposed as a radio group. */
export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'is-on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Dots on a 1–5 scale. */
export function FitDots({ score, label }: { score: number; label?: string }) {
  return (
    <span className="fit-dots" role="img" aria-label={label ?? `${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < score ? 'on' : ''} />)}
    </span>
  );
}

interface SourceNavProps {
  active: SourceKey;
  dimmed: boolean;
  onSelect: (k: SourceKey) => void;
}

export function SourceNav({ active, dimmed, onSelect }: SourceNavProps) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = ORDER[(ORDER.indexOf(active) + dir + ORDER.length) % ORDER.length];
    onSelect(next);
    (e.currentTarget.querySelector(`[data-key="${next}"]`) as HTMLElement | null)?.focus();
  };

  return (
    <div className={`source-nav${dimmed ? ' is-dimmed' : ''}`} role="tablist" aria-label="Energy sources" onKeyDown={onKey}>
      {ORDER.map(key => {
        const s = SOURCES[key];
        const on = key === active && !dimmed;
        return (
          <button
            key={key}
            data-key={key}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={key === active ? 0 : -1}
            className={`source-tab${on ? ' is-on' : ''}`}
            style={{ '--c': s.color } as CSSProperties}
            onClick={() => onSelect(key)}
          >
            <SourceIcon source={key} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface RegionPickerProps {
  value: RegionKey;
  onChange: (r: RegionKey) => void;
}

export function RegionPicker({ value, onChange }: RegionPickerProps) {
  return (
    <label className="region-picker">
      <span>Region</span>
      <select value={value} onChange={e => onChange(e.target.value as RegionKey)}>
        {REGIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
      </select>
    </label>
  );
}
