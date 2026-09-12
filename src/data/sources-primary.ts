import type { EnergySource } from './types';

export const solar: EnergySource = {
  key: 'solar',
  label: 'Solar',
  kind: 'Primary source · sunlight',
  color: '#E2B84B',
  summary: 'Photons from the sun, turned straight into current or captured as heat.',
  whatItIs:
    "Sunlight carries energy as photons. Photovoltaic (PV) cells are semiconductor material — usually silicon — that absorbs those photons and knocks electrons loose, creating a flow of current directly. Solar thermal systems work differently: they use sunlight's heat directly, warming a fluid instead of generating electricity right away.",
  howWeHarvest:
    'PV panels are wired into arrays, tilted toward the sun (fixed, or on tracking mounts that follow it through the day for 15–25% more yield). An inverter converts the DC output to grid-usable AC. Concentrated solar power (CSP) plants use mirrors to focus sunlight onto a receiver, heating a fluid to drive a conventional steam turbine — and that heat can be stored for hours after sunset.',
  bestEnvironments:
    "High direct solar irradiance with few cloudy days: desert and semi-arid belts roughly 15–35° from the equator. The Arabian Peninsula, North Africa, the US Southwest, and Australia's outback are near-ideal.",
  capacityFactor: { min: 15, max: 35, text: '15–25% (up to ~35% tracking)' },
  cost: '$25–55 / MWh',
  land: { quantity: { kind: 'landPerPower', min: 1, max: 2 }, text: 'Moderate; panels plus row spacing' },
  metrics: [
    { label: 'Irradiance at top sites', quantity: { kind: 'irradiance', min: 5.5, max: 7.5 }, note: 'Global horizontal, daily average' },
    { label: 'CSP receiver temperature', quantity: { kind: 'temperature', min: 390, max: 565 }, note: 'Hot enough to store in molten salt' },
    { label: 'Land per megawatt', quantity: { kind: 'landPerPower', min: 1, max: 2 } },
  ],
  countries: {
    682: 3, 784: 3, 512: 3, 634: 3, 414: 3, 48: 3, 887: 3, 400: 3, 376: 3, 818: 3, 434: 3, 12: 3, 504: 3,
    732: 3, 478: 3, 788: 3, 562: 3, 148: 3, 729: 3, 516: 3, 72: 3, 710: 3, 36: 3, 152: 3, 364: 3, 368: 3,
    840: 2, 484: 2, 604: 2, 724: 2, 620: 2, 356: 2, 586: 2, 4: 2, 32: 2, 68: 2, 466: 2, 231: 2, 706: 2,
    404: 2, 24: 2, 894: 2, 716: 2, 792: 2, 300: 2, 380: 2, 156: 2, 496: 2, 795: 2, 860: 2, 76: 2,
    250: 1, 764: 1, 704: 1, 608: 1, 398: 1, 170: 1, 862: 1, 508: 1, 566: 1, 686: 1,
  },
  hotspots: [
    { name: 'Al Dhafra, UAE', coords: [54.3, 23.9], detail: 'One of the largest single-site PV plants in the world.' },
    { name: 'MBR Solar Park, Dubai', coords: [55.37, 24.75], detail: 'PV and CSP side by side, including a 262 m solar tower.' },
    { name: 'Benban, Egypt', coords: [32.73, 24.45], detail: 'A cluster of around 40 plants in the Western Desert.' },
    { name: 'Noor Ouarzazate, Morocco', coords: [-6.87, 31.05], detail: 'CSP with molten-salt storage for evening output.' },
    { name: 'Bhadla, India', coords: [71.91, 27.53], detail: 'A multi-gigawatt park in the Thar Desert.' },
    { name: 'Atacama, Chile', coords: [-69.5, -23.5], detail: 'The highest measured irradiance on Earth.' },
    { name: 'Mojave, USA', coords: [-117.0, 35.0], detail: 'Home of pioneering CSP and huge PV fields.' },
    { name: 'Tengger Desert, China', coords: [105.0, 37.5], detail: 'Vast desert PV bases feeding eastern cities.' },
  ],
  fit: {
    mena: { score: 5, note: 'Best-in-class resource. The reason Gulf states are building some of the largest solar parks on Earth.' },
    europe: { score: 3, note: 'Strong in Iberia and the Mediterranean, modest in the cloudy north.' },
    namerica: { score: 4, note: 'The US Southwest is world-class; Canada is much weaker.' },
    latam: { score: 5, note: "Chile's Atacama has the highest irradiance measured anywhere." },
    ssafrica: { score: 4, note: 'Excellent sun across the Sahel and the south. Grids and financing are the bottleneck.' },
    sasia: { score: 4, note: 'Rajasthan and Gujarat host gigawatt-scale parks.' },
    easia: { score: 3, note: 'China leads global installs; humid, hazy tropics cut yields elsewhere.' },
    oceania: { score: 5, note: "Australia's interior is near-ideal, and rooftop uptake is among the highest anywhere." },
  },
};

