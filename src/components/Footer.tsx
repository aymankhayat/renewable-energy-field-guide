import type { CSSProperties } from 'react';
import { ORDER, SOURCES } from '../data/sources';
import { PRESENTATION } from '../data/presentation';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="about">
      <div className="signature">
        <p className="signature-kicker">Designed &amp; built by</p>
        <p className="signature-name">Ayman Khayat</p>
        <p className="signature-note">
          An interactive field guide to seven renewable energy sources: what they are, how we harvest them, and where on Earth they work best.
        </p>
        <p className="signature-meta">© {year} Ayman Khayat</p>
      </div>

      <div className="credits">
        <h2>Photo credits</h2>
        <ul>
          {ORDER.flatMap(key =>
            (['hero', 'detail'] as const).map(slot => {
              const p = PRESENTATION[key][slot];
              return (
                <li key={`${key}-${slot}`} style={{ '--c': SOURCES[key].color } as CSSProperties}>
                  <span className="credit-source">{SOURCES[key].label}</span>
                  <a href={p.credit.sourceUrl} target="_blank" rel="noreferrer">{p.caption}</a>
                  <span className="credit-by">
                    {p.credit.author || 'Unknown author'} ·{' '}
                    {p.credit.licenseUrl ? <a href={p.credit.licenseUrl} target="_blank" rel="noreferrer">{p.credit.license}</a> : p.credit.license}
                  </span>
                </li>
              );
            }),
          )}
        </ul>
        <p className="credits-note">
          Photos from Wikimedia Commons, resized and colour-graded for this site. Figures are typical ranges from public industry and agency sources; real projects vary by site, year, and financing.
        </p>
      </div>
    </footer>
  );
}
