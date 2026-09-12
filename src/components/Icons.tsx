import type { SourceKey } from '../data/types';

const common = {
  viewBox: '0 0 48 48',
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const PATHS: Record<SourceKey, JSX.Element> = {
  solar: (
    <>
      <circle cx="24" cy="24" r="9" />
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.5 9.5l4.2 4.2M34.3 34.3l4.2 4.2M9.5 38.5l4.2-4.2M34.3 13.7l4.2-4.2" />
    </>
  ),
  wind: (
    <>
      <path d="M24 44V16" />
      <path d="M24 16c0-6 4-10 9-10 3 0 5 2 5 5 0 5-6 5-14 5z" />
      <path d="M24 16c-7-2-12-6-12-11 0-3 2-5 5-5 5 0 7 6 7 16z" />
      <path d="M24 16c6 4 8 10 5 15-1.5 2.6-5 3-6.5.4-2.5-4.3 0-10 1.5-15.4z" />
    </>
  ),
  hydro: (
    <>
      <path d="M6 20h10l4-10 4 16 4-10 4 4h10" />
      <path d="M4 34c3-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" />
      <path d="M4 41c3-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" />
    </>
  ),
  geothermal: (
    <>
      <path d="M6 40 18 14l6 10 6-14 12 30z" />
      <path d="M17 8c1 2-1 3-1 5s2 3 1 5M24 4c1 2-1 3-1 5s2 3 1 5" />
    </>
  ),
  biomass: (
    <>
      <path d="M24 42c-14 0-16-13-14-24 10 1 14 6 14 6s4-5 14-6c2 11 0 24-14 24z" />
      <path d="M24 42V20" />
    </>
  ),
  hydrogen: (
    <>
      <circle cx="16" cy="24" r="8" />
      <circle cx="32" cy="24" r="8" />
      <path d="M14 21v6M18 21v6M14 24h4M30 21v6M34 21v6M30 24h4" />
      <path d="M24 6v5M24 37v5" />
    </>
  ),
  tidal: (
    <>
      <path d="M32 6a8 8 0 1 0 8 10 6.5 6.5 0 0 1-8-10z" />
      <path d="M4 30c4-4 8-4 12 0s8 4 12 0 8-4 12 0 4 2 4 2" />
      <path d="M4 39c4-4 8-4 12 0s8 4 12 0 8-4 12 0 4 2 4 2" />
    </>
  ),
};

export function SourceIcon({ source, className }: { source: SourceKey; className?: string }) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      {PATHS[source]}
    </svg>
  );
}