export const wind: EnergySource = {
  key: 'wind',
  label: 'Wind',
  kind: 'Primary source · moving air',
  color: '#7FD1C8',
  summary: 'Moving air spins blades shaped like wings, and the rotor drives a generator.',
  whatItIs:
    "Moving air carries kinetic energy. A turbine's blades are shaped like airplane wings — as air flows over them it creates lift, spinning the rotor. The rotor turns a shaft connected to a generator, converting that rotation into electricity.",
  howWeHarvest:
    'Turbines are grouped into wind farms, onshore or offshore. Modern turbines use variable-pitch blades and yaw motors to angle themselves into the wind and manage speed. Offshore turbines can be larger and catch steadier, stronger wind, but cost more to install and maintain.',
  bestEnvironments:
    'Consistent, strong wind: coastlines, open plains, mountain passes, and offshore sites. Northern Europe, the US Great Plains, and offshore Atlantic sites lead the world. Deserts and enclosed gulfs tend to have comparatively weak, inconsistent wind.',
  capacityFactor: { min: 35, max: 55, text: '35–45% onshore, 45–55% offshore' },
  cost: '$25–50 / MWh onshore',
  land: { text: 'Low direct footprint; turbines are widely spaced and land between them stays usable' },
  metrics: [
    { label: 'Mean wind speed at hub', quantity: { kind: 'speed', min: 7, max: 10 }, note: 'Below ~6 m/s projects rarely pay off' },
    { label: 'Hub height', quantity: { kind: 'length', min: 100, max: 150 } },
    { label: 'Rotor diameter', quantity: { kind: 'length', min: 130, max: 250 }, note: 'The largest are offshore machines' },
  ],
  countries: {
    826: 3, 208: 3, 578: 3, 528: 3, 372: 3, 840: 3, 32: 3, 554: 3, 496: 3, 398: 3, 504: 3, 706: 3, 352: 3,
    276: 2, 124: 2, 152: 2, 76: 2, 36: 2, 156: 2, 818: 2, 404: 2, 710: 2, 231: 2, 724: 2, 620: 2, 250: 2,
    752: 2, 246: 2, 158: 2, 478: 2,
    356: 1, 616: 1, 643: 1, 392: 1, 410: 1, 512: 1, 682: 1, 792: 1, 604: 1, 484: 1,
  },
  hotspots: [
    { name: 'Hornsea, North Sea', coords: [1.9, 53.9], detail: 'Among the largest offshore wind farms in operation.' },
    { name: 'Roscoe, Texas', coords: [-100.5, 32.4], detail: 'The Great Plains wind belt at its strongest.' },
    { name: 'Jiuquan, China', coords: [98.5, 39.7], detail: 'Gansu wind base in the Hexi Corridor.' },
    { name: 'Lake Turkana, Kenya', coords: [36.8, 2.5], detail: "Africa's largest wind farm, in a natural wind tunnel." },
    { name: 'Patagonia, Argentina', coords: [-68.0, -46.5], detail: 'Steady westerlies with world-leading capacity factors.' },
    { name: 'Gulf of Suez, Egypt', coords: [32.9, 28.5], detail: 'One of the few strong wind corridors in MENA.' },
    { name: 'Tarfaya, Morocco', coords: [-12.9, 27.9], detail: 'Atlantic trade winds on the Saharan coast.' },
  ],
  fit: {
    mena: { score: 2, note: "A few strong corridors (Gulf of Suez, Morocco's Atlantic coast), but wind across most of the Gulf is well below world-class." },
    europe: { score: 5, note: 'North Sea offshore wind is the global benchmark.' },
    namerica: { score: 5, note: 'The Great Plains form one of the largest wind belts on land.' },
    latam: { score: 4, note: "Patagonia and Brazil's northeast have exceptional, steady winds." },
    ssafrica: { score: 3, note: 'Strong pockets in Kenya, South Africa, and the Horn of Africa.' },
    sasia: { score: 3, note: "Good along India's west coast and across the Central Asian steppe." },
    easia: { score: 4, note: "China's north and the Taiwan Strait offshore are major resources." },
    oceania: { score: 4, note: 'Southern Australia and New Zealand sit in the roaring forties.' },
  },
};

