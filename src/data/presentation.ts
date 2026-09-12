import type { SourceKey } from './types';
import creditsJson from './photo-credits.json';

interface CreditRecord {
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  width: number;
  height: number;
}

export interface Photo {
  src: string;
  alt: string;
  caption: string;
  /** CSS object-position, so each crop keeps its subject in frame. */
  focus: string;
  credit: CreditRecord;
}

export interface Presentation {
  /** Three headline lines; the middle one carries the icon pill. */
  headline: [string, string, string];
  hero: Photo;
  detail: Photo;
}

const CREDITS = creditsJson as Record<string, CreditRecord>;

const photo = (id: string, alt: string, caption: string, focus = 'center'): Photo => ({
  src: `/images/${id}.jpg`,
  alt,
  caption,
  focus,
  credit: CREDITS[id],
});

export const PRESENTATION: Record<SourceKey, Presentation> = {
  solar: {
    headline: ['Harvesting', 'Pure', 'Sunlight'],
    hero: photo('solar-hero', 'Rows of tilted solar panels on tracking mounts in dry grassland', 'Photovoltaic power station, Cariñena, Spain', '70% 55%'),
    detail: photo('solar-detail', 'Aerial view of a circular field of mirrors around a central solar tower', 'Gemasolar: 2,650 mirrors aimed at one tower, Seville, Spain'),
  },
  wind: {
    headline: ['Power', 'Carried', 'On The Wind'],
    hero: photo('wind-hero', 'Wind turbines silhouetted against an orange sunset', 'Wind farm on the Haarstrang ridge, Ostbüren, Germany', '60% 60%'),
    detail: photo('wind-detail', 'Offshore wind turbines standing in the open sea', 'Thornton Bank offshore wind farm, 28 km off Belgium', 'center 35%'),
  },
  hydro: {
    headline: ['Gravity', 'Turned', 'Into Power'],
    hero: photo('hydro-hero', 'Giant pipes running down a forested hillside into a hydro power station', 'Murray 1 hydroelectric power station, New South Wales, Australia', '55% 50%'),
    detail: photo('hydro-detail', 'Water flowing out below a long concrete dam', 'Aswan High Dam on the Nile, Egypt'),
  },
  geothermal: {
    headline: ['Heat From', 'The Deep', 'Earth'],
    hero: photo('geothermal-hero', 'Steam plumes rising from a geothermal plant in a volcanic valley', 'Krafla geothermal power station, Iceland', '45% 45%'),
    detail: photo('geothermal-detail', 'A geothermal plant with steam vents beside a milky blue lake', 'Bjarnarflag station and its acidic blue lake, Iceland'),
  },
  biomass: {
    headline: ['Sunlight', 'Stored In', 'Living Matter'],
    hero: photo('biomass-hero', 'A loader working beside a mound of fibrous sugarcane residue', 'Bagasse, the fibre left after crushing sugarcane, piled as fuel', '60% 55%'),
    detail: photo('biomass-detail', 'A small heap of cylindrical wood pellets', 'Wood pellets, a dense and easily shipped biomass fuel'),
  },
  hydrogen: {
    headline: ['Water', 'Split Into', 'Clean Fuel'],
    hero: photo('hydrogen-hero', 'A large white spherical liquid hydrogen tank on flat grassland', 'Liquid hydrogen sphere at Launch Complex 39, Florida', '62% 55%'),
    detail: photo('hydrogen-detail', 'An electrolyser stack of tall cylinders and blue frames on display', 'Electrolyser from the UK’s first hydrogen refuelling station', 'center 40%'),
  },
  tidal: {
    headline: ['Power', 'Pulled By', 'The Moon'],
    hero: photo('tidal-hero', 'A surfer dropping down the face of a huge curling wave', 'A giant winter swell at Mavericks, California', '68% 50%'),
    detail: photo('tidal-detail', 'A twin-rotor tidal turbine being lowered from a crane into a harbour', 'Capricorn marine turbine during deployment, Scotland'),
  },
};
