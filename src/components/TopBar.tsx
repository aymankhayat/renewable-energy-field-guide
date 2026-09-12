import { useEffect, useState } from 'react';
import type { UnitSystem } from '../lib/units';
import { Segmented } from './Controls';

const LINKS = [
  { id: 'sources', label: 'Sources' },
  { id: 'atlas', label: 'Atlas' },
  { id: 'compare', label: 'Compare' },
  { id: 'about', label: 'About' },
];

interface Props {
  units: UnitSystem;
  onUnits: (u: UnitSystem) => void;
}

/** Highlights the nav link for whichever section is in view. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function TopBar({ units, onUnits }: Props) {
  const active = useActiveSection(LINKS.map(l => l.id));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <a className="wordmark" href="#sources" aria-label="Field Guide home">
        <svg viewBox="0 0 132 28" aria-hidden="true">
          <text x="0" y="20">FIELD GUIDE</text>
          <path d="M60 24 C 90 22, 116 14, 131 4" />
        </svg>
      </a>

      <nav className="navpill" aria-label="Sections">
        {LINKS.map(l => (
          <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-on' : ''} aria-current={active === l.id ? 'true' : undefined}>
            {l.label}
          </a>
        ))}
      </nav>

      <div className="topbar-end">
        <Segmented
          label="Units"
          value={units}
          onChange={onUnits}
          options={[{ value: 'metric', label: 'Metric' }, { value: 'imperial', label: 'Imperial' }]}
        />
        <a className="profile" href="#about" aria-label="Designed and built by Ayman Khayat">
          <span className="profile-avatar" aria-hidden="true">AK</span>
          <span className="profile-text">
            <strong>Ayman Khayat</strong>
            <span>Designer &amp; developer</span>
          </span>
        </a>
      </div>
    </header>
  );
}