export const hydro: EnergySource = {
  key: 'hydro',
  label: 'Hydropower',
  kind: 'Primary source · falling water',
  color: '#5EB4E8',
  summary: 'Water falling from height turns a turbine, and dams can store it for later.',
  whatItIs:
    'Falling or flowing water carries gravitational potential energy. As water drops through a dam or channel, it spins a turbine — the type (Francis, Kaplan, Pelton) depends on how much height drop ("head") and flow volume is available.',
  howWeHarvest:
    "Large dams create a reservoir and a controlled head. Run-of-river plants skip the reservoir, using the river's natural flow instead. Pumped-storage plants pump water uphill when electricity is cheap and release it on demand — effectively a giant battery for the grid.",
  bestEnvironments:
    "Mountainous or hilly terrain with reliable rainfall and rivers: the Himalayas, the Andes, Scandinavia, and Central Africa's river basins. Flat, arid regions with little elevation change and low rainfall aren't viable.",
  capacityFactor: { min: 40, max: 60, text: '40–60%' },
  cost: 'Very low once built, high upfront capital',
  land: { text: 'High; reservoirs can flood large areas' },
  metrics: [
    { label: 'Head (height drop)', quantity: { kind: 'length', min: 2, max: 1800 }, note: 'Kaplan turbines at the low end, Pelton at the high end' },
    { label: 'Three Gorges dam height', quantity: { kind: 'length', min: 181 } },
    { label: 'Water temperature in turbines', quantity: { kind: 'temperature', min: 4, max: 25 }, note: 'Colder water is denser and carries slightly more energy' },
  ],
  countries: {
    578: 3, 352: 3, 756: 3, 40: 3, 124: 3, 76: 3, 600: 3, 862: 3, 170: 3, 604: 3, 218: 3, 156: 3, 524: 3,
    64: 3, 762: 3, 417: 3, 180: 3, 231: 3, 894: 3, 418: 3, 554: 3, 752: 3,
    68: 2, 716: 2, 508: 2, 24: 2, 380: 2, 250: 2, 356: 2, 704: 2, 104: 2, 643: 2, 840: 2, 32: 2, 152: 2,
    858: 2, 120: 2, 178: 2, 266: 2, 800: 2,
    246: 1, 724: 1, 360: 1, 792: 1, 328: 1, 626: 1, 598: 1, 392: 1, 36: 1, 710: 1,
  },
  hotspots: [
    { name: 'Three Gorges, China', coords: [111.0, 30.82], detail: 'The largest power station of any kind on Earth.' },
    { name: 'Itaipu, Brazil–Paraguay', coords: [-54.59, -25.41], detail: "Supplies most of Paraguay's electricity." },
    { name: 'Guri, Venezuela', coords: [-62.99, 7.76], detail: 'A giant reservoir on the Caroní River.' },
    { name: 'Grand Coulee, USA', coords: [-118.98, 47.96], detail: 'The largest hydro plant in North America.' },
    { name: 'Robert-Bourassa, Quebec', coords: [-77.45, 53.78], detail: 'Part of the James Bay project.' },
    { name: 'Inga Falls, DR Congo', coords: [13.62, -5.52], detail: 'Potentially the largest untapped hydro site on Earth.' },
    { name: 'GERD, Ethiopia', coords: [35.09, 11.21], detail: "Africa's largest dam, on the Blue Nile." },
    { name: 'Kvilldal, Norway', coords: [6.63, 59.52], detail: 'Fjord-country hydro backing up the European grid.' },
  ],
  fit: {
    mena: { score: 1, note: 'Essentially unviable. The Gulf lacks the elevation and reliable rivers hydropower depends on.' },
    europe: { score: 4, note: 'Norway and the Alps run largely on hydro, but most good sites are already built.' },
    namerica: { score: 4, note: 'Quebec, British Columbia, and the Pacific Northwest.' },
    latam: { score: 5, note: 'Brazil, Paraguay, and the Andes get a large share of their power from hydro.' },
    ssafrica: { score: 4, note: 'The Congo basin holds huge untapped potential.' },
    sasia: { score: 4, note: 'Himalayan rivers power Nepal, Bhutan, and Tajikistan.' },
    easia: { score: 5, note: 'China has the most installed hydro capacity in the world.' },
    oceania: { score: 3, note: "Tasmania and New Zealand's South Island; mainland Australia is dry." },
  },
};

export const geothermal: EnergySource = {
  key: 'geothermal',
  label: 'Geothermal',
  kind: 'Primary source · Earth’s heat',
  color: '#E2724A',
  summary: "Heat from the planet's interior, tapped as steam or hot water through wells.",
  whatItIs:
    "The Earth's interior stays hot from leftover formation heat and the radioactive decay of elements like uranium and thorium. Where that heat reaches close enough to the surface, wells can tap steam or hot water to drive a turbine directly.",
  howWeHarvest:
    "Flash-steam plants pull very hot water up and let it flash to steam under lower pressure to spin a turbine. Binary-cycle plants work with cooler resources, using Earth's heat to boil a second fluid with a lower boiling point. Enhanced Geothermal Systems (EGS) inject fluid into hot dry rock to create a reservoir where none existed naturally.",
  bestEnvironments:
    'Tectonic plate boundaries and volcanic zones, where heat sits close to the surface: Iceland, the Philippines, Indonesia, Kenya, the western US. Stable continental interiors — like most of the Gulf — sit far from a plate boundary, so accessible heat is much deeper and costlier to reach.',
  capacityFactor: { min: 70, max: 90, text: '70–90% (baseload-like)' },
  cost: '$40–100 / MWh, highly site-dependent',
  land: { quantity: { kind: 'landPerPower', min: 0.4, max: 3 }, text: 'Small footprint per MW' },
  metrics: [
    { label: 'Flash-steam resource', quantity: { kind: 'temperature', min: 180, max: 370 } },
    { label: 'Binary-cycle resource', quantity: { kind: 'temperature', min: 100, max: 180 } },
    { label: 'Typical well depth', quantity: { kind: 'depth', min: 1, max: 3 }, note: 'Enhanced systems drill 3–10 km' },
  ],
  countries: {
    352: 3, 360: 3, 608: 3, 554: 3, 404: 3, 188: 3, 222: 3, 558: 3, 792: 3,
    840: 2, 484: 2, 320: 2, 340: 2, 380: 2, 392: 2, 231: 2, 152: 2, 218: 2, 598: 2,
    834: 1, 232: 1, 262: 1, 604: 1, 170: 1, 156: 1, 643: 1, 276: 1, 250: 1, 300: 1, 242: 1,
  },
  hotspots: [
    { name: 'The Geysers, California', coords: [-122.76, 38.79], detail: 'The largest geothermal complex in the world.' },
    { name: 'Hellisheiði, Iceland', coords: [-21.4, 64.04], detail: 'Power and district heating for Reykjavík.' },
    { name: 'Olkaria, Kenya', coords: [36.29, -0.9], detail: 'In the Rift Valley, a pillar of Kenya’s grid.' },
    { name: 'Larderello, Italy', coords: [10.88, 43.24], detail: 'The first geothermal power plant, from 1904.' },
    { name: 'Wairakei, New Zealand', coords: [176.1, -38.63], detail: 'In the Taupō Volcanic Zone.' },
    { name: 'Salak, Indonesia', coords: [106.73, -6.74], detail: 'On Java’s volcanic arc.' },
    { name: 'Tiwi, Philippines', coords: [123.65, 13.46], detail: 'Along the Pacific Ring of Fire.' },
    { name: 'Cerro Prieto, Mexico', coords: [-115.3, 32.42], detail: 'Where the San Andreas fault system pulls apart.' },
  ],
  fit: {
    mena: { score: 1, note: "Not on a plate boundary, so conventional geothermal isn't an option here; deep EGS is still experimental and costly." },
    europe: { score: 3, note: 'Iceland and Italy lead, and Turkey is a fast-growing producer.' },
    namerica: { score: 4, note: 'California and Nevada; the US has the most installed capacity of any country.' },
    latam: { score: 3, note: "Mexico and Central America's volcanic arc; Chile has high potential." },
    ssafrica: { score: 4, note: "Kenya's Rift Valley supplies close to half the country's electricity." },
    sasia: { score: 1, note: 'Mostly stable continental crust with few high-temperature resources.' },
    easia: { score: 5, note: 'Indonesia and the Philippines rank among the top producers worldwide.' },
    oceania: { score: 4, note: 'New Zealand gets close to a fifth of its power from geothermal.' },
  },
};
